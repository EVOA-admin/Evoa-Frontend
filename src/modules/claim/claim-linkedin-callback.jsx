import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSpinner, FaLinkedin, FaExclamationCircle } from 'react-icons/fa';
import { submitLinkedInCallback } from '../../services/investorsService';

export default function ClaimLinkedInCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const oauthError = searchParams.get('error') || searchParams.get('error_description');

            const claimId = sessionStorage.getItem('evoa_claim_id');
            const investorId = sessionStorage.getItem('evoa_claim_investor_id');

            if (oauthError) {
                setError(oauthError);
                setTimeout(() => {
                    navigate(investorId ? `/claim-profile/${investorId}` : '/explore');
                }, 3000);
                return;
            }

            if (!code || !claimId) {
                setError('Missing authorization code or claim session.');
                setTimeout(() => {
                    navigate(investorId ? `/claim-profile/${investorId}` : '/explore');
                }, 3000);
                return;
            }

            try {
                const redirectUri = `${window.location.origin}/claim-profile/linkedin-callback`;
                const res = await submitLinkedInCallback({
                    claimId,
                    code,
                    redirectUri,
                    state,
                });
                const data = res?.data?.data || res?.data || res;
                const liName = data?.linkedInName || '';
                navigate(`/claim-profile/${investorId}?linkedin_verified=true&linkedin_name=${encodeURIComponent(liName)}`);
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'LinkedIn verification failed.');
                setTimeout(() => {
                    navigate(investorId ? `/claim-profile/${investorId}` : '/explore');
                }, 3000);
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e] text-white p-4 font-sans">
            <div className="max-w-md w-full text-center p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-[#0A66C2]/20 text-[#0A66C2] mx-auto flex items-center justify-center mb-4">
                    <FaLinkedin size={36} />
                </div>
                {error ? (
                    <div>
                        <div className="flex items-center justify-center gap-2 text-red-400 font-bold mb-2">
                            <FaExclamationCircle /> Verification Error
                        </div>
                        <p className="text-xs text-white/70 mb-4">{error}</p>
                        <p className="text-[11px] text-white/40">Redirecting you back to claim flow...</p>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-lg font-bold mb-2">Verifying LinkedIn Identity</h2>
                        <p className="text-xs text-white/60 mb-6">Matching your professional credentials against EVOA directory...</p>
                        <FaSpinner className="animate-spin text-evoa mx-auto" size={24} />
                    </div>
                )}
            </div>
        </div>
    );
}
