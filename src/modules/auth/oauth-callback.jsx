import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import apiClient from '../../services/apiClient';

export default function OAuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the session from the URL
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('OAuth callback error:', error);
                    navigate('/login');
                    return;
                }

                if (session) {
                    // Fetch user profile from backend to check role
                    try {
                        const profileResponse = await apiClient.get('/users/me');
                        const user = profileResponse.data.data || profileResponse.data;

                        // Check if user has selected a role
                        if (!user.role || user.role === 'VIEWER') {
                            // No role selected, redirect to choice-role
                            navigate('/choice-role');
                        } else {
                            // Navigate based on role
                            const role = user.role.toLowerCase();
                            navigate(`/${role}`);
                        }
                    } catch (error) {
                        console.error('Error fetching user profile:', error);
                        // If profile fetch fails, default to choice-role
                        navigate('/choice-role');
                    }
                } else {
                    // No session, redirect to login
                    navigate('/login');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                navigate('/login');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00B8A9] mx-auto mb-4"></div>
                <p className="text-white/60">Completing authentication...</p>
            </div>
        </div>
    );
}
