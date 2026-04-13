import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { applyReferralCode } from '../../services/ambassadorService';

/**
 * AuthCallback — handles the Supabase OAuth / email-link redirect.
 *
 * After login, Supabase redirects to /auth/callback.  This component:
 *  1. Waits for Supabase to exchange the fragment for a real session
 *  2. If sessionStorage has a pending referral code, applies it now
 *     (fire-and-forget — never blocks navigation on failure)
 *  3. Navigates to "/" — public-route / protected-route handle onboarding gating
 */
async function tryApplyPendingReferral() {
    const code = sessionStorage.getItem('evoa_referral_code');
    if (!code) return;
    try {
        await applyReferralCode(code);
    } catch (_) {
        // Ignore — don't block auth flow over a referral error
    } finally {
        sessionStorage.removeItem('evoa_referral_code');
    }
}

export default function AuthCallback() {
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;

        const handleCallback = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (cancelled) return;

            if (error) {
                console.error('[AuthCallback] Session error:', error.message);
                navigate('/login', { replace: true });
                return;
            }

            if (data?.session) {
                await tryApplyPendingReferral();
                navigate('/', { replace: true });
            } else {
                // Retry once after delay (handles OAuth fragment race)
                setTimeout(async () => {
                    if (cancelled) return;
                    const { data: retryData } = await supabase.auth.getSession();
                    if (retryData?.session) {
                        await tryApplyPendingReferral();
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


