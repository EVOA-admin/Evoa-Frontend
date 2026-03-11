import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.avif";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "";
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { resendVerification } = useAuth();
    const navigate = useNavigate();

    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [resendError, setResendError] = useState(null);
    const [cooldown, setCooldown] = useState(0);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async () => {
        if (!email || resendLoading || cooldown > 0) return;
        setResendLoading(true);
        setResendError(null);
        setResendSuccess(false);
        try {
            await resendVerification(email);
            setResendSuccess(true);
            setCooldown(60);
        } catch (err) {
            setResendError(err?.message || "Failed to resend. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    const openEmailApp = () => {
        // Try opening default mail app
        window.location.href = "mailto:";
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300 ${isDark ? "bg-black" : "bg-gray-50"}`}>
            {/* Animated background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute rounded-full blur-3xl opacity-20 ${isDark ? "bg-[#00B8A9]" : "bg-[#00B8A9]/40"}`}
                    style={{ width: 400, height: 400, top: "-10%", right: "-5%", animation: "floatBlob 18s ease-in-out infinite" }} />
                <div className={`absolute rounded-full blur-3xl opacity-10 ${isDark ? "bg-[#00B8A9]" : "bg-[#00B8A9]/30"}`}
                    style={{ width: 300, height: 300, bottom: "5%", left: "-5%", animation: "floatBlob 24s ease-in-out infinite reverse" }} />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <img src={logo} alt="EVO-A" className="h-10 w-10 object-contain" style={{ filter: "drop-shadow(0 0 12px #00B8A9)" }} />
                    <span className={`text-2xl font-bold tracking-wide ${isDark ? "text-white" : "text-black"}`}>EVO-A</span>
                </div>

                {/* Card */}
                <div className={`rounded-3xl p-8 text-center ${isDark ? "bg-white/5 border border-white/10 backdrop-blur-sm" : "bg-white border border-gray-200 shadow-xl"}`}>

                    {/* Animated envelope icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-[#00B8A9]/15 flex items-center justify-center" style={{ animation: "pulse 2.5s ease-in-out infinite" }}>
                                <div className="w-14 h-14 rounded-full bg-[#00B8A9]/25 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#00B8A9]" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </div>
                            </div>
                            {/* Flying dots */}
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#00B8A9]" style={{ animation: "ping 2s ease-in-out infinite" }} />
                        </div>
                    </div>

                    <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        Check your inbox
                    </h1>
                    <p className={`text-sm mb-1 ${isDark ? "text-white/60" : "text-gray-500"}`}>
                        We've sent a verification link to
                    </p>
                    {email && (
                        <p className={`text-sm font-semibold mb-4 break-all ${isDark ? "text-[#00B8A9]" : "text-[#00B8A9]"}`}>
                            {email}
                        </p>
                    )}
                    <p className={`text-sm mb-6 leading-relaxed ${isDark ? "text-white/50" : "text-gray-400"}`}>
                        Click the link in the email to verify your account and continue to Evoa.
                        The link will expire in 24 hours.
                    </p>

                    {/* Success / Error messages */}
                    {resendSuccess && (
                        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-green-500/10 border border-green-500/30 text-green-400">
                            ✓ Verification email sent! Check your inbox.
                        </div>
                    )}
                    {resendError && (
                        <div className="mb-4 px-4 py-3 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400">
                            {resendError}
                        </div>
                    )}

                    {/* Open Email App button */}
                    <button
                        onClick={openEmailApp}
                        className="w-full py-3 mb-3 rounded-2xl bg-[#00B8A9] text-white font-semibold text-sm transition-all duration-300 hover:bg-[#00A89A] hover:shadow-lg hover:shadow-[#00B8A9]/30 active:scale-[0.98]"
                    >
                        Open Email App
                    </button>

                    {/* Resend button */}
                    <button
                        onClick={handleResend}
                        disabled={resendLoading || cooldown > 0 || !email}
                        className={`w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border ${isDark
                            ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 disabled:opacity-40"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                            } disabled:cursor-not-allowed`}
                    >
                        {resendLoading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
                    </button>

                    {/* Spam message */}
                    <p className={`text-xs mt-4 ${isDark ? "text-white/30" : "text-gray-400"}`}>
                        Didn't receive the email? Check your spam or junk folder.
                    </p>
                </div>

                {/* Back to Login */}
                <div className="mt-5 text-center">
                    <Link
                        to="/login"
                        className={`text-sm transition-colors duration-200 hover:text-[#00B8A9] ${isDark ? "text-white/40" : "text-gray-400"}`}
                    >
                        ← Back to Login
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes floatBlob {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.85; }
                }
                @keyframes ping {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
