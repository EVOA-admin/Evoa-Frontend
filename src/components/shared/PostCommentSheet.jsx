import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaTimes, FaPaperPlane, FaSpinner, FaRegComment } from "react-icons/fa";
import postsService from "../../services/postsService";
import { goToProfile } from "../../utils/profileNavigation";

/**
 * PostCommentSheet — Instagram-style bottom sheet for post comments.
 * Matches the look and feel of the reel comment sheet in reel-pitch.jsx.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void
 *   postId: string
 *   postTitle: string  (shown in header, e.g. startup name or author name)
 *   onCommentAdded: () => void  (optional, increments count in parent)
 */
export default function PostCommentSheet({ isOpen, onClose, postId, postTitle, onCommentAdded }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);
    const inputRef = useRef(null);

    // Fetch comments when sheet opens
    useEffect(() => {
        if (!isOpen || !postId) return;
        let mounted = true;
        setLoading(true);
        setComments([]);
        postsService.getComments(postId)
            .then(res => {
                if (!mounted) return;
                const data = res?.data?.data || res?.data || [];
                setComments(Array.isArray(data) ? data : []);
            })
            .catch(() => { if (mounted) setComments([]); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [isOpen, postId]);

    // Auto-focus input when sheet opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const postComment = async () => {
        const trimmed = text.trim();
        if (!trimmed || posting) return;
        setPosting(true);
        // Optimistic
        const optimistic = {
            id: `tmp-${Date.now()}`,
            content: trimmed,
            userId: "me",
            createdAt: new Date().toISOString(),
            user: { fullName: currentUser?.fullName, avatarUrl: currentUser?.avatarUrl },
        };
        setComments(prev => [...prev, optimistic]);
        setText("");
        try {
            await postsService.addComment(postId, trimmed);
            onCommentAdded?.();
        } catch (_) {
            setComments(prev => prev.filter(c => c.id !== optimistic.id));
        } finally {
            setPosting(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); }
    };

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
                className={`fixed bottom-0 left-0 right-0 z-[90] max-w-md mx-auto rounded-t-3xl flex flex-col shadow-2xl ${isDark ? "" : "bg-white"
                    }`}
                style={{
                    maxHeight: "75vh",
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
                    <h3 className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                        {postTitle ? `${postTitle} — Comments` : "Comments"}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                    >
                        <FaTimes size={16} className={isDark ? "text-white/70" : "text-gray-500"} />
                    </button>
                </div>

                {/* Comment list */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ minHeight: 0 }}>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <FaSpinner className="animate-spin text-[#00B8A9]" size={24} />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
                            <FaRegComment size={36} style={{ opacity: 0.4 }} />
                            <p className="text-sm">No comments yet. Be the first!</p>
                        </div>
                    ) : (
                        comments.map((c, i) => (
                            <div key={c.id || i} className="flex gap-3">
                                <button
                                    onClick={() => c.userId && c.userId !== "me" && goToProfile(c.userId, currentUser, navigate)}
                                    className="flex-shrink-0 focus:outline-none"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                                        {c.user?.avatarUrl
                                            ? <img src={c.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                            : <span className={isDark ? "text-white" : "text-gray-600"}>
                                                {(c.user?.fullName?.[0] || c.user?.email?.[0] || "?").toUpperCase()}
                                            </span>
                                        }
                                    </div>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <button
                                        onClick={() => c.userId && c.userId !== "me" && goToProfile(c.userId, currentUser, navigate)}
                                        className={`text-xs font-semibold hover:text-[#00B8A9] transition-colors text-left ${isDark ? "text-white/80" : "text-gray-800"}`}
                                    >
                                        {c.user?.fullName || c.user?.email?.split("@")[0] || "User"}
                                    </button>
                                    <p className={`text-sm leading-relaxed mt-0.5 ${isDark ? "text-white/90" : "text-gray-800"}`}>{c.content}</p>
                                    <p className={`text-[10px] mt-1 ${isDark ? "text-white/40" : "text-gray-400"}`}>
                                        {c.createdAt
                                            ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input bar */}
                <div className={`px-4 py-3 border-t flex items-center gap-3 ${isDark ? "border-white/10 bg-[#0e0e0e]" : "border-gray-100 bg-white"}`}>
                    {/* Current user avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold ${isDark ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-600"}`}>
                        {currentUser?.avatarUrl
                            ? <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (currentUser?.fullName?.[0] || currentUser?.email?.[0] || "?").toUpperCase()
                        }
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Add a comment..."
                        className={`flex-1 rounded-full px-4 py-2.5 text-sm outline-none transition-colors ${isDark
                            ? "bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:border-[#00B8A9]"
                            : "bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#00B8A9]"
                            }`}
                    />
                    <button
                        onClick={postComment}
                        disabled={!text.trim() || posting}
                        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all ${text.trim() && !posting ? "bg-[#00B8A9] text-white active:scale-90" : isDark ? "bg-white/10 text-white/30" : "bg-gray-100 text-gray-300"
                            }`}
                    >
                        {posting
                            ? <FaSpinner size={14} className="animate-spin" />
                            : <FaPaperPlane size={14} />
                        }
                    </button>
                </div>
            </div>
        </>
    );
}
