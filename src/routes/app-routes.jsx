import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/layout';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import Landing from '../modules/landing/landingpage';
import Login from '../modules/auth/login';
import Register from '../modules/auth/register';
import ForgetPassword from '../modules/auth/forget-password';
import ResetPassword from '../modules/auth/reset-password';
import OAuthCallback from '../modules/auth/OAuthCallback';
// Removed: VerifyOTP and CreateNewPassword (obsolete with Supabase email link flow)
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="register/startup" element={<StartupRegistration />} />
        <Route path="register/investor" element={<InvestorRegistration />} />
        <Route path="register/incubator" element={<IncubatorRegistration />} />
        <Route path="register/viewer" element={<ViewerRegistration />} />
        <Route path="choice-role" element={<ChoiceRole />} />
        <Route path="forget-password" element={<ForgetPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="auth/callback" element={<OAuthCallback />} />
        {/* Removed: verify-otp and create-new-password routes (obsolete with Supabase) */}
        <Route path="blog" element={<Blog />} />
        <Route path="pitch-us" element={<PitchUs />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />

        {/* Protected routes - require authentication */}
        <Route path="startup" element={<ProtectedRoute><Startup /></ProtectedRoute>} />
        <Route path="investor" element={<ProtectedRoute><Investor /></ProtectedRoute>} />
        <Route path="incubator" element={<ProtectedRoute><Incubator /></ProtectedRoute>} />
        <Route path="viewer" element={<ProtectedRoute><Viewer /></ProtectedRoute>} />
        <Route path="explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="pitch/:id" element={<ProtectedRoute><ReelPitch /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

