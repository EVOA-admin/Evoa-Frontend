import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const REGISTRATION_ROUTES = {
    startup: '/register/startup',
    investor: '/register/investor',
    incubator: '/register/incubator',
};

const DASHBOARD_ROUTES = {
    startup: '/startup',
    investor: '/investor',
    incubator: '/incubator',
    viewer: '/viewer',
};

// Profile paths bypass the registrationCompleted check
const PROFILE_PATHS = [
    '/startup/profile',
    '/investor/profile',
    '/incubator/profile',
    '/viewer/profile',
];

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading, userRole, roleSelected, registrationCompleted } = useAuth();
    const location = useLocation();

    // Only block on the initial load. We intentionally DO NOT block on `syncing`
    // because the localStorage cache seeds onboarding state before sync completes,
    // so users are routed correctly within milliseconds of page load.
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-16 h-16 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Not authenticated → login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isOnboardingPath = location.pathname === '/choice-role' || location.pathname.startsWith('/register/');
    const isProfilePath = PROFILE_PATHS.includes(location.pathname);

    // Step 1: No role selected yet → choice-role (unless already there)
    if (!roleSelected && !isOnboardingPath) {
        return <Navigate to="/choice-role" replace />;
    }

    // Step 2: Registration already done → block access to onboarding pages
    if (registrationCompleted && isOnboardingPath) {
        return <Navigate to={DASHBOARD_ROUTES[userRole] || '/viewer'} replace />;
    }

    // Step 3: Role selected but registration not complete → registration form
    // Skip this check for profile pages and for viewer (no form needed)
    if (roleSelected && !registrationCompleted && userRole !== 'viewer' && !isOnboardingPath && !isProfilePath) {
        return <Navigate to={REGISTRATION_ROUTES[userRole] || '/choice-role'} replace />;
    }

    // Step 4: Role-based access control — wrong role → their dashboard
    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
        return <Navigate to={DASHBOARD_ROUTES[userRole] || '/viewer'} replace />;
    }

    return children;
}
