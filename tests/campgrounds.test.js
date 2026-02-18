const request = require('supertest');
const app = require('../app');
const Campground = require('../models/campground');
const User = require('../models/user');

let agent;
let testUser;
let testCampground;

beforeEach(async () => {
    agent = request.agent(app);
    await agent
        .post('/register')
        .type('form')
        .send({
            username: 'campTester',
            email: 'camp@test.com',
            password: 'password123'
        });

    testUser = await User.findOne({ username: 'campTester' });
    if (!testUser) throw new Error('Test user was not created');

    testCampground = new Campground({
        title: 'Test Camp',
        location: 'Test City, TX',
        description: 'A test campground',
        price: 20,
        author: testUser._id,
        geometry: { type: 'Point', coordinates: [-97.7431, 30.2672] },
        images: [{ url: 'https://example.com/img.jpg', filename: 'test/img' }]
    });
    await testCampground.save();
});

describe('Campground Routes', () => {
    test('GET /campgrounds returns 200', async () => {
        const res = await request(app).get('/campgrounds');
        expect(res.statusCode).toBe(200);
    });

    test('GET /campgrounds/:id returns 200 for valid id', async () => {
        const res = await request(app).get(`/campgrounds/${testCampground._id}`);
        expect(res.statusCode).toBe(200);
    });

    test('GET /campgrounds/:id returns 302 redirect for invalid id', async () => {
        const res = await request(app).get('/campgrounds/000000000000000000000000');
        expect(res.statusCode).toBe(302);
    });

    test('GET /campgrounds/new redirects to login if not authenticated', async () => {
        const res = await request(app).get('/campgrounds/new');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toMatch(/login/);
    });

    test('GET /campgrounds/new returns 200 when authenticated', async () => {
        const res = await agent.get('/campgrounds/new');
        expect(res.statusCode).toBe(200);
    });

    test('DELETE /campgrounds/:id redirects to /campgrounds on success', async () => {
        const res = await agent
            .delete(`/campgrounds/${testCampground._id}`)
            .send();
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/campgrounds');
    });

    test('DELETE /campgrounds/:id by non-author gets denied', async () => {
        const agent2 = request.agent(app);
        await agent2.post('/register').type('form').send({
            username: 'otherUser',
            email: 'other@test.com',
            password: 'password123'
        });
        const res = await agent2.delete(`/campgrounds/${testCampground._id}`);
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toContain(testCampground._id.toString());
    });
});
