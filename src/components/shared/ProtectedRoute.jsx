import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ProtectedRoute({ children, requireRole = null }) {
    const { isAuthenticated, loading, role, profileComplete } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Not authenticated - redirect to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!role && !location.pathname.startsWith('/choice-role')) {
        // Authenticated but no role - redirect to role selection
        return <Navigate to="/choice-role" replace />;
    }

    if (role && !profileComplete && !location.pathname.startsWith('/register/')) {
        // Has role but profile incomplete - redirect to registration
        return <Navigate to={`/register/${role.toLowerCase()}`} replace />;
    }

    if (requireRole && role && role !== requireRole) {
        // Wrong role - redirect to correct dashboard
        return <Navigate to={`/${role.toLowerCase()}`} replace />;
    }

    return children;
}

export default ProtectedRoute;
