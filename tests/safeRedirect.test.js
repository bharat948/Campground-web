const { getSafeRedirectUrl } = require('../utils/safeRedirect');

describe('getSafeRedirectUrl', () => {
    test('returns fallback for empty or external URLs', () => {
        expect(getSafeRedirectUrl()).toBe('/campgrounds');
        expect(getSafeRedirectUrl('')).toBe('/campgrounds');
        expect(getSafeRedirectUrl('https://evil.com')).toBe('/campgrounds');
        expect(getSafeRedirectUrl('//evil.com')).toBe('/campgrounds');
    });

    test('allows same-origin paths', () => {
        expect(getSafeRedirectUrl('/campgrounds/new')).toBe('/campgrounds/new');
        expect(getSafeRedirectUrl('/campgrounds/abc?tab=reviews')).toBe(
            '/campgrounds/abc?tab=reviews'
        );
    });
});
