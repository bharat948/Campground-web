const request = require('supertest');
const app = require('../app');
const User = require('../models/user');
const { fetchCsrfToken, postWithCsrf, csrfHeaders } = require('./helpers/csrf');

describe('CSRF Protection', () => {
    test('GET /login includes a CSRF token in the form', async () => {
        const res = await request(app).get('/login');
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/name="_csrf"\s+value="[^"]+"/);
    });

    test('GET /register includes a CSRF token in the form', async () => {
        const res = await request(app).get('/register');
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/name="_csrf"\s+value="[^"]+"/);
    });

    test('POST /login without CSRF token is rejected', async () => {
        const res = await request(app)
            .post('/login')
            .type('form')
            .send({ username: 'nobody', password: 'wrong' });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/');
    });

    test('POST /register without CSRF token is rejected', async () => {
        const res = await request(app)
            .post('/register')
            .type('form')
            .send({ username: 'csrfuser', email: 'csrf@test.com', password: 'password123' });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/');
        const user = await User.findOne({ username: 'csrfuser' });
        expect(user).toBeNull();
    });

    test('POST /register with valid CSRF token succeeds', async () => {
        const agent = request.agent(app);
        const res = await postWithCsrf(agent, '/register', {
            username: 'csrfvalid',
            email: 'csrfvalid@test.com',
            password: 'password123',
        });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/campgrounds');
        const user = await User.findOne({ username: 'csrfvalid' });
        expect(user).not.toBeNull();
    });

    test('POST with token from a different session is rejected', async () => {
        const agentA = request.agent(app);
        const agentB = request.agent(app);
        const token = await fetchCsrfToken(agentA, '/register');

        const res = await agentB
            .post('/register')
            .type('form')
            .send({
                username: 'crosssession',
                email: 'cross@test.com',
                password: 'password123',
                _csrf: token,
            });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/');
        const user = await User.findOne({ username: 'crosssession' });
        expect(user).toBeNull();
    });

    test('POST with invalid CSRF token is rejected gracefully', async () => {
        const agent = request.agent(app);
        await agent.get('/register');

        const res = await agent
            .post('/register')
            .type('form')
            .send({
                username: 'badtoken',
                email: 'bad@test.com',
                password: 'password123',
                _csrf: 'invalid-token-value',
            });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBeDefined();
        const user = await User.findOne({ username: 'badtoken' });
        expect(user).toBeNull();
    });

    test('POST /login with valid CSRF token authenticates via Passport', async () => {
        const agent = request.agent(app);
        await postWithCsrf(agent, '/register', {
            username: 'passportcsrf',
            email: 'passportcsrf@test.com',
            password: 'password123',
        });
        await agent.get('/logout');

        const loginRes = await postWithCsrf(agent, '/login', {
            username: 'passportcsrf',
            password: 'password123',
        });
        expect(loginRes.statusCode).toBe(302);
        expect(loginRes.headers.location).toBe('/campgrounds');

        const protectedRes = await agent.get('/campgrounds/new');
        expect(protectedRes.statusCode).toBe(200);
    });

    test('DELETE without CSRF header is rejected', async () => {
        const agent = request.agent(app);
        await postWithCsrf(agent, '/register', {
            username: 'delcsrf',
            email: 'delcsrf@test.com',
            password: 'password123',
        });

        const res = await agent.delete('/campgrounds/000000000000000000000000');
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/');
    });

    test('DELETE with valid CSRF header proceeds past CSRF check', async () => {
        const agent = request.agent(app);
        await postWithCsrf(agent, '/register', {
            username: 'delok',
            email: 'delok@test.com',
            password: 'password123',
        });
        const User = require('../models/user');
        const Campground = require('../models/campground');
        const user = await User.findOne({ username: 'delok' });
        const campground = new Campground({
            title: 'CSRF Delete Camp',
            location: 'Austin, TX',
            description: 'Test',
            price: 10,
            author: user._id,
            geometry: { type: 'Point', coordinates: [-97.7431, 30.2672] },
            images: [{ url: 'https://example.com/img.jpg', filename: 'test/img' }],
        });
        await campground.save();
        const token = await fetchCsrfToken(agent, '/campgrounds/new');

        const res = await agent
            .delete(`/campgrounds/${campground._id}`)
            .set(csrfHeaders(token));
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toBe('/campgrounds');
    });
});
