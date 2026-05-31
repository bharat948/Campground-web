const { validateEnv } = require('../utils/validateEnv');

describe('validateEnv', () => {
    test('passes in development without SESSION_SECRET', () => {
        expect(() => validateEnv({ NODE_ENV: 'development' })).not.toThrow();
    });

    test('passes in test without SESSION_SECRET', () => {
        expect(() => validateEnv({ NODE_ENV: 'test' })).not.toThrow();
    });

    const productionEnv = {
        NODE_ENV: 'production',
        SESSION_SECRET: 'a-real-secret',
        MONGO_URL: 'mongodb://localhost:27017/yelpcamp',
        CLOUDINARY_CLOUD_NAME: 'my-cloud',
        CLOUDINARY_KEY: '123456',
        CLOUDINARY_SECRET: 'cloudinary-secret',
        MAPBOX_TOKEN: 'pk.test-token'
    };

    test('passes in production with required vars', () => {
        expect(() => validateEnv(productionEnv)).not.toThrow();
    });

    test('throws in production without SESSION_SECRET', () => {
        expect(() => validateEnv({
            NODE_ENV: 'production',
            MONGO_URL: 'mongodb://localhost:27017/yelpcamp'
        })).toThrow(/SESSION_SECRET/);
    });

    test('throws in production without MONGO_URL', () => {
        expect(() => validateEnv({
            NODE_ENV: 'production',
            SESSION_SECRET: 'a-real-secret'
        })).toThrow(/MONGO_URL/);
    });

    test('throws in production when SESSION_SECRET is whitespace only', () => {
        expect(() => validateEnv({
            ...productionEnv,
            SESSION_SECRET: '   '
        })).toThrow(/SESSION_SECRET/);
    });

    test('throws in production without CLOUDINARY_SECRET', () => {
        const env = { ...productionEnv };
        delete env.CLOUDINARY_SECRET;
        expect(() => validateEnv(env)).toThrow(/CLOUDINARY_SECRET/);
    });

    test('throws in production without MAPBOX_TOKEN', () => {
        const env = { ...productionEnv };
        delete env.MAPBOX_TOKEN;
        expect(() => validateEnv(env)).toThrow(/MAPBOX_TOKEN/);
    });
});
