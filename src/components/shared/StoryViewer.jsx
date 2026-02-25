import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaTimes, FaHeart, FaRegHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import storiesService from "../../services/storiesService";

const STORY_DURATION_MS = 5000; // 5 seconds per story

/**
 * Instagram-style full-screen story viewer.
 *
 * Props:
 *   stories   – flat array of story objects (with .user, .mediaUrl etc.)
 *   startIndex – index to open at
 *   onClose   – callback to close the viewer
 */
export default function StoryViewer({ stories = [], startIndex = 0, onClose }) {
    const { theme } = useTheme();
    const { user: currentUser } = useAuth();

    const [current, setCurrent] = useState(startIndex);
    const [progress, setProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const [liked, setLiked] = useState({});         // storyId → boolean
    const [likeAnim, setLikeAnim] = useState(null); // storyId with active heart burst

    const intervalRef = useRef(null);
    const progressRef = useRef(0);
    const tick = 50; // ms between progress ticks

    const story = stories[current];

    // ── Progress timer ──────────────────────────────────────────────────────────
    const startTimer = useCallback(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (paused) return;
            progressRef.current += (tick / STORY_DURATION_MS) * 100;
            setProgress(progressRef.current);
            if (progressRef.current >= 100) {
                clearInterval(intervalRef.current);
                goNext();
            }
        }, tick);
    }, [paused, current]); // eslint-disable-line react-hooks/exhaustive-deps

    const resetAndStart = useCallback((idx) => {
        clearInterval(intervalRef.current);
        progressRef.current = 0;
        setProgress(0);
        setCurrent(idx);
    }, []);

    useEffect(() => {
        resetAndStart(startIndex);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        startTimer();
        return () => clearInterval(intervalRef.current);
    }, [current, paused]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Navigation ──────────────────────────────────────────────────────────────
    const goNext = useCallback(() => {
        if (current < stories.length - 1) {
            resetAndStart(current + 1);
        } else {
            onClose();
        }
    }, [current, stories.length, resetAndStart, onClose]);

    const goPrev = useCallback(() => {
        if (current > 0) {
            resetAndStart(current - 1);
        }
    }, [current, resetAndStart]);

    // ── Like ────────────────────────────────────────────────────────────────────
    const handleLike = async () => {
        if (!story) return;
        const wasLiked = liked[story.id];
        setLiked((prev) => ({ ...prev, [story.id]: !wasLiked }));

        if (!wasLiked) {
            setLikeAnim(story.id);
            setTimeout(() => setLikeAnim(null), 800);
            try {
                await storiesService.likeStory(story.id);
            } catch (_) { }
        }
    };

    // ── Keyboard nav ────────────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") goNext();
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [goNext, goPrev, onClose]);

    if (!story) return null;

    const authorAvatar =
        story.user?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            story.user?.fullName || "U"
        )}&background=6366f1&color=fff`;
    const authorName =
        story.user?.fullName || story.user?.email?.split("@")[0] || "User";
    const timeAgo = (() => {
        const diff = Date.now() - new Date(story.createdAt).getTime();
        const h = Math.floor(diff / 3600000);
        if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
        return `${h}h ago`;
    })();

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black"
            style={{ touchAction: "none" }}
        >
            {/* ── Main story card ─────────────────────────────────────── */}
            <div
                className="relative w-full max-w-sm h-full sm:h-[calc(100vh-40px)] sm:max-h-[800px] sm:rounded-2xl overflow-hidden bg-black select-none"
            >
                {/* Media */}
                {story.mediaUrl?.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                        key={story.id}
                        src={story.mediaUrl}
                        autoPlay
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                        onPause={() => setPaused(true)}
                        onPlay={() => setPaused(false)}
                    />
                ) : (
                    <img
                        key={story.id}
                        src={story.mediaUrl}
                        alt="Story"
                        className="absolute inset-0 w-full h-full object-cover"
                        draggable={false}
                    />
                )}

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

                {/* ── Progress bars ── */}
                <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                    {stories.map((s, i) => (
                        <div key={s.id} className="flex-1 h-[2.5px] bg-white/30 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-none"
                                style={{
                                    width:
                                        i < current ? "100%" : i === current ? `${progress}%` : "0%",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* ── Header ── */}
                <div className="absolute top-8 left-0 right-0 px-4 flex items-center gap-3 z-10">
                    <img
                        src={authorAvatar}
                        alt={authorName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold leading-tight truncate">{authorName}</p>
                        <p className="text-white/60 text-[11px]">{timeAgo}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                    >
                        <FaTimes size={13} />
                    </button>
                </div>

                {/* ── Tap zones for prev / next ── */}
                <button
                    className="absolute left-0 top-0 w-1/3 h-full z-20"
                    onMouseDown={() => setPaused(true)}
                    onMouseUp={() => { setPaused(false); goPrev(); }}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => { setPaused(false); goPrev(); }}
                />
                <button
                    className="absolute right-0 top-0 w-1/3 h-full z-20"
                    onMouseDown={() => setPaused(true)}
                    onMouseUp={() => { setPaused(false); goNext(); }}
                    onTouchStart={() => setPaused(true)}
                    onTouchEnd={() => { setPaused(false); goNext(); }}
                />

                {/* ── Prev / Next arrows (visible on wide screens) ── */}
                <button
                    onClick={goPrev}
                    disabled={current === 0}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition-all disabled:opacity-0"
                >
                    <FaChevronLeft size={14} />
                </button>
                <button
                    onClick={goNext}
                    disabled={current === stories.length - 1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/25 transition-all disabled:opacity-0"
                >
                    <FaChevronRight size={14} />
                </button>

                {/* ── Like button (bottom right) ── */}
                <div className="absolute bottom-8 right-5 z-30">
                    <button
                        onClick={handleLike}
                        className="flex flex-col items-center gap-1 focus:outline-none"
                    >
                        {liked[story.id] ? (
                            <FaHeart size={28} className="text-red-500 drop-shadow-lg" />
                        ) : (
                            <FaRegHeart size={28} className="text-white drop-shadow-lg" />
                        )}
                        <span className="text-white text-xs drop-shadow">
                            {(story.likeCount || 0) + (liked[story.id] ? 1 : 0)}
                        </span>
                    </button>
                </div>

                {/* ── Double-tap heart burst animation ── */}
                {likeAnim === story.id && (
                    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                        <FaHeart
                            size={80}
                            className="text-white animate-ping"
                            style={{ opacity: 0.85 }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
