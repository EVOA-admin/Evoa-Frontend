import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Module-level scroll position store.
 * Lives outside React — persists across ALL renders, navigations, and component
 * remounts without any re-render overhead.
 */
const scrollStore = {};

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

  // Lazy mount: don't render a page until the user first visits it.
  // Once mounted it is NEVER unmounted.
  const [hasMounted, setHasMounted] = useState(false);
  const wasActiveRef = useRef(false);

  // ── Lazy mount on first visit ──────────────────────────────────────────────
  useEffect(() => {
    if (isActive && !hasMounted) {
      setHasMounted(true);
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll save / restore ─────────────────────────────────────────────────
  useEffect(() => {
    const scrollEl = document.querySelector('.evoa-shell-content');

    if (isActive) {
      // Navigated TO this page — restore saved scroll position
      const saved = scrollStore[scrollKey];
      if (saved !== undefined && scrollEl) {
        // Use rAF so the element has had a chance to paint before we scroll
        requestAnimationFrame(() => {
          scrollEl.scrollTop = saved;
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
