import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaTimes, FaPaperPlane, FaSpinner, FaRegComment } from "react-icons/fa";
import reelsService from "../../services/reelsService";

/**
 * ReelCommentSheet — Instagram-style bottom sheet for pitch reel comments.
 * Rendered using ReactDOM.createPortal directly into document.body to ensure
 * it is never trapped by parent overflow:hidden or CSS stacking contexts.
 */
export default function ReelCommentSheet({ isOpen, onClose, pitchId, pitchTitle, onCommentAdded }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { user: currentUser } = useAuth();

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useState("");
    const [posting, setPosting] = useState(false);
    const inputRef = useRef(null);

    // Fetch comments when sheet opens
    useEffect(() => {
        if (!isOpen || !pitchId) return;
        let mounted = true;
        setLoading(true);
        setComments([]);
        reelsService.getComments(pitchId)
            .then(res => {
                if (!mounted) return;
                const data = res?.data?.data || res?.data || [];
                setComments(Array.isArray(data) ? data : []);
            })
            .catch(() => { if (mounted) setComments([]); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [isOpen, pitchId]);

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
            await reelsService.commentOnReel(pitchId, trimmed);
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

    return ReactDOM.createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
                onClick={onClose}
            />

            {/* Bottom Sheet Modal */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[99999] max-w-lg mx-auto rounded-t-3xl flex flex-col shadow-2xl transition-all duration-300"
                style={{
                    maxHeight: "80vh",
                    height: "60vh",
                    background: isDark ? "#121212" : "#ffffff",
                    borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}`,
                }}
            >
                {/* Drag handle */}
                <div className="w-full flex justify-center py-2 flex-shrink-0 cursor-grab">
                    <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-300"}`} />
                </div>

                {/* Header */}
                <div className={`flex items-center justify-between px-5 pb-3 border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    <div className="flex items-center gap-2">
                        <FaRegComment size={18} className="text-evoa" />
                        <span className={`font-bold text-base ${isDark ? "text-white" : "text-gray-900"}`}>
                            Comments {pitchTitle ? `· ${pitchTitle}` : ""}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-400"}`}
                    >
                        <FaTimes size={15} />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner size={24} className="animate-spin text-evoa" />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className={`text-center py-12 text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        comments.map(c => {
                            const name = c.user?.fullName || c.authorName || "User";
                            const avatar = c.user?.avatarUrl || c.authorAvatar;
                            const time = c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
                            return (
                                <div key={c.id} className="flex gap-3 text-xs items-start">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700">
                                        <img
                                            src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=64`}
                                            alt={name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{name}</span>
                                            {time && <span className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-400"}`}>{time}</span>}
                                        </div>
                                        <p className={`mt-1 text-xs leading-relaxed break-words ${isDark ? "text-white/80" : "text-gray-700"}`}>{c.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Footer */}
                <div className={`p-3 border-t flex-shrink-0 ${isDark ? "border-white/10 bg-[#121212]" : "border-gray-100 bg-white"}`}>
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder="Write a comment..."
                            className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? "text-white placeholder-white/40" : "text-gray-900 placeholder-gray-400"}`}
                        />
                        <button
                            onClick={postComment}
                            disabled={!text.trim() || posting}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white bg-evoa hover:opacity-90 transition-all ${
                                !text.trim() || posting ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                            }`}
                        >
                            {posting ? <FaSpinner size={12} className="animate-spin" /> : <FaPaperPlane size={12} />}
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
