const request = require('supertest');

const app = require('../app');

const User = require('../models/user');

const usersController = require('../controllers/users');

const { postWithCsrf } = require('./helpers/csrf');



describe('User Authentication', () => {

    test('GET /register returns 200', async () => {

        const res = await request(app).get('/register');

        expect(res.statusCode).toBe(200);

    });



    test('POST /register creates a new user and redirects to campgrounds', async () => {

        const agent = request.agent(app);

        const res = await postWithCsrf(agent, '/register', {

            username: 'testuser',

            email: 'test@test.com',

            password: 'password123',

        });

        expect(res.statusCode).toBe(302);

        expect(res.headers.location).toBe('/campgrounds');

        const user = await User.findOne({ username: 'testuser' });

        expect(user).not.toBeNull();

        expect(user.email).toBe('test@test.com');

        const protectedRes = await agent.get('/campgrounds/new');

        expect(protectedRes.statusCode).toBe(200);

    });



    test('POST /register with missing fields redirects to /register', async () => {

        const agent = request.agent(app);

        const res = await postWithCsrf(agent, '/register', {

            username: '',

            email: '',

            password: '',

        });

        expect(res.statusCode).toBe(302);

        expect(res.headers.location).toBe('/register');

    });



    test('POST /register with duplicate email redirects to /register', async () => {

        const agent1 = request.agent(app);

        const agent2 = request.agent(app);

        await postWithCsrf(agent1, '/register', {

            username: 'user1',

            email: 'same@test.com',

            password: 'pass',

        });

        const res = await postWithCsrf(agent2, '/register', {

            username: 'user2',

            email: 'same@test.com',

            password: 'pass',

        });

        expect(res.statusCode).toBe(302);

        expect(res.headers.location).toBe('/register');

    });



    test('register passes req.login errors to next', async () => {

        const next = jest.fn();

        const req = {

            body: { username: 'u', email: 'new@new.com', password: 'password123' },

            session: { regenerate: (cb) => cb(null) },

            login: jest.fn((user, cb) => cb(new Error('login failed'))),

            flash: jest.fn(),

        };

        const res = { redirect: jest.fn() };

        jest.spyOn(User, 'register').mockResolvedValue({ _id: 'fake' });

        await usersController.register(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'login failed' }));

        User.register.mockRestore();

    });



    test('GET /login returns 200', async () => {

        const res = await request(app).get('/login');

        expect(res.statusCode).toBe(200);

    });



    test('POST /login with valid credentials logs in and redirects', async () => {

        const registerAgent = request.agent(app);

        await postWithCsrf(registerAgent, '/register', {

            username: 'loginuser',

            email: 'login@test.com',

            password: 'password123',

        });

        const agent = request.agent(app);

        const res = await postWithCsrf(agent, '/login', {

            username: 'loginuser',

            password: 'password123',

        });

        expect(res.statusCode).toBe(302);

        expect(res.headers.location).toBe('/campgrounds');

        const protectedRes = await agent.get('/campgrounds/new');

        expect(protectedRes.statusCode).toBe(200);

    });



    test('POST /login with wrong credentials redirects to /login', async () => {

        const agent = request.agent(app);

        const res = await postWithCsrf(agent, '/login', {

            username: 'nobody',

            password: 'wrong',

        });

        expect(res.statusCode).toBe(302);

        expect(res.headers.location).toBe('/login');

    });



    test('POST /login honors returnTo for protected routes', async () => {

        const registerAgent = request.agent(app);

        await postWithCsrf(registerAgent, '/register', {

            username: 'retuser',

            email: 'ret@test.com',

            password: 'password123',

        });

        const agent = request.agent(app);

        await agent.get('/logout');

        const blocked = await agent.get('/campgrounds/new');

        expect(blocked.statusCode).toBe(302);

        expect(blocked.headers.location).toBe('/login');

        const loginRes = await postWithCsrf(agent, '/login', {

            username: 'retuser',

            password: 'password123',

        });

        expect(loginRes.statusCode).toBe(302);

        expect(loginRes.headers.location).toBe('/campgrounds/new');

    });



    test('GET /logout clears session and redirects', async () => {

        const agent = request.agent(app);

        await postWithCsrf(agent, '/register', {

            username: 'outuser',

            email: 'out@test.com',

            password: 'password123',

        });

        const logoutRes = await agent.get('/logout');

        expect(logoutRes.statusCode).toBe(302);

        expect(logoutRes.headers.location).toBe('/campgrounds');

        const protectedRes = await agent.get('/campgrounds/new');

        expect(protectedRes.statusCode).toBe(302);

        expect(protectedRes.headers.location).toBe('/login');

    });



    test('GET /register redirects when already authenticated', async () => {

        const agent = request.agent(app);

        await postWithCsrf(agent, '/register', {

            username: 'authed',

            email: 'authed@test.com',

            password: 'password123',

        });

        const res = await agent.get('/register');

        expect(res.statusCode).toBe(302);

        expect(res.headers.location).toBe('/campgrounds');

    });

});

