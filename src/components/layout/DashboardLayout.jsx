import { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AppShell from './AppShell';
import PageKeepAlive from './PageKeepAlive';

/*
 * Lazy-import every major page exactly once.
 * React.lazy guarantees the chunk is downloaded only when the page is first
 * visited.  After that the module stays cached by the browser — no second
 * network request, ever.
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
 * DashboardLayout
 *
 * The single persistent shell for the entire authenticated experience.
 *
 * KeepAlive pages (Home / Explore / Notifications / Profile) are ALL rendered
 * simultaneously inside this component.  The inactive ones are hidden with
 * `display:none` — they stay fully mounted, so React state, scroll position,
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

  /*
   * Home feed path — determined by the user's role.
   */
  const homePath = userRole ? `/${userRole}` : null;

  return (
    <AppShell>

      {/*
       * ── KeepAlive section ────────────────────────────────────────────────
       * All pages are mounted once.  `display:none` when inactive.
       * Wrapped in a div that itself is hidden while a dynamic page is active
       * (keeps the DOM clean and avoids z-index conflicts with full-screen
       * dynamic pages).
       */}
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

      {/*
       * ── Dynamic page section ────────────────────────────────────────────
       * Rendered by React Router's <Outlet /> for paths with URL params.
       * These pages ARE unmounted when you leave, which is intentional — a
       * reel pitch for /pitch/abc and /pitch/xyz are different screens.
       */}
      {isDynamic && <Outlet />}

    </AppShell>
  );
}
