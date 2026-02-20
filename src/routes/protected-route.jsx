import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, loading, userRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-16 h-16 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user has no role, they must select one
    // Exempt: /choice-role itself and all /register/* routes (user is in the middle of onboarding)
    const isOnboardingPath = location.pathname === '/choice-role' || location.pathname.startsWith('/register/');
    if (!userRole && !isOnboardingPath) {
        return <Navigate to="/choice-role" replace />;
    }

    if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
        // Redirect based on their actual role if they try to access unauthorized pages
        if (userRole === 'startup') return <Navigate to="/startup" replace />;
        if (userRole === 'investor') return <Navigate to="/investor" replace />;
        if (userRole === 'incubator') return <Navigate to="/incubator" replace />;
        return <Navigate to="/viewer" replace />;
    }

    return children;
}
