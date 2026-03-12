import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaHeart, FaTrash, FaEdit, FaPlay, FaRegImages, FaSpinner } from "react-icons/fa";
import postsService from "../../services/postsService";
import { reelsService } from "../../services/reelsService";

/**
 * ProfileContentGrid
 *
 * A reusable grid of post/reel cards for the "Posts" tab on any profile page.
 *
 * Props:
 *   isDark    : boolean
 *   isOwner   : boolean  — show edit/delete controls
 *   fetchFn   : async () => item[]   — primary fetch (posts)
 *   fetchFn2  : async () => item[]   — optional secondary fetch (reels)
 *   role      : 'startup' | 'investor' | 'incubator' | 'viewer'
 *   onDeleted : (id) => void  (optional)
 */
export default function ProfileContentGrid({ isDark, isOwner, fetchFn, fetchFn2, role, onDeleted }) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError("");

        const p1 = fetchFn().then(res => {
            const data = res?.data?.data || res?.data || res || [];
            return Array.isArray(data) ? data : [];
        }).catch(() => []);

        const p2 = fetchFn2
            ? fetchFn2().then(res => {
                const data = res?.data?.data || res?.data || res || [];
                const arr = Array.isArray(data) ? data : [];
                return arr.map(r => ({ ...r, _isReel: true }));
            }).catch(() => [])
            : Promise.resolve([]);

        Promise.all([p1, p2])
            .then(([posts, reels]) => {
                if (!mounted) return;
                const merged = [...posts, ...reels].sort((a, b) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                );
                setItems(merged);
            })
            .catch(() => { if (mounted) setError("Failed to load content."); })
            .finally(() => { if (mounted) setLoading(false); });

        return () => { mounted = false; };
    }, [fetchFn, fetchFn2]);

    const handleDelete = async (item) => {
        const label = item._isReel ? "reel" : "post";
        if (!window.confirm(`Delete this ${label}?`)) return;
        setDeleting(item.id);
        try {
            if (item._isReel) {
                await reelsService.deleteReel(item.id);
            } else {
                await postsService.deletePost(item.id);
            }
            setItems(prev => prev.filter(p => p.id !== item.id));
            onDeleted?.(item.id);
        } catch {
            alert(`Failed to delete ${label}.`);
        } finally {
            setDeleting(null);
        }
    };

    const fmt = (n = 0) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
        return String(n);
    };

    if (loading) return (
        <div className="flex justify-center py-14">
            <FaSpinner className="animate-spin text-[#00B8A9]" size={26} />
        </div>
    );

    if (error) return (
        <p className={`text-center py-10 text-sm ${isDark ? "text-red-400" : "text-red-500"}`}>{error}</p>
    );

    if (items.length === 0) return (
        <div className={`flex flex-col items-center justify-center py-14 gap-3 ${isDark ? "text-white/30" : "text-gray-300"}`}>
            <FaRegImages size={40} />
            <p className="text-sm">No content yet.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-3 gap-0.5">
            {items.map(item => (
                <ContentCard
                    key={item.id}
                    item={item}
                    isDark={isDark}
                    isOwner={isOwner}
                    deleting={deleting === item.id}
                    onDelete={() => handleDelete(item)}
                    onEdit={() => navigate(`/edit-post/${item.id}`)}
                    fmt={fmt}
                />
            ))}
        </div>
    );
}

function ContentCard({ item, isDark, isOwner, deleting, onDelete, onEdit, fmt }) {
    const [showActions, setShowActions] = useState(false);
    const ref = useRef(null);

    const isReel = !!item._isReel;

    // Track view when card enters viewport
    useEffect(() => {
        if (!item.id) return;
        let fired = false;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !fired) {
                    fired = true;
                    if (isReel) {
                        reelsService.trackView(item.id).catch(() => { });
                    } else {
                        postsService.recordPostView(item.id).catch(() => { });
                    }
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [item.id, isReel]);

    // Thumbnail priority: explicit thumbnailUrl → imageUrl → video element fallback
    const thumb = item.thumbnailUrl || item.imageUrl || null;
    const videoUrl = item.videoUrl || null;

    const viewCount = item.viewCount ?? item.view_count ?? 0;
    const likeCount = item.likeCount ?? item.like_count ?? 0;

    return (
        <div
            ref={ref}
            className="relative aspect-square overflow-hidden cursor-pointer bg-black"
            onClick={() => setShowActions(v => !v)}
        >
            {/* Media */}
            {thumb ? (
                <img
                    src={thumb}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = "none"; }}
                />
            ) : videoUrl ? (
                /* Show first frame of video as preview */
                <video
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    muted
                    playsInline
                    /* seek to 0.5s to capture a visible frame */
                    onLoadedMetadata={e => { e.currentTarget.currentTime = 0.5; }}
                />
            ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                    <FaRegImages size={22} className={isDark ? "text-gray-600" : "text-gray-300"} />
                </div>
            )}

            {/* Reel / video indicator in top-right */}
            {isReel && (
                <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-full p-1">
                    <FaPlay size={8} className="text-white" />
                </div>
            )}

            {/* Stats overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-1.5 pt-5">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-white text-[10px] font-semibold drop-shadow">
                        <FaEye size={9} /> {fmt(viewCount)}
                    </span>
                    <span className="flex items-center gap-0.5 text-white text-[10px] font-semibold drop-shadow">
                        <FaHeart size={9} /> {fmt(likeCount)}
                    </span>
                </div>
            </div>

            {/* Owner action overlay — tap card to reveal */}
            {isOwner && showActions && (
                <div
                    className="absolute inset-0 bg-black/65 flex items-center justify-center gap-5"
                    onClick={e => e.stopPropagation()}
                >
                    {!isReel && (
                        <button
                            onClick={onEdit}
                            className="flex flex-col items-center gap-1 text-white active:scale-90 transition-transform"
                        >
                            <FaEdit size={18} />
                            <span className="text-[9px]">Edit</span>
                        </button>
                    )}
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        className="flex flex-col items-center gap-1 text-red-400 active:scale-90 transition-transform"
                    >
                        {deleting
                            ? <FaSpinner size={18} className="animate-spin" />
                            : <FaTrash size={18} />}
                        <span className="text-[9px]">Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
}
