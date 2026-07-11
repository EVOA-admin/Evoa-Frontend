/**
 * keepAliveStore.js
 *
 * Module-level singleton stores for all KeepAlive state.
 * Stored OUTSIDE React so they survive any component remount.
 *
 * This is critical for production correctness:
 *   - In production, DashboardLayout can re-mount when auth state changes
 *     (token refresh, role sync) which normally resets React component state.
 *   - By keeping hasMounted and scrollPositions at module scope, they survive
 *     any number of React tree remounts.
 */

/**
 * Which pages have ever been visited (lazy-mount tracking).
 * Key: scrollKey string. Value: true.
 */
export const mountedPages = new Set();

/**
 * Saved scroll positions per page.
 * Key: scrollKey string. Value: number (pixels from top).
 */
export const scrollStore = {};
