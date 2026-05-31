const request = require('supertest');
const app = require('../app');
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');
const { postWithCsrf, deleteWithCsrf, fetchCsrfToken } = require('./helpers/csrf');

let agent;
let otherAgent;
let testUser;
let otherUser;
let testCampground;
let otherCampground;
let testReview;

const showPath = (campId) => `/campgrounds/${campId}`;

beforeEach(async () => {
    agent = request.agent(app);
    otherAgent = request.agent(app);

    await postWithCsrf(agent, '/register', {
        username: 'reviewTester',
        email: 'review@test.com',
        password: 'password123',
    });

    await postWithCsrf(otherAgent, '/register', {
        username: 'otherReviewer',
        email: 'other-review@test.com',
        password: 'password123',
    });

    testUser = await User.findOne({ username: 'reviewTester' });
    otherUser = await User.findOne({ username: 'otherReviewer' });
    if (!testUser || !otherUser) throw new Error('Test users were not created');

    testCampground = new Campground({
        title: 'Review Test Camp',
        location: 'Austin, TX',
        description: 'A campground for review tests',
        price: 25,
        author: testUser._id,
        geometry: { type: 'Point', coordinates: [-97.7431, 30.2672] },
        images: [{ url: 'https://example.com/img.jpg', filename: 'test/img' }]
    });
    await testCampground.save();

    otherCampground = new Campground({
        title: 'Other Camp',
        location: 'Dallas, TX',
        description: 'Another campground',
        price: 30,
        author: otherUser._id,
        geometry: { type: 'Point', coordinates: [-96.7970, 32.7767] },
        images: [{ url: 'https://example.com/other.jpg', filename: 'test/other' }]
    });
    await otherCampground.save();

    testReview = new Review({
        body: 'Great campground!',
        rating: 5,
        author: testUser._id,
        campground: testCampground._id,
        likes: []
    });
    await testReview.save();
    testCampground.reviews.push(testReview._id);
    await testCampground.save();
});

describe('Review Likes', () => {
    test('POST like requires auth', async () => {
        const unauthAgent = request.agent(app);
        const token = await fetchCsrfToken(unauthAgent, '/login');
        const res = await unauthAgent
            .post(`/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`)
            .type('form')
            .send({ _csrf: token });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toMatch(/login/);
    });

    test('POST like adds user to likes array', async () => {
        const res = await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe(`/campgrounds/${testCampground._id}`);

        const updated = await Review.findById(testReview._id);
        expect(updated.likes.some(id => id.equals(otherUser._id))).toBe(true);
        expect(updated.likes.length).toBe(1);
    });

    test('POST like again removes user (toggle)', async () => {
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );

        const updated = await Review.findById(testReview._id);
        expect(updated.likes.some(id => id.equals(otherUser._id))).toBe(false);
        expect(updated.likes.length).toBe(0);
    });

    test('POST like on review from wrong campground is denied', async () => {
        const res = await postWithCsrf(
            otherAgent,
            `/campgrounds/${otherCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(otherCampground._id)
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe(`/campgrounds/${otherCampground._id}`);

        const updated = await Review.findById(testReview._id);
        expect(updated.likes.length).toBe(0);
    });
});

describe('Review Replies', () => {
    test('POST reply requires auth', async () => {
        const unauthAgent = request.agent(app);
        const token = await fetchCsrfToken(unauthAgent, '/login');
        const res = await unauthAgent
            .post(`/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies`)
            .type('form')
            .send({ 'reply[body]': 'Nice review!', _csrf: token });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toMatch(/login/);
    });

    test('POST reply creates subdoc with correct author and body', async () => {
        const res = await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies`,
            { 'reply[body]': 'Thanks for sharing!' },
            showPath(testCampground._id)
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe(`/campgrounds/${testCampground._id}`);

        const updated = await Review.findById(testReview._id);
        expect(updated.replies.length).toBe(1);
        expect(updated.replies[0].body).toBe('Thanks for sharing!');
        expect(updated.replies[0].author.equals(otherUser._id)).toBe(true);
    });

    test('DELETE own reply succeeds', async () => {
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies`,
            { 'reply[body]': 'Reply to delete' },
            showPath(testCampground._id)
        );

        let review = await Review.findById(testReview._id);
        const replyId = review.replies[0]._id;

        const res = await deleteWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies/${replyId}`,
            showPath(testCampground._id)
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe(`/campgrounds/${testCampground._id}`);

        review = await Review.findById(testReview._id);
        expect(review.replies.length).toBe(0);
    });

    test('DELETE someone else reply is denied', async () => {
        await postWithCsrf(
            agent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies`,
            { 'reply[body]': 'My reply' },
            showPath(testCampground._id)
        );

        let review = await Review.findById(testReview._id);
        const replyId = review.replies[0]._id;

        const res = await deleteWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies/${replyId}`,
            showPath(testCampground._id)
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe(`/campgrounds/${testCampground._id}`);

        review = await Review.findById(testReview._id);
        expect(review.replies.length).toBe(1);
    });

    test('POST reply with empty body is rejected', async () => {
        const res = await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies`,
            { 'reply[body]': '   ' },
            showPath(testCampground._id)
        );
        expect(res.statusCode).toBe(400);

        const updated = await Review.findById(testReview._id);
        expect(updated.replies.length).toBe(0);
    });

    test('POST reply on review from wrong campground is denied', async () => {
        const res = await postWithCsrf(
            otherAgent,
            `/campgrounds/${otherCampground._id}/reviews/${testReview._id}/replies`,
            { 'reply[body]': 'Wrong campground reply' },
            showPath(otherCampground._id)
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe(`/campgrounds/${otherCampground._id}`);

        const updated = await Review.findById(testReview._id);
        expect(updated.replies.length).toBe(0);
    });
});
