const request = require('supertest');
const app = require('../app');
const Campground = require('../models/campground');
const Review = require('../models/review');
const Notification = require('../models/notification');
const User = require('../models/user');
const { postWithCsrf, deleteWithCsrf } = require('./helpers/csrf');

let agent;
let otherAgent;
let testUser;
let otherUser;
let testCampground;
let testReview;

const showPath = (campId) => `/campgrounds/${campId}`;

beforeEach(async () => {
    agent = request.agent(app);
    otherAgent = request.agent(app);

    await postWithCsrf(agent, '/register', {
        username: 'notifTester',
        email: 'notif@test.com',
        password: 'password123'
    });

    await postWithCsrf(otherAgent, '/register', {
        username: 'notifOther',
        email: 'notif-other@test.com',
        password: 'password123'
    });

    testUser = await User.findOne({ username: 'notifTester' });
    otherUser = await User.findOne({ username: 'notifOther' });
    if (!testUser || !otherUser) throw new Error('Test users were not created');

    testCampground = new Campground({
        title: 'Notification Test Camp',
        location: 'Austin, TX',
        description: 'A campground for notification tests',
        price: 25,
        author: testUser._id,
        geometry: { type: 'Point', coordinates: [-97.7431, 30.2672] },
        images: [{ url: 'https://example.com/img.jpg', filename: 'test/img' }]
    });
    await testCampground.save();

    testReview = new Review({
        body: 'Great campground for notifications!',
        rating: 5,
        author: testUser._id,
        campground: testCampground._id,
        likes: []
    });
    await testReview.save();
    testCampground.reviews.push(testReview._id);
    await testCampground.save();
});

describe('Notification creation', () => {
    test('like by other user creates notification for review author', async () => {
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );

        const notifications = await Notification.find({ recipient: testUser._id });
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('like');
        expect(notifications[0].read).toBe(false);
        expect(notifications[0].actor.equals(otherUser._id)).toBe(true);
        expect(notifications[0].review.equals(testReview._id)).toBe(true);
    });

    test('unlike removes like notification', async () => {
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

        const count = await Notification.countDocuments({ recipient: testUser._id });
        expect(count).toBe(0);
    });

    test('like own review creates no notification', async () => {
        await postWithCsrf(
            agent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );

        const count = await Notification.countDocuments({ recipient: testUser._id });
        expect(count).toBe(0);
    });

    test('reply by other user creates notification', async () => {
        const res = await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies`,
            { 'reply[body]': 'Nice review!' },
            showPath(testCampground._id)
        );
        expect(res.statusCode).toBe(302);

        const updatedReview = await Review.findById(testReview._id);
        expect(updatedReview.replies.length).toBe(1);

        const notifications = await Notification.find({ recipient: testUser._id });
        expect(notifications.length).toBe(1);
        expect(notifications[0].type).toBe('reply');
        expect(notifications[0].read).toBe(false);
        expect(notifications[0].reply).toBeDefined();
        expect(notifications[0].actor.equals(otherUser._id)).toBe(true);
    });

    test('reply to own review creates no notification', async () => {
        await postWithCsrf(
            agent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/replies`,
            { 'reply[body]': 'Replying to myself' },
            showPath(testCampground._id)
        );

        const count = await Notification.countDocuments({ recipient: testUser._id });
        expect(count).toBe(0);
    });

    test('delete review removes its notifications', async () => {
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );

        await deleteWithCsrf(
            agent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}`,
            showPath(testCampground._id)
        );

        const count = await Notification.countDocuments({ review: testReview._id });
        expect(count).toBe(0);
    });
});

describe('Notification actions', () => {
    test('POST mark read sets read to true and redirects to campground', async () => {
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );

        const notification = await Notification.findOne({ recipient: testUser._id });

        const res = await postWithCsrf(
            agent,
            `/notifications/${notification._id}/read`,
            {},
            '/campgrounds'
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe(`/campgrounds/${testCampground._id}`);

        const updated = await Notification.findById(notification._id);
        expect(updated.read).toBe(true);
    });

    test('non-recipient cannot mark notification read', async () => {
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );

        const notification = await Notification.findOne({ recipient: testUser._id });

        const res = await postWithCsrf(
            otherAgent,
            `/notifications/${notification._id}/read`,
            {},
            '/campgrounds'
        );
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/campgrounds');

        const updated = await Notification.findById(notification._id);
        expect(updated.read).toBe(false);
    });

    test('authenticated page includes unread count in navbar', async () => {
        await postWithCsrf(
            otherAgent,
            `/campgrounds/${testCampground._id}/reviews/${testReview._id}/like`,
            {},
            showPath(testCampground._id)
        );

        const res = await agent.get('/campgrounds');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('yc-notifications-badge');
        expect(res.text).toContain('>1<');
    });
});
