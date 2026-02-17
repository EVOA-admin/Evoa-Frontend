import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useTheme } from '../../contexts/ThemeContext';

export default function OAuthCallback() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [error, setError] = useState(null);

    useEffect(() => {
        // Handle the OAuth callback
        const handleCallback = async () => {
            try {
                // Get session from URL hash
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session) {
                    console.log('OAuth session established:', session.user.email);

                    // Check if user has selected a role
                    const userRole = session.user.user_metadata?.role;
                    const profileComplete = session.user.user_metadata?.profile_complete;

                    if (!userRole) {
                        // First time OAuth user - redirect to role selection
                        console.log('New OAuth user - redirecting to role selection');
                        navigate('/choice-role', { replace: true });
                    } else if (!profileComplete) {
                        // Has role but profile incomplete - redirect to registration
                        console.log('OAuth user with incomplete profile - redirecting to registration');
                        navigate(`/register/${userRole.toLowerCase()}`, { replace: true });
                    } else {
                        // Profile complete - redirect to dashboard
                        console.log('OAuth user with complete profile - redirecting to dashboard');
                        navigate(`/${userRole.toLowerCase()}`, { replace: true });
                    }
                } else {
                    // No session - redirect to login
                    console.log('No session found - redirecting to login');
                    navigate('/login', { replace: true });
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err.message);
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="mb-4">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Authentication Error
                    </h2>
                    <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {error}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Redirecting to login...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Completing authentication...
                </p>
            </div>
        </div>
    );
}
