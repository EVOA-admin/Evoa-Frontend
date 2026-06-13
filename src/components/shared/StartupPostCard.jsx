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
import { goToProfile } from "../../utils/profileNavigation";
import postsService from "../../services/postsService";
import PostCommentSheet from "./PostCommentSheet";
import InvestorThoughtSheet from "./InvestorThoughtSheet";
import PostCarousel from "./PostCarousel";

/* ─── Glassmorphism styles for StartupPostCard ─── */
const CARD_CSS = `
/* ── Glass card container ── */
.spc-card {
  margin: 8px 10px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid;
  transition: box-shadow .3s, transform .2s;
  animation: card-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.spc-card.dark {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.09);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
.spc-card.light {
  background: rgba(255,255,255,0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.88);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.07),
    inset 0 1px 0 rgba(255,255,255,0.95);
}

/* ── Startup badge ── */
.spc-startup-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid rgba(0,184,169,0.3);
  background: rgba(0,184,169,0.12);
  color: #00B8A9;
  letter-spacing: 0.02em;
}

/* ── Logo avatar ring ── */
.spc-logo-ring {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid rgba(0,184,169,0.45);
  box-shadow: 0 0 10px rgba(0,184,169,0.25);
  flex-shrink: 0;
  cursor: pointer;
  transition: box-shadow .2s;
}
.spc-logo-ring:hover {
  box-shadow: 0 0 16px rgba(0,184,169,0.45);
}

/* ── Image area ── */
.spc-image-wrap {
  margin: 0 10px 0;
  border-radius: 14px;
  overflow: hidden;
}

/* ── Sector tags ── */
.spc-sector-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid;
  font-weight: 500;
}
.spc-card.dark  .spc-sector-tag { border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.45); }
.spc-card.light .spc-sector-tag { border-color: rgba(0,0,0,0.12); color: rgba(0,0,0,0.5); }

/* ── Stats row — glassy tiles ── */
.spc-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin: 0 10px 10px;
}

.spc-stat-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 8px;
  border-radius: 14px;
  border: 1px solid;
  text-align: center;
}
.spc-card.dark .spc-stat-tile {
  background: rgba(0,184,169,0.05);
  border-color: rgba(0,184,169,0.15);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}
.spc-card.light .spc-stat-tile {
  background: rgba(0,184,169,0.04);
  border-color: rgba(0,184,169,0.12);
}

.spc-stat-value {
  font-size: 18px;
  font-weight: 900;
  line-height: 1.1;
  background: linear-gradient(135deg, #00E5D3, #00B8A9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.spc-stat-label {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}
.spc-card.dark  .spc-stat-label { color: rgba(255,255,255,0.35); }
.spc-card.light .spc-stat-label { color: rgba(0,0,0,0.4); }

/* ── Investor thoughts strip ── */
.spc-thoughts-strip {
  margin: 0 10px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 16px;
  border: 1px solid;
  cursor: pointer;
  transition: box-shadow .25s, transform .2s, background .2s;
}
.spc-card.dark .spc-thoughts-strip {
  background: rgba(0,184,169,0.04);
  border-color: rgba(0,184,169,0.15);
}
.spc-card.dark .spc-thoughts-strip:hover {
  background: rgba(0,184,169,0.08);
  box-shadow: 0 4px 20px rgba(0,184,169,0.18);
  transform: translateY(-1px);
}
.spc-card.light .spc-thoughts-strip {
  background: rgba(0,184,169,0.04);
  border-color: rgba(0,184,169,0.12);
}
.spc-card.light .spc-thoughts-strip:hover {
  background: rgba(0,184,169,0.08);
  box-shadow: 0 4px 16px rgba(0,184,169,0.12);
  transform: translateY(-1px);
}

/* ── Action divider ── */
.spc-action-divider {
  height: 1px;
  margin: 0;
}
.spc-card.dark  .spc-action-divider { background: rgba(255,255,255,0.07); }
.spc-card.light .spc-action-divider { background: rgba(0,0,0,0.06); }

/* ── Action buttons ── */
.spc-action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background .2s, transform .15s;
  -webkit-tap-highlight-color: transparent;
}
.spc-action-btn:active { transform: scale(0.88); }
.spc-card.dark  .spc-action-btn:hover { background: rgba(255,255,255,0.07); }
.spc-card.light .spc-action-btn:hover { background: rgba(0,0,0,0.05); }

/* ── Glass dropdown menu ── */
.spc-menu {
  position: absolute;
  right: 0;
  top: 42px;
  z-index: 50;
  width: 192px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid;
  animation: card-enter 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.spc-menu.dark {
  background: rgba(18,18,24,0.92);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07);
}
.spc-menu.light {
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-color: rgba(255,255,255,0.9);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1);
}
`;

/**
 * StartupPostCard — rendered when post._type === 'startup'.
 * Full Apple Glassmorphism redesign — glass card, logo glow ring, glass stat tiles,
 * elevated investor thoughts strip, glass menu.
 */
export default function StartupPostCard({
    post,
    onLike,
    onSave,
    onShare,
    isDark: isDarkProp,
    onDeleted,
    onEngagementChange,
}) {
    const { theme } = useTheme();
    const isDark = isDarkProp ?? theme === "dark";
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const cardCls = isDark ? "dark" : "light";

    // Three-dot menu
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Comment sheet
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);

    // Investor Thought sheet (read-only)
    const [thoughtOpen, setThoughtOpen] = useState(false);

    // Like bloom
    const [likeAnimating, setLikeAnimating] = useState(false);

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
        postsService.sharePost(post.id).then(() => onEngagementChange?.()).catch(() => { });
        if (navigator.share) {
            navigator.share({ title: post.startupName || "Startup Post", url }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(url).catch(() => { });
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

    const handleLikeWithBloom = () => {
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500);
        onLike?.();
    };

    const logoFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.startupName || "S")}&background=00B8A9&color=fff&size=72`;

    return (
        <>
            <style>{CARD_CSS}</style>
            <div className={`spc-card ${cardCls}`}>

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-3 py-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="spc-logo-ring"
                            onClick={() => goToProfile(post.authorId, currentUser, navigate)}
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
                                    onClick={() => goToProfile(post.authorId, currentUser, navigate)}
                                    className={`text-sm font-bold hover:underline bg-transparent border-none p-0 cursor-pointer leading-tight truncate ${isDark ? "text-white" : "text-gray-900"}`}
                                >
                                    {post.startupName}
                                </button>
                                <MdVerified size={13} className="text-[#00B8A9] flex-shrink-0" />
                                {post.website && (
                                    <button
                                        onClick={handleWebsiteClick}
                                        className="flex items-center text-[#00B8A9] hover:text-[#00E5D3] transition-colors flex-shrink-0"
                                        title={post.website}
                                    >
                                        <FaLink size={11} />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="spc-startup-badge">Startup</span>
                                {post.timeAgo && (
                                    <span className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-400"}`}>· {post.timeAgo}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ··· three-dot menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/30" : "hover:bg-black/5 text-gray-400"}`}
                        >
                            <HiDotsHorizontal size={18} />
                        </button>

                        {menuOpen && (
                            <div className={`spc-menu ${cardCls}`}>
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

                {/* ── Hero Image / Carousel ── */}
                {(() => {
                    const images = post.imageUrls?.length
                        ? post.imageUrls
                        : post.imageUrl ? [post.imageUrl] : [];
                    if (!images.length) return null;
                    return images.length === 1 ? (
                        <div className="spc-image-wrap aspect-[16/9] mb-2">
                            <img
                                src={images[0]}
                                alt={post.startupName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                        </div>
                    ) : (
                        <div className="mx-2.5 mb-2">
                            <PostCarousel images={images} aspectRatio="16/9" isDark={isDark} />
                        </div>
                    );
                })()}

                {/* ── Tagline + Sectors ── */}
                {(post.tagline || post.sectors?.length > 0) && (
                    <div className="px-4 pt-1 pb-2">
                        {post.tagline && (
                            <p className={`text-sm leading-snug mb-2 ${isDark ? "text-white/55" : "text-gray-600"}`}>{post.tagline}</p>
                        )}
                        {post.sectors?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-1">
                                {post.sectors.map((s, i) => (
                                    <span key={i} className="spc-sector-tag">#{s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Stats Row — glass tiles ── */}
                <div className="spc-stats-row">
                    <div className="spc-stat-tile">
                        <span className="spc-stat-value">{fmt(post.pitchViews)}</span>
                        <span className="spc-stat-label">Pitch Views</span>
                    </div>
                    <div className="spc-stat-tile">
                        <span className="spc-stat-value">{fmt(post.supporters)}</span>
                        <span className="spc-stat-label">Supporters</span>
                    </div>
                    <div className="spc-stat-tile">
                        <span className="spc-stat-value">{fmt(post.clickThrough)}</span>
                        <span className="spc-stat-label">Click Through</span>
                    </div>
                </div>

                {/* ── Investor Thoughts ── */}
                {post.investorThoughts?.length > 0 && (
                    <div
                        className={`spc-thoughts-strip ${cardCls}`}
                        onClick={() => setThoughtOpen(true)}
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
                        <div className="flex flex-col min-w-0">
                            <span className={`text-xs font-semibold truncate ${isDark ? "text-white/80" : "text-gray-700"}`}>
                                {(() => {
                                    const names = post.investorThoughts.map(t => t.name || t.user?.fullName).filter(Boolean);
                                    if (names.length === 0) return "Investor";
                                    const shown = names.slice(0, 2);
                                    const extra = names.length - shown.length;
                                    return shown.join(", ") + (extra > 0 ? ` +${extra} more` : "");
                                })()}
                            </span>
                            <span className={`text-[10px] ${isDark ? "text-white/35" : "text-gray-400"}`}>Investor's Thought</span>
                        </div>
                        <svg className="ml-auto flex-shrink-0 text-[#00B8A9]" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                )}

                {/* ── Action Row ── */}
                <div className="spc-action-divider" />
                <div className="flex items-center gap-0.5 px-2 py-1.5">
                    <button onClick={handleLikeWithBloom} className="spc-action-btn">
                        <span className={likeAnimating ? "animate-like-bloom" : ""} style={{ display: "inline-flex" }}>
                            {post.isLiked
                                ? <FaHeart className="text-[#00B8A9]" size={16} style={{ filter: "drop-shadow(0 0 4px rgba(0,184,169,0.6))" }} />
                                : <FaRegHeart size={16} className={isDark ? "text-white/40" : "text-gray-400"} />}
                        </span>
                        {post.likeCount > 0 && (
                            <span className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{fmt(post.likeCount)}</span>
                        )}
                    </button>

                    <button onClick={onSave} className="spc-action-btn">
                        {post.isSaved
                            ? <FaBookmark className="text-[#00B8A9]" size={16} style={{ filter: "drop-shadow(0 0 4px rgba(0,184,169,0.6))" }} />
                            : <FaRegBookmark size={16} className={isDark ? "text-white/40" : "text-gray-400"} />}
                    </button>

                    <button onClick={() => setCommentOpen(true)} className="spc-action-btn">
                        <FaRegComment size={16} className={isDark ? "text-white/40" : "text-gray-400"} />
                        {commentCount > 0 && (
                            <span className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{fmt(commentCount)}</span>
                        )}
                    </button>

                    <button onClick={handleShare} className="spc-action-btn ml-auto">
                        <FaShare size={15} className={isDark ? "text-white/40" : "text-gray-400"} />
                    </button>
                </div>
            </div>

            {/* ── Regular Comment Sheet ── */}
            <PostCommentSheet
                isOpen={commentOpen}
                onClose={() => setCommentOpen(false)}
                postId={post.id}
                postTitle={post.startupName}
                onCommentAdded={() => {
                    setCommentCount(c => c + 1);
                    onEngagementChange?.();
                }}
            />

            {/* ── Investor Thought Sheet (read-only, investor comments only) ── */}
            <InvestorThoughtSheet
                isOpen={thoughtOpen}
                onClose={() => setThoughtOpen(false)}
                postId={post.id}
                postTitle={post.startupName}
            />
        </>
    );
}

function MenuItem({ icon, label, onClick, isDark, danger }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${danger
                ? (isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50")
                : (isDark ? "text-white/80 hover:bg-white/[0.08]" : "text-gray-700 hover:bg-black/[0.04]")
                }`}
        >
            <span className={danger ? (isDark ? "text-red-400" : "text-red-500") : (isDark ? "text-white/40" : "text-gray-400")}>
                {icon}
            </span>
            {label}
        </button>
    );
}
