import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PublicRoute({ children }) {
    const { user, loading, userRole } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-16 h-16 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        // Redirect to appropriate dashboard based on role
        if (!userRole) return <Navigate to="/choice-role" replace />;
        if (userRole === 'startup') return <Navigate to="/startup" replace />;
        if (userRole === 'investor') return <Navigate to="/investor" replace />;
        if (userRole === 'incubator') return <Navigate to="/incubator" replace />;
        if (userRole === 'viewer') return <Navigate to="/viewer" replace />;

        // Fallback for unknown roles or if role syncing is slow -> choice-role
        return <Navigate to="/choice-role" replace />;
    }

    return children;
}
