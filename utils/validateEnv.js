function validateEnv(env = process.env) {
    const nodeEnv = env.NODE_ENV || 'development';

    if (nodeEnv !== 'production') {
        return;
    }

    const missing = [];

    if (!env.SESSION_SECRET?.trim()) {
        missing.push('SESSION_SECRET');
    }
    if (!env.MONGO_URL?.trim()) {
        missing.push('MONGO_URL');
    }
    if (!env.CLOUDINARY_CLOUD_NAME?.trim()) {
        missing.push('CLOUDINARY_CLOUD_NAME');
    }
    if (!env.CLOUDINARY_KEY?.trim()) {
        missing.push('CLOUDINARY_KEY');
    }
    if (!env.CLOUDINARY_SECRET?.trim()) {
        missing.push('CLOUDINARY_SECRET');
    }
    if (!env.MAPBOX_TOKEN?.trim()) {
        missing.push('MAPBOX_TOKEN');
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variable(s) in production: ${missing.join(', ')}`
        );
    }
}

module.exports = { validateEnv };
