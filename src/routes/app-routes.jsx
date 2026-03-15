import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/layout';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';

// Landing is eagerly imported — it IS the root page and must render immediately
import Landing from '../modules/landing/landingpage';

// Auth pages — fetched only when the user navigates to them
const Login = lazy(() => import('../modules/auth/login'));
const Register = lazy(() => import('../modules/auth/register'));
const ForgetPassword = lazy(() => import('../modules/auth/forget-password'));
const VerifyOTP = lazy(() => import('../modules/auth/verify-otp'));
const CreateNewPassword = lazy(() => import('../modules/auth/create-new-password'));
const VerifyEmail = lazy(() => import('../modules/auth/verify-email'));
const ChoiceRole = lazy(() => import('../modules/auth/choice-role'));
const StartupRegistration = lazy(() => import('../modules/auth/startup-registration'));
const InvestorRegistration = lazy(() => import('../modules/auth/investor-registration'));
const IncubatorRegistration = lazy(() => import('../modules/auth/incubator-registration'));
const ViewerRegistration = lazy(() => import('../modules/auth/viewer-registration'));
const AuthCallback = lazy(() => import('../modules/auth/auth-callback'));

// Dashboard pages
const Startup = lazy(() => import('../modules/startup/startup'));
const Investor = lazy(() => import('../modules/investor/investor'));
const Incubator = lazy(() => import('../modules/incubator/incubator'));
const Viewer = lazy(() => import('../modules/viewer/viewer'));

// Feature pages
const Explore = lazy(() => import('../modules/explore/explore'));
const Notifications = lazy(() => import('../modules/notifications/notifications'));
const ReelPitch = lazy(() => import('../modules/pitch/reel-pitch'));
const Profile = lazy(() => import('../modules/profile/profile'));
const Inbox = lazy(() => import('../modules/chat/inbox'));
const Conversation = lazy(() => import('../modules/chat/conversation'));

// Profile pages
const ViewerProfile = lazy(() => import('../modules/viewer/viewer-profile'));
const StartupProfile = lazy(() => import('../modules/startup/startup-profile'));
const InvestorProfile = lazy(() => import('../modules/investor/investor-profile'));
const IncubatorProfile = lazy(() => import('../modules/incubator/incubator-profile'));
const UserPublicProfile = lazy(() => import('../modules/profile/user-public-profile'));

// Public pages
const Blog = lazy(() => import('../modules/pages/blog'));
const PitchUs = lazy(() => import('../modules/pages/pitch-us'));
const Portfolio = lazy(() => import('../modules/pages/portfolio'));
const About = lazy(() => import('../modules/pages/about'));
const Contact = lazy(() => import('../modules/pages/contact'));
const PrivacyPolicy = lazy(() => import('../modules/pages/privacy-policy'));

export default function AppRoutes() {
  return (
    // Suspense is required for React.lazy — null fallback keeps UI clean
    <Suspense fallback={null}>
      <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes - Accessible only when NOT logged in */}
        <Route index element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="forget-password" element={<PublicRoute><ForgetPassword /></PublicRoute>} />
        <Route path="verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
        <Route path="create-new-password" element={<PublicRoute><CreateNewPassword /></PublicRoute>} />
        <Route path="verify-email" element={<VerifyEmail />} />

        {/* Onboarding Routes - Require Authentication */}
        <Route path="auth/callback" element={<AuthCallback />} />
        <Route path="choice-role" element={<ProtectedRoute><ChoiceRole /></ProtectedRoute>} />
        <Route path="register/startup" element={<ProtectedRoute><StartupRegistration /></ProtectedRoute>} />
        <Route path="register/investor" element={<ProtectedRoute><InvestorRegistration /></ProtectedRoute>} />
        <Route path="register/incubator" element={<ProtectedRoute><IncubatorRegistration /></ProtectedRoute>} />
        <Route path="register/viewer" element={<ProtectedRoute><ViewerRegistration /></ProtectedRoute>} />

        {/* Dashboard Routes - Role Protected */}
        <Route path="startup" element={<ProtectedRoute allowedRoles={['startup']}><Startup /></ProtectedRoute>} />
        <Route path="investor" element={<ProtectedRoute allowedRoles={['investor']}><Investor /></ProtectedRoute>} />
        <Route path="incubator" element={<ProtectedRoute allowedRoles={['incubator']}><Incubator /></ProtectedRoute>} />
        <Route path="viewer" element={<ProtectedRoute allowedRoles={['viewer']}><Viewer /></ProtectedRoute>} />

        {/* Feature Routes - Require Authentication */}
        <Route path="explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="pitch/:id" element={<ProtectedRoute><ReelPitch /></ProtectedRoute>} />
        <Route path="pitch/hashtag" element={<ProtectedRoute><ReelPitch /></ProtectedRoute>} />

        {/* Public Pages - Accessible by everyone */}
        <Route path="blog" element={<Blog />} />
        <Route path="pitch-us" element={<PitchUs />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />

        {/* Catch all - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Full-screen routes — rendered WITHOUT the global Layout header */}
      <Route path="/viewer/profile" element={<ProtectedRoute allowedRoles={['viewer']}><ViewerProfile /></ProtectedRoute>} />
      <Route path="/startup/profile" element={<ProtectedRoute allowedRoles={['startup']}><StartupProfile /></ProtectedRoute>} />
      <Route path="/investor/profile" element={<ProtectedRoute allowedRoles={['investor']}><InvestorProfile /></ProtectedRoute>} />
      <Route path="/incubator/profile" element={<ProtectedRoute allowedRoles={['incubator']}><IncubatorProfile /></ProtectedRoute>} />
      <Route path="/u/:userId" element={<ProtectedRoute><UserPublicProfile /></ProtectedRoute>} />
      <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
      <Route path="/inbox/:id" element={<ProtectedRoute><Conversation /></ProtectedRoute>} />
    </Routes>
    </Suspense>
  );
}

