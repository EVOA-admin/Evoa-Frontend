import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaRegComment, FaShare } from "react-icons/fa";
import { IoLinkOutline } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { BsCurrencyDollar } from "react-icons/bs";
import ensureUrl from "../../utils/ensureUrl";

/**
 * StartupPostCard — matches the QuantumFlow design from the brief.
 *
 * Props:
 *  - post: { id, startupName, startupLogo, tagline, website, sectors,
 *             imageUrl, pitchViews, supporters, clickThrough,
 *             investorThoughts[], isLiked, isSaved, likeCount, commentCount }
 *  - onLike, onSave, onComment, onShare — callbacks
 */
export default function StartupPostCard({ post, onLike, onSave, onComment, onShare, isDark: isDarkProp }) {
    const { theme } = useTheme();
    const isDark = isDarkProp ?? theme === "dark";
    const navigate = useNavigate();

    const fmt = (n) => {
        if (!n && n !== 0) return "—";
        const num = typeof n === "string" ? parseFloat(n) : n;
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
        return String(num);
    };

    return (
        <div className={`rounded-3xl overflow-hidden shadow-sm border ${isDark ? "bg-gray-900 border-white/8" : "bg-white border-gray-100"}`}>
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                        <img
                            src={post.startupLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.startupName || "S")}&background=00B8A9&color=fff&size=72`}
                            alt={post.startupName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{post.startupName}</span>
                </div>
                <button className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-gray-100 text-gray-500"}`}>
                    +
                </button>
            </div>

            {/* ── Hero Image ── */}
            {post.imageUrl && (
                <div className="mx-3 rounded-2xl overflow-hidden aspect-[16/9]">
                    <img src={post.imageUrl} alt={post.startupName} className="w-full h-full object-cover" />
                </div>
            )}

            {/* ── Company Name + Link ── */}
            <div className="px-4 pt-3 pb-1">
                <div className="flex items-center gap-1.5 mb-1">
                    <h3 className={`text-base font-black ${isDark ? "text-white" : "text-gray-900"}`}>{post.startupName}</h3>
                    {post.website && (
                        <a href={ensureUrl(post.website)} target="_blank" rel="noopener noreferrer" className="text-[#00B8A9]">
                            <IoLinkOutline size={15} />
                        </a>
                    )}
                </div>
                {post.tagline && (
                    <p className={`text-sm leading-snug mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{post.tagline}</p>
                )}
                {/* Hashtags */}
                {post.sectors?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.sectors.map((s, i) => (
                            <span key={i} className={`text-xs px-2.5 py-0.5 rounded-full border ${isDark ? "border-white/15 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                                #{s}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Stats Row ── */}
            <div className={`mx-4 grid grid-cols-3 divide-x border rounded-2xl py-3 mb-3 ${isDark ? "border-white/10 divide-white/10 bg-gray-800/60" : "border-gray-100 divide-gray-100 bg-gray-50"}`}>
                <StatCol label="Pitch Views" value={fmt(post.pitchViews ?? post.viewCount)} />
                <StatCol label="Supporters" value={fmt(post.supporters ?? post.likeCount)} />
                <StatCol label="Click Through" value={fmt(post.clickThrough ?? post.shareCount)} />
            </div>

            {/* ── Investor Thought Bar ── */}
            {post.investorThoughts?.length > 0 && (
                <div className={`mx-4 mb-3 flex items-center gap-3 px-3 py-2.5 rounded-2xl border ${isDark ? "border-white/10 bg-gray-800/60" : "border-gray-100 bg-gray-50"}`}>
                    <div className="flex -space-x-2">
                        {post.investorThoughts.slice(0, 4).map((t, i) => (
                            <div key={i} className={`w-7 h-7 rounded-full overflow-hidden border-2 ${isDark ? "border-gray-900" : "border-white"}`}>
                                <img src={t.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || "I")}&size=56`} alt={t.name} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Investor's Thought</span>
                </div>
            )}

            {/* ── Action Row ── */}
            <div className={`flex items-center justify-around px-4 py-2.5 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}>
                <ActionBtn
                    icon={post.isLiked ? <FaHeart className="text-[#00B8A9]" size={18} /> : <FaRegHeart size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                    badge={<BsCurrencyDollar size={10} className={isDark ? "text-gray-500" : "text-gray-400"} />}
                    onPress={onLike}
                />
                <ActionBtn
                    icon={post.isSaved ? <FaBookmark className="text-[#00B8A9]" size={18} /> : <FaRegBookmark size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                    onPress={onSave}
                />
                <ActionBtn
                    icon={<FaRegComment size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                    onPress={onComment}
                />
                <ActionBtn
                    icon={<FaShare size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />}
                    onPress={onShare}
                />
            </div>
        </div>
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

function ActionBtn({ icon, badge, onPress }) {
    return (
        <button onClick={onPress} className="relative p-2 flex items-center justify-center active:scale-90 transition-transform">
            {icon}
            {badge && <span className="absolute bottom-1.5 right-1">{badge}</span>}
        </button>
    );
}
