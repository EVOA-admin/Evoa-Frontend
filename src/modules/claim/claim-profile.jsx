import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
    FaArrowLeft, FaCheckCircle, FaSpinner, FaEnvelope, FaLinkedin,
    FaShieldAlt, FaBuilding, FaGlobe, FaMapMarkerAlt, FaUserTie,
    FaLock, FaCheck, FaExclamationCircle, FaInfoCircle
} from 'react-icons/fa';
import {
    getClaimPrefill,
    initiateClaim,
    sendWorkEmailOtp,
    verifyWorkEmailOtp,
    getLinkedInAuthUrl,
    completeClaim,
} from '../../services/investorsService';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export default function ClaimProfile() {
    const { investorId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user: currentUser, refreshUserProfile } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [prefillData, setPrefillData] = useState(null);
    const [claimId, setClaimId] = useState(null);

    // Wizard Step: 1 (Verification) | 2 (Missing Fields) | 3 (Review & Submit) | 4 (Success)
    const [step, setStep] = useState(1);

    // Email OTP Verification State
    const [workEmail, setWorkEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [domainMatches, setDomainMatches] = useState(false);

    // LinkedIn Verification State
    const [linkedinVerified, setLinkedinVerified] = useState(false);
    const [linkedinName, setLinkedinName] = useState('');

    // Missing Profile Fields
    const [formData, setFormData] = useState({
        phone: '',
        panNumber: '',
        bio: '',
        designation: '',
        companyName: '',
        investorType: '',
        website: '',
        linkedin: '',
    });
    const [panError, setPanError] = useState('');
    const [submittingClaim, setSubmittingClaim] = useState(false);
    const [claimResult, setClaimResult] = useState(null);

    // Initial Load & Auth Check
    useEffect(() => {
        if (!currentUser) {
            // Unregistered / Guest: redirect to register with returnTo
            const returnUrl = `/claim-profile/${investorId}`;
            navigate(`/register?returnTo=${encodeURIComponent(returnUrl)}&role=investor`);
            return;
        }

        const fetchPrefill = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getClaimPrefill(investorId);
                const data = res?.data?.data || res?.data || res;
                setPrefillData(data);

                // Auto-initiate claim session
                const initRes = await initiateClaim(investorId);
                const initData = initRes?.data?.data || initRes?.data || initRes;
                setClaimId(initData?.claimId);

                if (initData?.workEmailVerified) {
                    setEmailVerified(true);
                }
                if (initData?.linkedinVerified) {
                    setLinkedinVerified(true);
                }

                // Pre-fill existing fields
                const inv = data?.investor;
                setFormData({
                    phone: inv?.phone || '',
                    panNumber: '',
                    bio: inv?.description || '',
                    designation: inv?.designation || '',
                    companyName: inv?.companyName || '',
                    investorType: inv?.type || 'Angel Investor',
                    website: inv?.website || '',
                    linkedin: inv?.linkedin || '',
                });

                // Check for LinkedIn callback parameters in URL
                const liSuccess = searchParams.get('linkedin_verified');
                if (liSuccess === 'true') {
                    setLinkedinVerified(true);
                    setLinkedinName(searchParams.get('linkedin_name') || '');
                }
            } catch (err) {
                setError(err?.response?.data?.message || err?.message || 'Failed to load profile claim information.');
            } finally {
                setLoading(false);
            }
        };

        fetchPrefill();
    }, [investorId, currentUser, navigate, searchParams]);

    // OTP Timer countdown
    useEffect(() => {
        if (otpCountdown <= 0) return;
        const timer = setInterval(() => setOtpCountdown(c => c - 1), 1000);
        return () => clearInterval(timer);
    }, [otpCountdown]);

    // Send OTP handler
    const handleSendOtp = async () => {
        if (!workEmail.trim() || !workEmail.includes('@')) {
            setError('Please enter a valid company domain email address.');
            return;
        }
        if (!claimId) return;

        try {
            setSendingOtp(true);
            setError('');
            const res = await sendWorkEmailOtp({ claimId, workEmail: workEmail.trim() });
            const d = res?.data?.data || res?.data || res;
            setOtpSent(true);
            setDomainMatches(!!d.domainMatches);
            setOtpCountdown(60);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to send verification code.');
        } finally {
            setSendingOtp(false);
        }
    };

    // Verify OTP handler
    const handleVerifyOtp = async () => {
        if (!otp.trim() || otp.trim().length < 6) {
            setError('Please enter the 6-digit verification code.');
            return;
        }
        if (!claimId) return;

        try {
            setVerifyingOtp(true);
            setError('');
            await verifyWorkEmailOtp({ claimId, otp: otp.trim() });
            setEmailVerified(true);
            setOtpSent(false);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Invalid or expired verification code.');
        } finally {
            setVerifyingOtp(false);
        }
    };

    // Start LinkedIn OAuth flow
    const handleStartLinkedIn = async () => {
        if (!claimId) return;
        try {
            setError('');
            const redirectUri = `${window.location.origin}/claim-profile/linkedin-callback`;
            const res = await getLinkedInAuthUrl({ claimId, redirectUri });
            const data = res?.data?.data || res?.data || res;
            if (data?.authUrl) {
                // Save state in session storage for validation upon return
                sessionStorage.setItem('evoa_claim_id', claimId);
                sessionStorage.setItem('evoa_claim_investor_id', investorId);
                window.location.href = data.authUrl;
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to initialize LinkedIn authorization.');
        }
    };

    // Submit Complete Claim
    const handleCompleteClaim = async () => {
        if (formData.panNumber?.trim()) {
            const formattedPan = formData.panNumber.trim().toUpperCase();
            if (!PAN_REGEX.test(formattedPan)) {
                setPanError('Invalid PAN format (e.g. ABCDE1234F).');
                return;
            }
        }
        setPanError('');

        try {
            setSubmittingClaim(true);
            setError('');
            const payload = {
                claimId,
                phone: formData.phone.trim() || undefined,
                panNumber: formData.panNumber.trim() ? formData.panNumber.trim().toUpperCase() : undefined,
                bio: formData.bio.trim() || undefined,
                designation: formData.designation.trim() || undefined,
                companyName: formData.companyName.trim() || undefined,
                investorType: formData.investorType || undefined,
                website: formData.website.trim() || undefined,
                linkedin: formData.linkedin.trim() || undefined,
            };

            const res = await completeClaim(payload);
            const data = res?.data?.data || res?.data || res;
            setClaimResult(data);
            await refreshUserProfile();
            setStep(4);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to complete profile claim.');
        } finally {
            setSubmittingClaim(false);
        }
    };

    const inv = prefillData?.investor;

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0a0e] text-white' : 'bg-[#f8fafc] text-gray-900'}`}>
                <div className="flex flex-col items-center gap-3">
                    <FaSpinner className="animate-spin text-evoa" size={36} />
                    <p className="text-sm font-medium">Preparing investor profile claim verification...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen py-8 px-4 font-sans ${isDark ? 'bg-[#0a0a0e] text-white' : 'bg-[#f8fafc] text-gray-900'}`}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => navigate(`/u/${investorId}`)}
                        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${
                            isDark ? 'border-white/15 text-white/70 hover:bg-white/5' : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        <FaArrowLeft size={10} /> Back to profile
                    </button>
                    <div className="flex items-center gap-2">
                        <FaShieldAlt className="text-evoa" size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider text-evoa">Official Claim Verification</span>
                    </div>
                </div>

                {error && (
                    <div className="p-4 mb-6 rounded-2xl text-sm bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
                        <FaExclamationCircle className="flex-shrink-0 mt-0.5" size={16} />
                        <div>{error}</div>
                    </div>
                )}

                {/* Stepper Progress */}
                {step < 4 && (
                    <div className="flex items-center justify-between mb-8 px-2">
                        {[
                            { num: 1, label: 'Verification Signals' },
                            { num: 2, label: 'Missing Details' },
                            { num: 3, label: 'Review & Confirm' },
                        ].map((s) => (
                            <div key={s.num} className="flex items-center gap-2">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        step === s.num
                                            ? 'bg-evoa text-white shadow-lg shadow-evoa/30'
                                            : step > s.num
                                            ? 'bg-emerald-500 text-white'
                                            : isDark ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400'
                                    }`}
                                >
                                    {step > s.num ? '✓' : s.num}
                                </div>
                                <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? (isDark ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 1: Verification Signals */}
                {step === 1 && (
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className={`rounded-2xl p-5 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="flex items-center gap-4 mb-3">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-700 flex-shrink-0">
                                    {inv?.logoUrl ? (
                                        <img src={inv.logoUrl} alt={inv.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                                            {inv?.name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{inv?.name}</h2>
                                    <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                        {inv?.designation ? `${inv.designation} at ` : ''}{inv?.companyName || 'Investor'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                            EVOA-Created · Unclaimed Profile
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`pt-3 mt-3 border-t text-xs flex flex-wrap gap-4 ${isDark ? 'border-white/10 text-white/70' : 'border-gray-100 text-gray-600'}`}>
                                {inv?.website && (
                                    <div className="flex items-center gap-1.5">
                                        <FaGlobe className="text-evoa" /> {inv.website.replace(/^https?:\/\//, '')}
                                    </div>
                                )}
                                {inv?.location?.city && (
                                    <div className="flex items-center gap-1.5">
                                        <FaMapMarkerAlt className="text-evoa" /> {inv.location.city}, {inv.location.state}
                                    </div>
                                )}
                                {inv?.type && (
                                    <div className="flex items-center gap-1.5">
                                        <FaUserTie className="text-evoa" /> {inv.type}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Verification Signals Box */}
                        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <div className="mb-5">
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <FaLock className="text-evoa" size={14} /> Verify Your Affiliation
                                </h3>
                                <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                    Provide at least one verification signal below to verify that you own or represent this investor profile.
                                </p>
                            </div>

                            {/* SIGNAL 1: Company Email */}
                            <div className={`p-4 rounded-xl border mb-4 ${emailVerified ? 'border-emerald-500/30 bg-emerald-500/10' : isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 font-semibold text-sm">
                                        <FaEnvelope className={emailVerified ? 'text-emerald-500' : 'text-blue-500'} />
                                        <span>Option A: Professional Email Verification</span>
                                    </div>
                                    {emailVerified && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                                            <FaCheck /> Verified
                                        </span>
                                    )}
                                </div>

                                {!emailVerified ? (
                                    <div className="mt-3 space-y-3">
                                        <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                            Enter your company domain email {inv?.websiteDomain ? `(e.g. name@${inv.websiteDomain})` : ''} to receive a 6-digit OTP code.
                                        </p>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                placeholder={inv?.websiteDomain ? `you@${inv.websiteDomain}` : 'you@company.com'}
                                                value={workEmail}
                                                onChange={(e) => setWorkEmail(e.target.value)}
                                                className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                                    isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-white border-gray-300 text-black'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleSendOtp}
                                                disabled={sendingOtp || otpCountdown > 0}
                                                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-evoa text-white hover:bg-[#00a098] flex items-center justify-center gap-2 whitespace-nowrap"
                                            >
                                                {sendingOtp ? <FaSpinner className="animate-spin" size={12} /> : otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Send Code'}
                                            </button>
                                        </div>

                                        {otpSent && (
                                            <div className="pt-2 flex gap-2">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="Enter 6-digit code"
                                                    value={otp}
                                                    onChange={(e) => setOtp(e.target.value)}
                                                    className={`w-40 px-3.5 py-2.5 rounded-xl text-center tracking-widest font-mono text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                                        isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-white border-gray-300 text-black'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyOtp}
                                                    disabled={verifyingOtp}
                                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2"
                                                >
                                                    {verifyingOtp ? <FaSpinner className="animate-spin" size={12} /> : 'Verify Code'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                        Company email address verified. Matches organization record.
                                    </p>
                                )}
                            </div>

                            {/* SIGNAL 2: LinkedIn OAuth */}
                            <div className={`p-4 rounded-xl border ${linkedinVerified ? 'border-emerald-500/30 bg-emerald-500/10' : isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 font-semibold text-sm">
                                        <FaLinkedin className="text-[#0A66C2]" />
                                        <span>Option B: LinkedIn Identity Verification</span>
                                    </div>
                                    {linkedinVerified && (
                                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                                            <FaCheck /> Verified
                                        </span>
                                    )}
                                </div>

                                {!linkedinVerified ? (
                                    <div className="mt-3">
                                        <p className={`text-xs mb-3 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                            Authorize with LinkedIn to verify your professional identity and match it against <strong>{inv?.name}</strong>.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleStartLinkedIn}
                                            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#0A66C2] text-white hover:bg-[#084e96] flex items-center gap-2"
                                        >
                                            <FaLinkedin size={14} /> Connect LinkedIn Profile
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                                        LinkedIn identity verified ({linkedinName || currentUser?.fullName}). Name matches profile.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                {emailVerified || linkedinVerified
                                    ? '✓ Verification signal received! You can proceed.'
                                    : 'ℹ️ You can also proceed to review; claims without instant signals are queued for admin review.'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="px-6 py-3 rounded-xl text-sm font-bold bg-evoa text-white hover:bg-[#00a098] shadow-lg shadow-evoa/30"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Complete Missing Required Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <h3 className="text-base font-bold mb-1">Review & Complete Profile Details</h3>
                            <p className={`text-xs mb-5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                Existing details from the EVOA directory have been pre-filled. Please add or update any missing contact information.
                            </p>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                            Mobile / Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                                isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-white border-gray-300 text-black'
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                            PAN Number (Optional for verified tax registration)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="ABCDE1234F"
                                            value={formData.panNumber}
                                            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono uppercase border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                                panError ? 'border-red-500' : isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-white border-gray-300 text-black'
                                            }`}
                                        />
                                        {panError && <p className="text-[11px] text-red-500 mt-1">{panError}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                            Organization / Firm Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.companyName}
                                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                                isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-white border-gray-300 text-black'
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                            Designation
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.designation}
                                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                                isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-white border-gray-300 text-black'
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                        Bio / Investment Focus
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-evoa ${
                                            isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-white border-gray-300 text-black'
                                        }`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border ${
                                    isDark ? 'border-white/15 text-white' : 'border-gray-300 text-gray-700'
                                }`}
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="px-6 py-3 rounded-xl text-sm font-bold bg-evoa text-white hover:bg-[#00a098] shadow-lg shadow-evoa/30"
                            >
                                Review Claim →
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: Review & Submit Claim */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className={`rounded-2xl p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                            <h3 className="text-lg font-bold mb-1">Final Review & Ownership Claim</h3>
                            <p className={`text-xs mb-5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                By submitting this claim, you confirm that you are the legitimate owner of this professional investor profile.
                            </p>

                            <div className={`p-4 rounded-xl border mb-5 space-y-2.5 text-sm ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'}`}>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Profile Name:</span>
                                    <span className="font-semibold">{inv?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Organization:</span>
                                    <span className="font-semibold">{formData.companyName || inv?.companyName || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Claimant Account:</span>
                                    <span className="font-semibold">{currentUser?.fullName} ({currentUser?.email})</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Work Email Signal:</span>
                                    <span className={emailVerified ? 'text-emerald-500 font-semibold' : 'text-amber-500'}>
                                        {emailVerified ? '✓ Verified' : 'Not verified'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">LinkedIn Signal:</span>
                                    <span className={linkedinVerified ? 'text-emerald-500 font-semibold' : 'text-amber-500'}>
                                        {linkedinVerified ? '✓ Verified' : 'Not verified'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 flex items-start gap-2.5">
                                <FaInfoCircle className="flex-shrink-0 mt-0.5" size={14} />
                                <span>
                                    {emailVerified || linkedinVerified
                                        ? 'Instant Activation: Your verified signals qualify this profile for automatic claiming and ownership linking.'
                                        : 'Standard Verification: Your claim will be reviewed by EVOA admin to ensure directory integrity.'}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className={`px-5 py-2.5 rounded-xl text-sm font-semibold border ${
                                    isDark ? 'border-white/15 text-white' : 'border-gray-300 text-gray-700'
                                }`}
                            >
                                ← Back
                            </button>
                            <button
                                type="button"
                                onClick={handleCompleteClaim}
                                disabled={submittingClaim}
                                className="px-8 py-3.5 rounded-xl text-sm font-bold bg-evoa text-white hover:bg-[#00a098] shadow-lg shadow-evoa/30 flex items-center gap-2"
                            >
                                {submittingClaim ? <FaSpinner className="animate-spin" size={14} /> : 'Claim Profile & Activate Account'}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Success Result */}
                {step === 4 && (
                    <div className={`rounded-2xl p-8 border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-4">
                            <FaCheckCircle size={36} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            {claimResult?.isClaimed ? 'Profile Successfully Claimed!' : 'Claim Submitted for Review'}
                        </h2>
                        <p className={`text-sm mb-6 max-w-md mx-auto leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                            {claimResult?.isClaimed
                                ? `Congratulations! You are now the verified owner of the "${inv?.name}" investor profile on EVOA. Your account is fully active.`
                                : 'Thank you! Your claim has been received and our integrity team is reviewing your verification details. You will receive an update shortly.'}
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/investor/profile')}
                                className="px-6 py-3 rounded-xl text-sm font-bold bg-evoa text-white hover:bg-[#00a098] shadow-lg shadow-evoa/30"
                            >
                                Go to My Investor Dashboard
                            </button>
                            <button
                                onClick={() => navigate(`/u/${investorId}`)}
                                className={`px-6 py-3 rounded-xl text-sm font-semibold border ${
                                    isDark ? 'border-white/15 text-white hover:bg-white/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                View Public Profile
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
