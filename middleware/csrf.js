const { csrfSync } = require('csrf-sync');

const {
    invalidCsrfTokenError,
    generateToken,
    csrfSynchronisedProtection,
} = csrfSync({
    getTokenFromRequest: (req) =>
        req.body._csrf ??
        req.headers['x-csrf-token'] ??
        req.headers['X-CSRF-Token'],
});

module.exports = {
    csrfProtection: csrfSynchronisedProtection,
    generateCsrfToken: generateToken,
    invalidCsrfTokenError,
};
