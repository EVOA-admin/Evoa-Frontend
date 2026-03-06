import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/layout';
import Landing from '../modules/landing/landingpage';
import Login from '../modules/auth/login';
import Register from '../modules/auth/register';
import ForgetPassword from '../modules/auth/forget-password';
import VerifyOTP from '../modules/auth/verify-otp';
import CreateNewPassword from '../modules/auth/create-new-password';
import ChoiceRole from '../modules/auth/choice-role';
import StartupRegistration from '../modules/auth/startup-registration';
import InvestorRegistration from '../modules/auth/investor-registration';
import IncubatorRegistration from '../modules/auth/incubator-registration';
import ViewerRegistration from '../modules/auth/viewer-registration';
import Startup from '../modules/startup/startup';
import Investor from '../modules/investor/investor';
import Incubator from '../modules/incubator/incubator';
import Viewer from '../modules/viewer/viewer';
import Explore from '../modules/explore/explore';
import Notifications from '../modules/notifications/notifications';
import ReelPitch from '../modules/pitch/reel-pitch';
import Profile from '../modules/profile/profile';
import Blog from '../modules/pages/blog';
import PitchUs from '../modules/pages/pitch-us';
import Portfolio from '../modules/pages/portfolio';
import About from '../modules/pages/about';
import Contact from '../modules/pages/contact';
import PrivacyPolicy from '../modules/pages/privacy-policy';
import ProtectedRoute from './protected-route';
import PublicRoute from './public-route';
import ViewerProfile from '../modules/viewer/viewer-profile';
import StartupProfile from '../modules/startup/startup-profile';
import InvestorProfile from '../modules/investor/investor-profile';
import IncubatorProfile from '../modules/incubator/incubator-profile';
import UserPublicProfile from '../modules/profile/user-public-profile';
import AuthCallback from '../modules/auth/auth-callback';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes - Accessible only when NOT logged in */}
        <Route index element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="forget-password" element={<PublicRoute><ForgetPassword /></PublicRoute>} />
        <Route path="verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
        <Route path="create-new-password" element={<PublicRoute><CreateNewPassword /></PublicRoute>} />

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
    </Routes>
  );
}

