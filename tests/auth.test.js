const request = require('supertest');
const app = require('../app');
const User = require('../models/user');

describe('User Authentication', () => {
    test('GET /register returns 200', async () => {
        const res = await request(app).get('/register');
        expect(res.statusCode).toBe(200);
    });

    test('POST /register creates a new user and redirects', async () => {
        const res = await request(app)
            .post('/register')
            .type('form')
            .send({ username: 'testuser', email: 'test@test.com', password: 'password123' });
        expect(res.statusCode).toBe(302);
        const user = await User.findOne({ username: 'testuser' });
        expect(user).not.toBeNull();
        expect(user.email).toBe('test@test.com');
    });

    test('POST /register with duplicate email fails', async () => {
        await request(app)
            .post('/register')
            .type('form')
            .send({ username: 'user1', email: 'same@test.com', password: 'pass' });
        const res = await request(app)
            .post('/register')
            .type('form')
            .send({ username: 'user2', email: 'same@test.com', password: 'pass' });
        expect(res.statusCode).toBe(302);
    });

    test('GET /login returns 200', async () => {
        const res = await request(app).get('/login');
        expect(res.statusCode).toBe(200);
    });

    test('POST /login with wrong credentials redirects to /login', async () => {
        const res = await request(app)
            .post('/login')
            .type('form')
            .send({ username: 'nobody', password: 'wrong' });
        expect(res.statusCode).toBe(302);
        expect(res.headers.location).toMatch(/login/);
    });
});
