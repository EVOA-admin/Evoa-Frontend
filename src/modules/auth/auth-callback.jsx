import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';

/**
 * AuthCallback — handles the Supabase OAuth redirect.
 *
 * After Google login, Supabase redirects to /auth/callback with the session
 * encoded in the URL fragment (#access_token=...). This component:
 *  1. Waits for Supabase to exchange the fragment for a real session
 *  2. Lets the AuthContext onAuthStateChange fire and sync the user
 *  3. Redirects to the home page — public-route / protected-route handle
 *     the onboarding gate from there
 */
export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        const handleCallback = async () => {
            // Give Supabase time to parse the URL fragment and establish the session
            const { data, error } = await supabase.auth.getSession();

            if (cancelled) return;

            if (error) {
                console.error('[AuthCallback] Session error:', error.message);
                navigate('/login', { replace: true });
                return;
            }

            if (data?.session) {
                // Session established — navigate to root and let ProtectedRoute/PublicRoute
                // handle where to send the user based on their onboarding state
                navigate('/', { replace: true });
            } else {
                // No session found after OAuth — try one more time after a short delay
                setTimeout(async () => {
                    if (cancelled) return;
                    const { data: retryData } = await supabase.auth.getSession();
                    if (retryData?.session) {
                        navigate('/', { replace: true });
                    } else {
                        navigate('/login', { replace: true });
                    }
                }, 1500);
            }
        };

        handleCallback();
        return () => { cancelled = true; };
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-16 h-16 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
