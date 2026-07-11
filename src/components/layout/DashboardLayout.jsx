import { lazy, Suspense, memo, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from './AppShell';
import PageKeepAlive from './PageKeepAlive';

/*
 * Lazy-import every major page exactly once.
 * React.lazy guarantees the chunk is downloaded only when the page is first
 * visited.  After that the module stays cached by the browser — no second
 * network request, ever.
 *
 * IMPORTANT: These must be defined at MODULE scope (outside any component),
 * not inside a component or useMemo. If defined inside a component, React
 * creates a new lazy reference every render which causes Suspense to throw
 * and remount the subtree — the root cause of the production remount bug.
 */
const Startup       = lazy(() => import('../../modules/startup/startup'));
const Investor      = lazy(() => import('../../modules/investor/investor'));
const Incubator     = lazy(() => import('../../modules/incubator/incubator'));
const Viewer        = lazy(() => import('../../modules/viewer/viewer'));
const Explore       = lazy(() => import('../../modules/explore/explore'));
const Notifications = lazy(() => import('../../modules/notifications/notifications'));
const Profile       = lazy(() => import('../../modules/profile/profile'));

/*
 * Thin Suspense fallback that shows ONLY inside the page content area.
 * It never causes the shell (sidebar / bottom-nav) to flash or disappear.
 */
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
 * These path prefixes use React Router's <Outlet /> because they have dynamic
 * URL segments (/pitch/:id) or are one-off screens that don't benefit from
 * KeepAlive persistence.
 */
const DYNAMIC_PATHS = [
  '/pitch',
  '/battlefield',
  '/battleground',
  '/investor-payment',
];

/**
 * KeepAlivePages
 *
 * Extracted into its own memoised component so that auth state changes
 * (user object updates, token refreshes, syncing flag changes) that happen
 * in the parent DashboardLayout do NOT cause this subtree to re-render.
 *
 * This is the production fix for the remount issue:
 *   - DashboardLayout re-renders whenever useAuth() values change
 *   - Without memo, the entire KeepAlive tree re-renders on every auth update
 *   - With memo, KeepAlivePages only re-renders when userRole or isDynamic changes
 *   - Since userRole is stable after initial sync, this effectively freezes
 *     the KeepAlive tree during normal navigation
 */
const KeepAlivePages = memo(function KeepAlivePages({ userRole, isDynamic }) {
  return (
    <div style={isDynamic ? { display: 'none' } : undefined}>

      {/* ── Role-specific Home feed ── */}
      {userRole === 'startup' && (
        <PageKeepAlive matchPaths="/startup" scrollKey="home-startup">
          <Suspense fallback={<PageSpinner />}><Startup /></Suspense>
        </PageKeepAlive>
      )}
      {userRole === 'investor' && (
        <PageKeepAlive matchPaths="/investor" scrollKey="home-investor">
          <Suspense fallback={<PageSpinner />}><Investor /></Suspense>
        </PageKeepAlive>
      )}
      {userRole === 'incubator' && (
        <PageKeepAlive matchPaths="/incubator" scrollKey="home-incubator">
          <Suspense fallback={<PageSpinner />}><Incubator /></Suspense>
        </PageKeepAlive>
      )}
      {userRole === 'viewer' && (
        <PageKeepAlive matchPaths="/viewer" scrollKey="home-viewer">
          <Suspense fallback={<PageSpinner />}><Viewer /></Suspense>
        </PageKeepAlive>
      )}

      {/* ── Shared pages (all roles) ── */}
      <PageKeepAlive matchPaths="/explore" scrollKey="explore">
        <Suspense fallback={<PageSpinner />}><Explore /></Suspense>
      </PageKeepAlive>

      <PageKeepAlive matchPaths="/notifications" scrollKey="notifications">
        <Suspense fallback={<PageSpinner />}><Notifications /></Suspense>
      </PageKeepAlive>

      <PageKeepAlive matchPaths="/profile" scrollKey="profile">
        <Suspense fallback={<PageSpinner />}><Profile /></Suspense>
      </PageKeepAlive>

    </div>
  );
});

/**
 * DashboardLayout
 *
 * The single persistent shell for the entire authenticated experience.
 *
 * KeepAlive pages (Home / Explore / Notifications / Profile) are ALL rendered
 * simultaneously inside KeepAlivePages (memoised).  The inactive ones are hidden
 * with `display:none` — they stay fully mounted, so React state, scroll position,
 * loaded posts, and video state are preserved across tab switches.
 *
 * This is the same architecture used by Instagram Web.
 *
 * Dynamic pages (Pitch reels, Battlefield, etc.) still render via <Outlet />
 * because they embed the content ID in the URL and re-render by design.
 */
export default function DashboardLayout() {
  const { userRole } = useAuth();
  const location = useLocation();

  /*
   * Is the current route a "dynamic" page that should use <Outlet />?
   * When true we also hide all KeepAlive pages so they don't interfere with
   * the full-screen dynamic layouts.
   */
  const isDynamic = DYNAMIC_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + '/'),
  );

  return (
    <AppShell>

      {/*
       * ── KeepAlive section ─────────────────────────────────────────────────
       * Wrapped in memo(KeepAlivePages) so auth state changes don't cause
       * the KeepAlive tree to re-render or remount.
       */}
      <KeepAlivePages userRole={userRole} isDynamic={isDynamic} />

      {/*
       * ── Dynamic page section ─────────────────────────────────────────────
       * Rendered by React Router's <Outlet /> for paths with URL params.
       * These pages ARE unmounted when you leave, which is intentional — a
       * reel pitch for /pitch/abc and /pitch/xyz are different screens.
       */}
      {isDynamic && <Outlet />}

    </AppShell>
  );
}
