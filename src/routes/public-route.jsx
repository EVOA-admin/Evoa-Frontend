import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Registration routes for each role — where users go after picking a role
const REGISTRATION_ROUTES = {
    startup: '/register/startup',
    investor: '/register/investor',
    incubator: '/register/incubator',
    viewer: '/viewer', // Viewer has no form
};

// Dashboard routes for each role — where fully-onboarded users land
const DASHBOARD_ROUTES = {
    startup: '/startup',
    investor: '/investor',
    incubator: '/incubator',
    viewer: '/viewer',
};

export default function PublicRoute({ children }) {
    const { user, loading, syncing, userRole, roleSelected, registrationCompleted } = useAuth();

    if (loading || syncing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-16 h-16 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        // Step 1: User has not selected a role yet — send to choice-role
        if (!roleSelected) return <Navigate to="/choice-role" replace />;

        // Step 2: Role selected but registration not completed — send to registration form
        if (!registrationCompleted && userRole && userRole !== 'viewer') {
            return <Navigate to={REGISTRATION_ROUTES[userRole] || '/choice-role'} replace />;
        }

        // Step 3: Fully onboarded — send to their dashboard
        return <Navigate to={DASHBOARD_ROUTES[userRole] || '/viewer'} replace />;
    }

    return children;
}
