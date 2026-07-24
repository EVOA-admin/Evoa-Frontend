import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/layout';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';

// Landing is eagerly imported — it IS the root page and must render immediately
import Landing from '../modules/landing/landingpage';

// ── Full-screen spinner (for auth / onboarding pages)
const FullSpinner = () => (
  <div style={{ minHeight: '100vh', background: '#060607', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 40, height: 40, border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ── Page spinner (for pages rendered inside DashboardLayout via Outlet)
const PageSpinner = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 32, height: 32, border: '3px solid rgba(59,130,246,0.15)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// Auth pages
const Login              = lazy(() => import('../modules/auth/login'));
const Register           = lazy(() => import('../modules/auth/register'));
const ForgetPassword     = lazy(() => import('../modules/auth/forget-password'));
const VerifyOTP          = lazy(() => import('../modules/auth/verify-otp'));
const CreateNewPassword  = lazy(() => import('../modules/auth/create-new-password'));
const VerifyEmail        = lazy(() => import('../modules/auth/verify-email'));
const ChoiceRole         = lazy(() => import('../modules/auth/choice-role'));
const StartupRegistration   = lazy(() => import('../modules/auth/startup-registration'));
const InvestorRegistration  = lazy(() => import('../modules/auth/investor-registration'));
const IncubatorRegistration = lazy(() => import('../modules/auth/incubator-registration'));
const ViewerRegistration    = lazy(() => import('../modules/auth/viewer-registration'));
const AuthCallback       = lazy(() => import('../modules/auth/auth-callback'));

// Public info pages
const Blog              = lazy(() => import('../modules/pages/blog'));
const BlogArticle       = lazy(() => import('../modules/pages/blog-article'));
const PitchUs           = lazy(() => import('../modules/pages/pitch-us'));
const Portfolio         = lazy(() => import('../modules/pages/portfolio'));
const About             = lazy(() => import('../modules/pages/about'));
const Contact           = lazy(() => import('../modules/pages/contact'));
const PrivacyPolicy     = lazy(() => import('../modules/pages/privacy-policy'));
const AmbassadorProgram = lazy(() => import('../modules/pages/ambassador-program'));
const Pricing           = lazy(() => import('../modules/pages/pricing'));

// ── Pages rendered INSIDE DashboardLayout (via Outlet) ───────────────────────
// These pages supply their own AppShell/layout. DashboardLayout only hides the
// KeepAlive section and renders the page via <Outlet /> without an extra shell.
const ReelPitch       = lazy(() => import('../modules/pitch/reel-pitch'));
const InvestorPayment = lazy(() => import('../modules/pages/investor-payment'));
const Battlefield     = lazy(() => import('../modules/pages/battlefield'));
const ViewerProfile   = lazy(() => import('../modules/viewer/viewer-profile'));
const StartupProfile  = lazy(() => import('../modules/startup/startup-profile'));
const InvestorProfile = lazy(() => import('../modules/investor/investor-profile'));
const IncubatorProfile = lazy(() => import('../modules/incubator/incubator-profile'));
const Inbox           = lazy(() => import('../modules/chat/inbox'));
const Conversation    = lazy(() => import('../modules/chat/conversation'));
const EventPage       = lazy(() => import('../modules/event/event'));

// Public profile — accessible by guests (no auth required)
const UserPublicProfile = lazy(() => import('../modules/profile/user-public-profile'));

const Auth = ({ children, fallback = <FullSpinner /> }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

const Page = ({ children, fallback = <PageSpinner /> }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

export default function AppRoutes() {
  return (
    <Routes>

      {/* ── Public / Auth routes ─────────────────────────────────────────── */}
      <Route path="/" element={<Layout />}>
        <Route index element={<PublicRoute><Landing /></PublicRoute>} />

        <Route path="login"              element={<PublicRoute><Auth><Login /></Auth></PublicRoute>} />
        <Route path="register"           element={<PublicRoute><Auth><Register /></Auth></PublicRoute>} />
        <Route path="forget-password"    element={<PublicRoute><Auth><ForgetPassword /></Auth></PublicRoute>} />
        <Route path="verify-otp"         element={<PublicRoute><Auth><VerifyOTP /></Auth></PublicRoute>} />
        <Route path="create-new-password" element={<PublicRoute><Auth><CreateNewPassword /></Auth></PublicRoute>} />
        <Route path="verify-email"       element={<Auth><VerifyEmail /></Auth>} />

        <Route path="auth/callback"      element={<Auth><AuthCallback /></Auth>} />
        <Route path="choice-role"        element={<ProtectedRoute><Auth><ChoiceRole /></Auth></ProtectedRoute>} />
        <Route path="register/startup"   element={<ProtectedRoute><Auth><StartupRegistration /></Auth></ProtectedRoute>} />
        <Route path="register/investor"  element={<ProtectedRoute><Auth><InvestorRegistration /></Auth></ProtectedRoute>} />
        <Route path="register/incubator" element={<ProtectedRoute><Auth><IncubatorRegistration /></Auth></ProtectedRoute>} />
        <Route path="register/viewer"    element={<ProtectedRoute><Auth><ViewerRegistration /></Auth></ProtectedRoute>} />

        <Route path="blog"               element={<Auth><Blog /></Auth>} />
        <Route path="blog/:id"           element={<Auth><BlogArticle /></Auth>} />
        <Route path="pitch-us"           element={<Auth><PitchUs /></Auth>} />
        <Route path="portfolio"          element={<Auth><Portfolio /></Auth>} />
        <Route path="about"              element={<Auth><About /></Auth>} />
        <Route path="contact"            element={<Auth><Contact /></Auth>} />
        <Route path="pricing"            element={<Auth><Pricing /></Auth>} />
        <Route path="privacy-policy"     element={<Auth><PrivacyPolicy /></Auth>} />
        <Route path="ambassador-program" element={<Auth><AmbassadorProgram /></Auth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/*
       * ── Public profile page ──────────────────────────────────────────────
       * Intentionally outside DashboardLayout so guests can view it
       * without authentication.  Auth users also see this without the
       * dashboard shell (it has its own layout switching logic).
       */}
      <Route path="/u/:userId" element={<Auth><UserPublicProfile /></Auth>} />

      {/*
       * ── Dashboard — DashboardLayout wraps ALL authenticated pages ────────
       *
       * CRITICAL: Every page reachable from BottomNav or DesktopSidebar MUST
       * be a child of this route.  If any such page is outside this route,
       * DashboardLayout unmounts on navigation → all KeepAlive state is lost.
       *
       * Pages fall into two categories:
       *   1. KeepAlive pages (home/explore/notifications/profile feed):
       *      element={null} — DashboardLayout renders them via PageKeepAlive.
       *   2. Dynamic pages (own-profile edit, inbox, pitch, battlefield):
       *      element={<Page>...</Page>} — rendered via <Outlet /> in DashboardLayout.
       *      These pages have their own AppShell; DashboardLayout just hides the
       *      KeepAlive section and renders the Outlet content.
       */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ── KeepAlive pages (rendered by DashboardLayout/PageKeepAlive) ── */}
        <Route path="startup"       element={null} />
        <Route path="investor"      element={null} />
        <Route path="incubator"     element={null} />
        <Route path="viewer"        element={null} />
        <Route path="explore"       element={null} />
        <Route path="notifications" element={null} />
        <Route path="profile"       element={null} />

        {/* ── Dynamic pages — rendered via Outlet, supply own layout ───── */}
        <Route path="pitch/hashtag"     element={<Page><ReelPitch /></Page>} />
        <Route path="pitch/:id"         element={<Page><ReelPitch /></Page>} />
        <Route path="battlefield"       element={<Page><Battlefield /></Page>} />
        <Route path="battleground"      element={<Page><Battlefield /></Page>} />
        <Route path="investor-payment"  element={<ProtectedRoute allowedRoles={['investor']}><Page><InvestorPayment /></Page></ProtectedRoute>} />

        {/*
         * Own-profile edit pages — previously OUTSIDE DashboardLayout.
         * Moving them here ensures DashboardLayout never unmounts when the
         * user taps the Profile tab in BottomNav or DesktopSidebar.
         */}
        <Route path="viewer/profile"    element={<ProtectedRoute allowedRoles={['viewer']}><Page><ViewerProfile /></Page></ProtectedRoute>} />
        <Route path="startup/profile"   element={<ProtectedRoute allowedRoles={['startup']}><Page><StartupProfile /></Page></ProtectedRoute>} />
        <Route path="investor/profile"  element={<ProtectedRoute allowedRoles={['investor']}><Page><InvestorProfile /></Page></ProtectedRoute>} />
        <Route path="incubator/profile" element={<ProtectedRoute allowedRoles={['incubator']}><Page><IncubatorProfile /></Page></ProtectedRoute>} />

        {/*
         * Inbox — previously outside DashboardLayout.
         * Moving here prevents unmount when user taps Messages in sidebar.
         */}
        <Route path="inbox"             element={<Page><Inbox /></Page>} />
        <Route path="inbox/:id"         element={<Page><Conversation /></Page>} />
        <Route path="event"             element={<Page><EventPage /></Page>} />

      </Route>

    </Routes>
  );
}
