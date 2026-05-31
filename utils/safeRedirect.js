/**
 * Returns a same-origin path safe for res.redirect, or fallback.
 * Blocks protocol-relative and absolute URLs.
 */
function getSafeRedirectUrl(url, fallback = '/campgrounds') {
    if (!url || typeof url !== 'string') {
        return fallback;
    }
    const trimmed = url.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
        return fallback;
    }
    return trimmed;
}

module.exports = { getSafeRedirectUrl };
