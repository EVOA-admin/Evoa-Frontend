import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaTimes, FaSpinner } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import postsService from "../../services/postsService";
import { goToProfile } from "../../utils/profileNavigation";

/**
 * InvestorThoughtSheet — read-only bottom sheet that displays only
 * investor-role comments for a startup post.
 *
 * It calls GET /posts/:id/investor-thoughts (backend filters by role).
 * There is intentionally NO compose input — investors write through the
 * regular comment sheet, and their comments surface here automatically.
 *
 * Props:
 *   isOpen   : boolean
 *   onClose  : () => void
 *   postId   : string
 *   postTitle: string
 */
export default function InvestorThoughtSheet({ isOpen, onClose, postId, postTitle }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [thoughts, setThoughts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !postId) return;
        let mounted = true;
        setLoading(true);
        setThoughts([]);
        postsService.getInvestorThoughts(postId)
            .then(res => {
                if (!mounted) return;
                const data = res?.data?.data || res?.data || [];
                setThoughts(Array.isArray(data) ? data : []);
            })
            .catch(() => { if (mounted) setThoughts([]); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [isOpen, postId]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
                onClick={onClose}
            />

            {/* Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-[90] max-w-md mx-auto rounded-t-3xl flex flex-col shadow-2xl`}
                style={{
                    maxHeight: "70vh",
                    background: isDark ? "#0e0e0e" : "#ffffff",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/30" : "bg-gray-300"}`} />
                </div>

                {/* Header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <div>
                        <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                            Investor's Thought
                        </h3>
                        {postTitle && (
                            <p className={`text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                on {postTitle}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                    >
                        <FaTimes size={16} className={isDark ? "text-white/70" : "text-gray-500"} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ minHeight: 0 }}>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <FaSpinner className="animate-spin text-[#00B8A9]" size={24} />
                        </div>
                    ) : thoughts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <span className="text-3xl">💼</span>
                            <p className={`text-sm text-center ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                No investor thoughts yet.
                            </p>
                            <p className={`text-xs text-center ${isDark ? "text-white/25" : "text-gray-300"}`}>
                                Investors can share their thoughts via the comments section.
                            </p>
                        </div>
                    ) : (
                        thoughts.map((t, i) => (
                            <div key={t.id || i} className="flex gap-3">
                                {/* Avatar */}
                                <button
                                    onClick={() => t.userId && goToProfile(t.userId, currentUser, navigate)}
                                    className="flex-shrink-0 focus:outline-none"
                                >
                                    <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                                        {t.avatar
                                            ? <img src={t.avatar} alt="" className="w-full h-full object-cover" />
                                            : <span className={isDark ? "text-white" : "text-gray-600"}>
                                                {(t.name?.[0] || "I").toUpperCase()}
                                            </span>
                                        }
                                    </div>
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => t.userId && goToProfile(t.userId, currentUser, navigate)}
                                            className={`text-xs font-semibold hover:text-[#00B8A9] transition-colors text-left ${isDark ? "text-white/90" : "text-gray-800"}`}
                                        >
                                            {t.name || "Investor"}
                                        </button>
                                        {/* Investor verified badge */}
                                        <MdVerified size={12} className="text-[#00B8A9] flex-shrink-0" />
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-[#00B8A9]/10 text-[#00B8A9] ml-0.5`}>
                                            {t.role === 'incubator' ? 'Incubator' : 'Investor'}
                                        </span>
                                    </div>
                                    <p className={`text-sm leading-relaxed mt-0.5 ${isDark ? "text-white/90" : "text-gray-800"}`}>
                                        {t.content}
                                    </p>
                                    <p className={`text-[10px] mt-1 ${isDark ? "text-white/35" : "text-gray-400"}`}>
                                        {t.createdAt
                                            ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Read-only notice at bottom */}
                <div className={`px-4 py-3 border-t text-center ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <p className={`text-xs ${isDark ? "text-white/25" : "text-gray-300"}`}>
                        Only investor comments are shown here
                    </p>
                </div>
            </div>
        </>
    );
}
