import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaRegComment, FaShare } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const ROLE_META = {
    startup: { label: "Startup", color: "text-[#00B8A9]", bg: "bg-[#00B8A9]/10" },
    investor: { label: "Investor", color: "text-blue-400", bg: "bg-blue-400/10" },
    incubator: { label: "Incubator", color: "text-purple-400", bg: "bg-purple-400/10" },
    viewer: { label: "Viewer", color: "text-gray-400", bg: "bg-gray-400/10" },
};

/** Generate a simple inline SVG avatar when the image fails to load */
const initials = (name = "U") =>
    (name || "U")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

const svgFallback = (name, bg = "#00B8A9") => {
    const text = initials(name);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='${bg}'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='sans-serif'>${text}</text></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const roleColors = {
    startup: "#00B8A9",
    investor: "#3B82F6",
    incubator: "#A855F7",
    viewer: "#6B7280",
};

/**
 * UserPostCard — for investor, incubator, and viewer posts.
 */
export default function UserPostCard({ post, onLike, onSave, onComment, onShare, isDark: isDarkProp }) {
    const { theme } = useTheme();
    const isDark = isDarkProp ?? theme === "dark";
    const navigate = useNavigate();
    const meta = ROLE_META[post.authorRole] || ROLE_META.viewer;

    const avatarFallback = svgFallback(post.authorName, roleColors[post.authorRole] || "#00B8A9");

    return (
        <div className={`rounded-2xl overflow-hidden border ${isDark ? "bg-gray-900 border-white/8" : "bg-white border-gray-100"}`}>
            {/* ── Header ── */}
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-2xl overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        <img
                            src={post.authorAvatar || avatarFallback}
                            alt={post.authorName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback; }}
                        />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate(`/u/${post.authorId || ''}`)}
                            className={`text-sm font-bold truncate hover:underline cursor-pointer bg-transparent border-none p-0 ${isDark ? "text-white" : "text-gray-900"}`}
                        >
                            {post.authorName}
                        </button>
                        <MdVerified size={13} className="text-[#00B8A9] flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
                        {post.timeAgo && <span className={`text-[11px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>· {post.timeAgo}</span>}
                    </div>
                </div>

                {/* ··· menu */}
                <button className={`p-1.5 rounded-lg ${isDark ? "text-gray-500 hover:bg-white/10" : "text-gray-400 hover:bg-gray-100"}`}>
                    <span className="text-lg leading-none">···</span>
                </button>
            </div>

            {/* ── Image ── */}
            {post.imageUrl && (
                <div className="mx-3 rounded-xl overflow-hidden aspect-[4/3]">
                    <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                </div>
            )}

            {/* ── Caption + Hashtags ── */}
            {(post.caption || post.hashtags?.length > 0) && (
                <div className="px-4 pt-2.5 pb-1">
                    {post.caption && (
                        <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{post.caption}</p>
                    )}
                    {post.hashtags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {post.hashtags.map((h, i) => (
                                <span key={i} className="text-xs text-[#00B8A9] font-medium">#{h}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── Action Row ── */}
            <div className={`flex items-center gap-1 px-3 py-2 border-t mt-1 ${isDark ? "border-white/8" : "border-gray-100"}`}>
                {/* Like */}
                <button onClick={onLike} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-90">
                    {post.isLiked
                        ? <FaHeart className="text-[#00B8A9]" size={16} />
                        : <FaRegHeart size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                    {post.likeCount > 0 && <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{post.likeCount}</span>}
                </button>

                {/* Save */}
                <button onClick={onSave} className="p-2 rounded-xl transition-all active:scale-90">
                    {post.isSaved
                        ? <FaBookmark className="text-[#00B8A9]" size={16} />
                        : <FaRegBookmark size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                </button>

                {/* Comment */}
                <button onClick={onComment} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all active:scale-90">
                    <FaRegComment size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
                    {post.commentCount > 0 && <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>{post.commentCount}</span>}
                </button>

                {/* Share */}
                <button onClick={onShare} className="ml-auto p-2 rounded-xl transition-all active:scale-90">
                    <FaShare size={16} className={isDark ? "text-gray-400" : "text-gray-500"} />
                </button>
            </div>
        </div>
    );
}
