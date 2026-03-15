/**
 * Ensures a URL has a proper http:// or https:// prefix.
 * Without this, browsers treat bare URLs like "example.com" as relative
 * paths (e.g. localhost:5173/example.com) instead of external links.
 *
 * @param {string} url - The URL to normalize
 * @returns {string} - URL with http:// prefix if no protocol was present
 */
export function ensureUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
        return url;
    }
    return `https://${url}`;
}

export default ensureUrl;
