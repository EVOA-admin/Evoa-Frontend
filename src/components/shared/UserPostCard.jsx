import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaRegComment, FaShare, FaEdit, FaTrash, FaFlag, FaLink } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import { goToProfile } from "../../utils/profileNavigation";
import postsService from "../../services/postsService";
import PostCommentSheet from "./PostCommentSheet";
import PostCarousel from "./PostCarousel";

/* ─── Glassmorphism styles for UserPostCard ─── */
const CARD_CSS = `
/* ── Glass card container ── */
.upc-card {
  margin: 8px 10px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid;
  transition: box-shadow .3s, transform .2s;
  animation: card-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.upc-card.dark {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.09);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.35),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
.upc-card.light {
  background: rgba(255,255,255,0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.88);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.07),
    inset 0 1px 0 rgba(255,255,255,0.95);
}

/* ── Role badge — glass pill ── */
.upc-role-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  border: 1px solid;
  letter-spacing: 0.02em;
}
.upc-role-badge.startup  { color: var(--evoa-accent-primary); background: rgba(0,184,169,0.12); border-color: rgba(0,184,169,0.25); }
.upc-role-badge.investor  { color: #60A5FA; background: rgba(96,165,250,0.12); border-color: rgba(96,165,250,0.25); }
.upc-role-badge.incubator { color: #C084FC; background: rgba(192,132,252,0.12); border-color: rgba(192,132,252,0.25); }
.upc-role-badge.viewer    { color: #9CA3AF; background: rgba(156,163,175,0.12); border-color: rgba(156,163,175,0.25); }

/* ── Avatar ring ── */
.upc-avatar-ring {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid;
  flex-shrink: 0;
}
.upc-avatar-ring.startup  { border-color: rgba(0,184,169,0.45);   box-shadow: 0 0 8px rgba(0,184,169,0.25); }
.upc-avatar-ring.investor { border-color: rgba(96,165,250,0.45);  box-shadow: 0 0 8px rgba(96,165,250,0.25); }
.upc-avatar-ring.incubator{ border-color: rgba(192,132,252,0.45); box-shadow: 0 0 8px rgba(192,132,252,0.25); }
.upc-avatar-ring.viewer   { border-color: rgba(156,163,175,0.3); }

/* ── Fixed image area — always 4:3, no image = decorative gradient ── */
.upc-image-area {
  margin: 0 10px 8px;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  flex-shrink: 0;
}

/* Decorative placeholder when no image */
.upc-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upc-card.dark  .upc-image-placeholder {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,184,169,0.04) 100%);
}
.upc-card.light .upc-image-placeholder {
  background: linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,184,169,0.03) 100%);
}

/* ── Caption — truncated by default, expands smoothly ── */
.upc-caption-wrap {
  overflow: hidden;
  transition: max-height 0.38s cubic-bezier(0.22, 1, 0.36, 1);
}
.upc-caption-wrap.collapsed {
  /* 2 lines: line-height ~1.5 × font-size 14px × 2 = 42px */
  max-height: 42px;
}
.upc-caption-wrap.expanded {
  max-height: 600px;
}

.upc-caption-text {
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
.upc-caption-text.clamped {
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.upc-caption-text.unclamped {
  -webkit-line-clamp: unset;
  overflow: visible;
}

/* ── More / Less toggle button ── */
.upc-more-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: opacity .2s;
  margin-top: 2px;
  display: inline-block;
}
.upc-more-btn:hover { opacity: 0.75; }
.upc-card.dark  .upc-more-btn { color: rgba(255,255,255,0.35); }
.upc-card.light .upc-more-btn { color: rgba(0,0,0,0.38); }

/* ── Hashtag ── */
.upc-hashtag {
  font-size: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--evoa-accent-light), var(--evoa-accent-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Action divider ── */
.upc-action-divider {
  height: 1px;
  margin: 0;
}
.upc-card.dark  .upc-action-divider { background: rgba(255,255,255,0.07); }
.upc-card.light .upc-action-divider { background: rgba(0,0,0,0.06); }

/* ── Action buttons ── */
.upc-action-btn {
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
.upc-action-btn:active { transform: scale(0.88); }
.upc-card.dark  .upc-action-btn:hover { background: rgba(255,255,255,0.07); }
.upc-card.light .upc-action-btn:hover { background: rgba(0,0,0,0.05); }

/* ── Glass dropdown menu ── */
.upc-menu {
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
.upc-menu.dark {
  background: rgba(18,18,24,0.92);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-color: rgba(255,255,255,0.12);
  box-shadow: 0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07);
}
.upc-menu.light {
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border-color: rgba(255,255,255,0.9);
  box-shadow: 0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1);
}
`;

const ROLE_META = {
    startup:  { label: "Startup",   roleClass: "startup"  },
    investor: { label: "Investor",  roleClass: "investor" },
    incubator:{ label: "Incubator", roleClass: "incubator"},
    viewer:   { label: "Viewer",    roleClass: "viewer"   },
};

const initials = (name = "U") =>
    (name || "U").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const svgFallback = (name, bg = "var(--evoa-accent-primary)") => {
    const text = initials(name);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='${bg}'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='sans-serif'>${text}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const roleColors = { startup: "var(--evoa-accent-primary)", investor: "#3B82F6", incubator: "#A855F7", viewer: "#6B7280" };

// How many chars roughly fit in 2 lines of a 14px text in ~350px width
const CAPTION_THRESHOLD = 120;

/**
 * UserPostCard — for investor, incubator, and viewer posts.
 *
 * Standardized card layout:
 *  - Fixed 4:3 image area (placeholder gradient when no image).
 *  - Caption clamped to 2 lines with smooth expand/collapse + "more / less".
 *  - Consistent header, action row, and spacing across all posts.
 */
export default function UserPostCard({ post, onLike, onSave, isDark: isDarkProp, onDeleted, onEngagementChange }) {
    const { theme } = useTheme();
    const isDark = isDarkProp ?? theme === "dark";
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const meta = ROLE_META[post.authorRole] || ROLE_META.viewer;
    const avatarFallback = svgFallback(post.authorName, roleColors[post.authorRole] || "var(--evoa-accent-primary)");
    const cardCls = isDark ? "dark" : "light";

    // Caption expand/collapse
    const caption = post.caption || "";
    const needsClamping = caption.length > CAPTION_THRESHOLD;
    const [captionExpanded, setCaptionExpanded] = useState(false);

    // Heart bloom animation
    const [likeAnimating, setLikeAnimating] = useState(false);

    // Three-dot menu
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Comment sheet
    const [commentOpen, setCommentOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(post.commentCount || 0);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    const isOwner = currentUser?.id && (currentUser.id === post.authorId);

    const handleLikeWithBloom = () => {
        setLikeAnimating(true);
        setTimeout(() => setLikeAnimating(false), 500);
        onLike?.();
    };

    const handleShare = () => {
        const url = `${window.location.origin}/post/${post.id}`;
        postsService.sharePost(post.id).then(() => onEngagementChange?.()).catch(() => { });
        if (navigator.share) {
            navigator.share({ title: post.authorName || "Post", url }).catch(() => { });
        } else {
            navigator.clipboard?.writeText(url);
        }
    };

    const handleDelete = async () => {
        setMenuOpen(false);
        if (!window.confirm("Delete this post?")) return;
        try {
            await postsService.deletePost?.(post.id);
            onDeleted?.(post.id);
        } catch { alert("Failed to delete post."); }
    };

    const handleCopyLink = () => {
        setMenuOpen(false);
        navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`);
    };

    // Resolve images
    const images = post.imageUrls?.length
        ? post.imageUrls
        : post.imageUrl ? [post.imageUrl] : [];

    return (
        <>
            <style>{CARD_CSS}</style>
            <div className={`upc-card ${cardCls}`}>

                {/* ── Header ── */}
                <div className="flex items-center gap-3 px-3 py-3">
                    <div className={`upc-avatar-ring ${meta.roleClass}`}>
                        <img
                            src={post.authorAvatar || avatarFallback}
                            alt={post.authorName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback; }}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => goToProfile(post.authorId, currentUser, navigate)}
                                className={`text-sm font-bold truncate hover:underline cursor-pointer bg-transparent border-none p-0 ${isDark ? "text-white" : "text-gray-900"}`}
                            >
                                {post.authorName}
                            </button>
                            <MdVerified size={13} className="text-evoa flex-shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`upc-role-badge ${meta.roleClass}`}>{meta.label}</span>
                            {post.timeAgo && <span className={`text-[11px] ${isDark ? "text-white/30" : "text-gray-400"}`}>· {post.timeAgo}</span>}
                        </div>
                    </div>

                    {/* Three-dot menu */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen(o => !o)}
                            className={`p-1.5 rounded-xl transition-all ${isDark ? "text-white/30 hover:text-white/70 hover:bg-white/8" : "text-gray-400 hover:text-gray-600 hover:bg-black/5"}`}
                        >
                            <HiDotsHorizontal size={18} />
                        </button>

                        {menuOpen && (
                            <div className={`upc-menu ${cardCls}`}>
                                {isOwner && (
                                    <>
                                        <MenuItem icon={<FaEdit size={14} />} label="Edit post"
                                            onClick={() => { setMenuOpen(false); navigate(`/edit-post/${post.id}`); }}
                                            isDark={isDark} />
                                        <MenuItem icon={<FaTrash size={14} />} label="Delete post"
                                            onClick={handleDelete} isDark={isDark} danger />
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

                {/* ── Fixed image area (always rendered for consistent height) ── */}
                <div className="upc-image-area">
                    {images.length === 1 ? (
                        <img
                            src={images[0]}
                            alt="Post"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                    ) : images.length > 1 ? (
                        <PostCarousel images={images} aspectRatio="4/3" isDark={isDark} />
                    ) : (
                        /* No image — decorative placeholder keeps card height consistent */
                        <div className="upc-image-placeholder">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.18">
                                <rect x="6" y="10" width="36" height="28" rx="6"
                                    stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none"/>
                                <circle cx="17" cy="20" r="4"
                                    stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5" fill="none"/>
                                <path d="M6 30l9-8 7 6 6-5 14 11"
                                    stroke={isDark ? "#ffffff" : "#000000"} strokeWidth="1.5"
                                    strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    )}
                </div>

                {/* ── Caption + Hashtags ── */}
                {(caption || post.hashtags?.length > 0) && (
                    <div className="px-4 pt-1 pb-1">
                        {caption && (
                            <>
                                {/* Animated height wrapper */}
                                <div className={`upc-caption-wrap ${captionExpanded ? "expanded" : "collapsed"}`}>
                                    <p className={`upc-caption-text ${captionExpanded ? "unclamped" : "clamped"} ${isDark ? "text-white/75" : "text-gray-700"}`}>
                                        {caption}
                                    </p>
                                </div>

                                {/* More / Less toggle — only shown when caption is long enough to need it */}
                                {needsClamping && (
                                    <button
                                        className="upc-more-btn"
                                        onClick={() => setCaptionExpanded(v => !v)}
                                        aria-expanded={captionExpanded}
                                    >
                                        {captionExpanded ? "less" : "more"}
                                    </button>
                                )}
                            </>
                        )}

                        {post.hashtags?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {post.hashtags.map((h, i) => (
                                    <span key={i} className="upc-hashtag">#{h}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Action Row ── */}
                <div className="upc-action-divider mt-2" />
                <div className="flex items-center gap-0.5 px-2 py-1.5">
                    {/* Like */}
                    <button onClick={handleLikeWithBloom} className="upc-action-btn">
                        <span className={likeAnimating ? "animate-like-bloom" : ""} style={{ display: "inline-flex" }}>
                            {post.isLiked
                                ? <FaHeart className="text-evoa" size={16} style={{ filter: "drop-shadow(0 0 4px rgba(0,184,169,0.6))" }} />
                                : <FaRegHeart size={16} className={isDark ? "text-white/40" : "text-gray-400"} />}
                        </span>
                        {post.likeCount > 0 && <span className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{post.likeCount}</span>}
                    </button>

                    {/* Save */}
                    <button onClick={onSave} className="upc-action-btn">
                        {post.isSaved
                            ? <FaBookmark className="text-evoa" size={16} style={{ filter: "drop-shadow(0 0 4px rgba(0,184,169,0.6))" }} />
                            : <FaRegBookmark size={16} className={isDark ? "text-white/40" : "text-gray-400"} />}
                    </button>

                    {/* Comment */}
                    <button onClick={() => setCommentOpen(true)} className="upc-action-btn">
                        <FaRegComment size={16} className={isDark ? "text-white/40" : "text-gray-400"} />
                        {commentCount > 0 && <span className={`text-xs font-semibold ${isDark ? "text-white/50" : "text-gray-500"}`}>{commentCount}</span>}
                    </button>

                    {/* Share */}
                    <button onClick={handleShare} className="upc-action-btn ml-auto">
                        <FaShare size={15} className={isDark ? "text-white/40" : "text-gray-400"} />
                    </button>
                </div>
            </div>

            {/* ── Comment Sheet ── */}
            <PostCommentSheet
                isOpen={commentOpen}
                onClose={() => setCommentOpen(false)}
                postId={post.id}
                postTitle={post.authorName}
                onCommentAdded={() => {
                    setCommentCount(c => c + 1);
                    onEngagementChange?.();
                }}
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
