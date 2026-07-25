import { lazy, Suspense, memo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from './AppShell';
import PageKeepAlive from './PageKeepAlive';

/*
 * Lazy-import every major page exactly once.
 * MUST be at module scope — never inside a component or useMemo.
 * If defined inside a component, React creates a new lazy reference every
 * render, causing Suspense to throw and remount the subtree.
 */
const Startup       = lazy(() => import('../../modules/startup/startup'));
const Investor      = lazy(() => import('../../modules/investor/investor'));
const Incubator     = lazy(() => import('../../modules/incubator/incubator'));
const Viewer        = lazy(() => import('../../modules/viewer/viewer'));
const Explore       = lazy(() => import('../../modules/explore/explore'));
const Notifications = lazy(() => import('../../modules/notifications/notifications'));
const Profile       = lazy(() => import('../../modules/profile/profile'));

const PageSpinner = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{
      width: 28, height: 28,
      border: '2.5px solid rgba(59,130,246,0.15)',
      borderTopColor: '#3B82F6',
      borderRadius: '50%',
      animation: 'ka-spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes ka-spin { to { transform: rotate(360deg) } }`}</style>
  </div>
);

/*
 * KeepAlive paths — ALL paths that are managed by PageKeepAlive.
 * These are the only paths where the AppShell + KeepAlive tree is VISIBLE.
 * On any other path the tree is hidden (display:none) but NEVER unmounted.
 */
// Role home paths that are KeepAlive-managed — matched EXACTLY (not as a
// prefix) to prevent /startup/profile etc. from being treated as KeepAlive.
const KEEPALIVE_EXACT = ['/startup', '/investor', '/incubator', '/viewer'];

// Paths matched as prefixes — these pages own their entire sub-tree.
const KEEPALIVE_PREFIX = ['/explore', '/notifications', '/profile'];

// Dynamic sub-paths under role homes that break OUT of KeepAlive mode.
// Any route starting with one of these is rendered via <Outlet />, not AppShell.
const DYNAMIC_SUBPATHS = [
  '/startup/profile',
  '/investor/profile',
  '/incubator/profile',
  '/viewer/profile',
];

/**
 * isKeepAlivePath — returns true when the current path belongs to a
 * KeepAlive page so the AppShell + KeepAlive section is visible.
 *
 * Role home paths (/startup, /investor, /incubator, /viewer) are matched
 * EXACTLY so that sub-paths like /startup/profile fall through to the
 * Outlet and render the correct dynamic page instead of the home feed.
 */
function isKeepAlivePath(pathname) {
  // Dynamic sub-paths always break out of KeepAlive mode
  if (DYNAMIC_SUBPATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return false;
  }
  // Exact match for role home paths
  if (KEEPALIVE_EXACT.includes(pathname)) return true;
  // Prefix match for explore / notifications / profile
  return KEEPALIVE_PREFIX.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );
}

/**
 * KeepAlivePages — memoised so that auth state changes (token refresh,
 * user updates, syncing) that cause DashboardLayout to re-render do NOT
 * propagate into this subtree.  Only re-renders when userRole changes.
 */
const KeepAlivePages = memo(function KeepAlivePages({ userRole }) {
  const location = useLocation();
  const normalizedRole = (userRole || '').toLowerCase();
  const path = location.pathname;

  return (
    <>
      {(normalizedRole === 'startup' || path === '/startup') && (
        <PageKeepAlive matchPaths="/startup" scrollKey="home-startup">
          <Suspense fallback={<PageSpinner />}><Startup /></Suspense>
        </PageKeepAlive>
      )}
      {(normalizedRole === 'investor' || path === '/investor') && (
        <PageKeepAlive matchPaths="/investor" scrollKey="home-investor">
          <Suspense fallback={<PageSpinner />}><Investor /></Suspense>
        </PageKeepAlive>
      )}
      {(normalizedRole === 'incubator' || path === '/incubator') && (
        <PageKeepAlive matchPaths="/incubator" scrollKey="home-incubator">
          <Suspense fallback={<PageSpinner />}><Incubator /></Suspense>
        </PageKeepAlive>
      )}
      {(normalizedRole === 'viewer' || path === '/viewer') && (
        <PageKeepAlive matchPaths="/viewer" scrollKey="home-viewer">
          <Suspense fallback={<PageSpinner />}><Viewer /></Suspense>
        </PageKeepAlive>
      )}

      <PageKeepAlive matchPaths="/explore" scrollKey="explore">
        <Suspense fallback={<PageSpinner />}><Explore /></Suspense>
      </PageKeepAlive>

      <PageKeepAlive matchPaths="/notifications" scrollKey="notifications">
        <Suspense fallback={<PageSpinner />}><Notifications /></Suspense>
      </PageKeepAlive>

      <PageKeepAlive matchPaths="/profile" scrollKey="profile">
        <Suspense fallback={<PageSpinner />}><Profile /></Suspense>
      </PageKeepAlive>
    </>
  );
});

/**
 * DashboardLayout
 *
 * The SINGLE persistent shell for the entire authenticated experience.
 *
 * ─── Key architecture decision ────────────────────────────────────────────
 *
 * ALL authenticated routes (home, explore, notifications, profile, own-profile
 * edit, inbox, pitch, battlefield) are nested CHILDREN of this route.
 *
 * This guarantees DashboardLayout is NEVER unmounted during authenticated
 * navigation — which is the fundamental requirement for KeepAlive to work.
 *
 * The rendering strategy is:
 *
 *   • KeepAlive paths (home/explore/notifications/profile-feed):
 *       AppShell is visible.  Pages are kept in DOM with display:none when
 *       inactive.  React state, scroll, posts, videos all preserved.
 *
 *   • Dynamic paths (own-profile edit, inbox, pitch, battlefield):
 *       AppShell section is hidden (display:none but NOT unmounted).
 *       <Outlet /> renders the page WITHOUT the AppShell wrapper — these
 *       pages supply their own AppShell/layout as needed.
 *
 * The crucial difference from the old architecture:
 *   OLD: Profile/Inbox routes were OUTSIDE DashboardLayout → unmounted it on nav.
 *   NEW: All routes are INSIDE DashboardLayout → it never unmounts.
 */
export default function DashboardLayout() {
  const { userRole } = useAuth();
  const location = useLocation();

  // True when the active route is NOT a KeepAlive-managed page.
  // This hides (but never unmounts) the AppShell + KeepAlive tree.
  const showOutlet = !isKeepAlivePath(location.pathname);

  return (
    <>
      {/*
       * ── AppShell + KeepAlive section ─────────────────────────────────────
       * Hidden (display:none) when on a dynamic route but NEVER unmounted.
       * This preserves all KeepAlive page state — posts, scroll, videos, etc.
       */}
      <div style={showOutlet ? { display: 'none' } : undefined}>
        <AppShell>
          <KeepAlivePages userRole={userRole} />
        </AppShell>
      </div>

      {/*
       * ── Dynamic page section ─────────────────────────────────────────────
       * Pages that supply their own layout (own-profile, inbox, pitch, etc.)
       * render here via Outlet.  They are NOT wrapped by AppShell because
       * they import AppShell themselves.
       */}
      {showOutlet && <Outlet />}
    </>
  );
}
