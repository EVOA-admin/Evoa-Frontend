import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
    FaHeart, FaRegHeart,
    FaBookmark, FaRegBookmark,
    FaRegComment, FaShare,
    FaEdit, FaTrash, FaFlag, FaLink,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import ensureUrl from "../../utils/ensureUrl";
import postsService from "../../services/postsService";
import PostCommentSheet from "./PostCommentSheet";

/**
 * StartupPostCard — rendered when post._type === 'startup'.
 * Includes:
 *  - Three-dot menu with edit / delete / report / copy link
 *  - Inline comment bottom sheet (matching reel style)
 *  - Share via navigator.share / clipboard
 *
 * Props: post, onLike, onSave, onComment(unused — handled internally), onShare(unused), isDark
 */
export default function StartupPostCard({
    post,
    onLike,
    onSave,
    onShare,
    isDark: isDarkProp,
    onDeleted,   // optional: called after successful delete so parent can refetch
}) {
    const { theme } = useTheme();
    const isDark = isDarkProp ?? theme === "dark";
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    // Three-dot menu
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Comment sheet
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);

    // --- Close menu on outside click ---
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    const fmt = (n) => {
        if (!n && n !== 0) return "0";
        const num = typeof n === "string" ? parseFloat(n) : n;
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
        return String(num);
    };

    const handleWebsiteClick = useCallback((e) => {
        e.stopPropagation();
        if (post.id) postsService.recordWebsiteClick(post.id).catch(() => { });
        window.open(ensureUrl(post.website), "_blank", "noopener,noreferrer");
    }, [post.id, post.website]);

    // Share
    const handleShare = () => {
        const url = `${window.location.origin}/post/${post.id}`;
        if (navigator.share) {
            navigator.share({ title: post.startupName || "Startup Post", url }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(url).then(() => {
                // Brief visual feedback via onShare from parent if provided
            }).catch(() => { });
            onShare?.();
        }
    };

    // Delete
    const isOwner = currentUser?.id && (currentUser.id === post.authorId);

    const handleDelete = async () => {
        setMenuOpen(false);
        if (!window.confirm("Delete this post?")) return;
        try {
            await postsService.deletePost?.(post.id);
            onDeleted?.(post.id);
        } catch (e) {
            alert("Failed to delete post.");
        }
    };

    const handleCopyLink = () => {
        setMenuOpen(false);
        const url = `${window.location.origin}/post/${post.id}`;
        navigator.clipboard?.writeText(url);
    };

    const logoFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.startupName || "S")}&background=00B8A9&color=fff&size=72`;

    return (
        <>
            <div className={`rounded-3xl overflow-hidden shadow-sm border ${isDark ? "bg-gray-900 border-white/8" : "bg-white border-gray-100"}`}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"} cursor-pointer`}
                            onClick={() => post.authorId && navigate(`/u/${post.authorId}`)}
                        >
                            <img
                                src={post.startupLogo || logoFallback}
                                alt={post.startupName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = logoFallback; }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => post.authorId && navigate(`/u/${post.authorId}`)}
                                    className={`text-sm font-bold hover:underline bg-transparent border-none p-0 cursor-pointer leading-tight truncate ${isDark ? "text-white" : "text-gray-900"}`}
                                >
                                    {post.startupName}
                                </button>
                                <MdVerified size={13} className="text-[#00B8A9] flex-shrink-0" />
                                {post.website && (
                                    <button
                                        onClick={handleWebsiteClick}
                                        className="flex items-center text-[#00B8A9] hover:text-[#00968a] transition-colors flex-shrink-0"
                                        title={post.website}
                                    >
                                        <FaLink size={12} />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium bg-[#00B8A9]/10 text-[#00B8A9]">Startup</span>
                                {post.timeAgo && (
                                    <span className={`text-[11px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>· {post.timeAgo}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ··· three-dot menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-500"}`}
                        >
                            <HiDotsHorizontal size={18} />
                        </button>

                        {menuOpen && (
                            <div className={`absolute right-0 top-10 z-30 w-48 rounded-2xl shadow-xl overflow-hidden border ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                                {isOwner && (
                                    <>
                                        <MenuItem icon={<FaEdit size={14} />} label="Edit post"
                                            onClick={() => { setMenuOpen(false); navigate(`/edit-post/${post.id}`); }}
                                            isDark={isDark} />
                                        <MenuItem icon={<FaTrash size={14} />} label="Delete post"
                                            onClick={handleDelete}
                                            isDark={isDark} danger />
                                    </>
                                )}
                                <MenuItem icon={<FaLink size={14} />} label="Copy link"
                                    onClick={handleCopyLink} isDark={isDark} />
                                <MenuItem icon={<FaShare size={14} />} label="Share post"
                                    onClick={() => { setMenuOpen(false); handleShare(); }} isDark={isDark} />
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Hero Image ── */}
                {post.imageUrl && (
                    <div className="mx-3 rounded-2xl overflow-hidden aspect-[16/9]">
                        <img
                            src={post.imageUrl}
                            alt={post.startupName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                    </div>
                )}

                {/* ── Tagline + Sectors ── */}
                {(post.tagline || post.sectors?.length > 0) && (
                    <div className="px-4 pt-2 pb-1">
                        {post.tagline && (
                            <p className={`text-sm leading-snug mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{post.tagline}</p>
                        )}
                        {post.sectors?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {post.sectors.map((s, i) => (
                                    <span key={i} className={`text-xs px-2.5 py-0.5 rounded-full border ${isDark ? "border-white/15 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                                        #{s}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Stats Row ── */}
                <div className={`mx-4 grid grid-cols-3 divide-x border rounded-2xl py-3 mb-2 ${isDark ? "border-white/10 divide-white/10 bg-gray-800/60" : "border-gray-100 divide-gray-100 bg-gray-50"}`}>
                    <StatCol label="Pitch Views" value={fmt(post.pitchViews)} />
                    <StatCol label="Supporters" value={fmt(post.supporters)} />
                    <StatCol label="Click Through" value={fmt(post.clickThrough)} />
                </div>

                {/* ── Investor Thoughts ── */}
                {post.investorThoughts?.length > 0 && (
                    <div
                        className={`mx-4 mb-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl border cursor-pointer ${isDark ? "border-white/10 bg-gray-800/60 active:bg-white/5" : "border-gray-100 bg-gray-50 active:bg-gray-100"}`}
                        onClick={() => setCommentOpen(true)}
                    >
                        <div className="flex -space-x-2">
                            {post.investorThoughts.slice(0, 4).map((t, i) => (
                                <div key={i} className={`w-7 h-7 rounded-full overflow-hidden border-2 ${isDark ? "border-gray-900" : "border-white"}`}>
                                    <img
                                        src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || "I")}&size=56`}
                                        alt={t.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Investor's Thought</span>
                    </div>
                )}

                {/* ── Action Row ── */}
                <div className={`flex items-center gap-1 px-3 py-2 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}>
                    <button onClick={onLike} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-90">
                        {post.isLiked
                            ? <FaHeart className="text-[#00B8A9]" size={16} />
                            : <FaRegHeart size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                        {post.likeCount > 0 && (
                            <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{fmt(post.likeCount)}</span>
                        )}
                    </button>

                    <button onClick={onSave} className="p-2 rounded-xl transition-all active:scale-90">
                        {post.isSaved
                            ? <FaBookmark className="text-[#00B8A9]" size={16} />
                            : <FaRegBookmark size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                    </button>

                    <button onClick={() => setCommentOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-90">
                        <FaRegComment size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
                        {commentCount > 0 && (
                            <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{fmt(commentCount)}</span>
                        )}
                    </button>

                    <button onClick={handleShare} className="ml-auto p-2 rounded-xl transition-all active:scale-90">
                        <FaShare size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
                    </button>
                </div>
            </div>

            {/* ── Comment Sheet ── */}
            <PostCommentSheet
                isOpen={commentOpen}
                onClose={() => setCommentOpen(false)}
                postId={post.id}
                postTitle={post.startupName}
                onCommentAdded={() => setCommentCount(c => c + 1)}
            />
        </>
    );
}

function StatCol({ label, value }) {
    return (
        <div className="flex flex-col items-center px-2">
            <span className="text-lg font-black text-[#00B8A9]">{value}</span>
            <span className="text-[10px] text-gray-400 font-medium">{label}</span>
        </div>
    );
}

function ActionBtn({ icon, label, onPress, isDark }) {
    return (
        <button
            onClick={onPress}
            className="flex items-center gap-1.5 p-2 rounded-xl transition-all active:scale-90"
        >
            {icon}
            {label && (
                <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    {label}
                </span>
            )}
        </button>
    );
}

function MenuItem({ icon, label, onClick, isDark, danger }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${danger
                ? (isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50")
                : (isDark ? "text-white/80 hover:bg-white/[0.08]" : "text-gray-700 hover:bg-gray-50")
                }`}
        >
            <span className={danger ? (isDark ? "text-red-400" : "text-red-500") : (isDark ? "text-white/50" : "text-gray-400")}>
                {icon}
            </span>
            {label}
        </button>
    );
}
