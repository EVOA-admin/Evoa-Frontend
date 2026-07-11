import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { mountedPages, scrollStore } from './keepAliveStore';

/**
 * PageKeepAlive
 *
 * Keeps a page component permanently mounted in the DOM.
 * When the page is not the active route it is hidden with `display:none`
 * (invisible, no layout, zero GPU cost) but fully alive in React's tree.
 *
 * This is the same technique used by Instagram Web, LinkedIn, and X/Twitter
 * to preserve feed scroll position, loaded posts, and component state across
 * tab/navigation changes.
 *
 * ── Production-safe design ─────────────────────────────────────────────────
 * The naive implementation stores `hasMounted` in React state, which resets
 * to `false` whenever the parent component (DashboardLayout) remounts.
 * In production, DashboardLayout remounts on auth state changes (token refresh,
 * role sync completion) — causing every KeepAlive page to unmount and lose
 * all state.
 *
 * Fix: `hasMounted` is tracked in the module-level `mountedPages` Set
 * (see keepAliveStore.js), which lives completely outside React.  It survives
 * any number of component remounts, hot reloads, and production builds.
 *
 * Props:
 *   matchPaths  — string | string[]  — one or more path prefixes that make
 *                 this page "active". Compared with location.pathname.
 *   scrollKey   — string             — unique key for storing scroll position.
 *   children    — React node         — the page to keep alive.
 */
export default function PageKeepAlive({ matchPaths, scrollKey, children }) {
  const location = useLocation();
  const paths = Array.isArray(matchPaths) ? matchPaths : [matchPaths];

  const isActive = paths.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
  );

  // ── Production-safe lazy mount ───────────────────────────────────────────
  // hasMounted is seeded from the module-level Set so it survives any
  // React remount of this component (e.g. caused by DashboardLayout
  // re-rendering due to auth state changes in production).
  const [hasMounted, setHasMounted] = useState(() => mountedPages.has(scrollKey));
  const wasActiveRef = useRef(false);

  // Mark as mounted the first time this page becomes active
  useEffect(() => {
    if (isActive && !mountedPages.has(scrollKey)) {
      mountedPages.add(scrollKey);
      setHasMounted(true);
    } else if (!hasMounted && mountedPages.has(scrollKey)) {
      // Module store says it was visited but React state was reset (remount) — sync back
      setHasMounted(true);
    }
  }, [isActive, scrollKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll save / restore ─────────────────────────────────────────────────
  useEffect(() => {
    const scrollEl = document.querySelector('.evoa-shell-content');

    if (isActive) {
      // Navigated TO this page — restore saved scroll position
      const saved = scrollStore[scrollKey];
      if (saved !== undefined && scrollEl) {
        // Double rAF: first frame lets React paint the new tree,
        // second frame applies the scroll after layout is complete.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollEl.scrollTop = saved;
          });
        });
      }
    } else if (wasActiveRef.current) {
      // Navigated AWAY from this page — save current scroll position
      if (scrollEl) {
        scrollStore[scrollKey] = scrollEl.scrollTop;
      }
    }

    wasActiveRef.current = isActive;
  }, [isActive, scrollKey]);

  if (!hasMounted) return null;

  return (
    <div
      data-keepalive-page={scrollKey}
      style={
        isActive
          ? { minHeight: '100%' }
          : {
              display: 'none',
              // Extra safety: remove from accessibility tree when hidden
              visibility: 'hidden',
              pointerEvents: 'none',
            }
      }
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
}
