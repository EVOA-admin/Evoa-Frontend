import React, { useRef, useState, useEffect, useCallback } from "react";
import { FaImages } from "react-icons/fa";

/**
 * PostCarousel
 * Instagram-like swipeable image carousel with dots + "X / N" counter badge.
 *
 * Props:
 *   images      – string[]   List of image URLs (must have > 0 items)
 *   aspectRatio – string     CSS aspect-ratio value, default "4/3"
 *   isDark      – bool
 *   className   – string     Extra classes on the outer wrapper
 */
export default function PostCarousel({
    images = [],
    aspectRatio = "4/3",
    isDark = false,
    className = "",
}) {
    const trackRef = useRef(null);
    const [current, setCurrent] = useState(0);

    /* ── Sync scroll position → current index ─────────────────────────────── */
    const handleScroll = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        const idx = Math.round(track.scrollLeft / track.clientWidth);
        setCurrent(Math.max(0, Math.min(idx, images.length - 1)));
    }, [images.length]);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        track.addEventListener("scroll", handleScroll, { passive: true });
        return () => track.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    /* ── Programmatic navigation ───────────────────────────────────────────── */
    const goTo = useCallback((idx) => {
        const track = trackRef.current;
        if (!track) return;
        const clamped = Math.max(0, Math.min(idx, images.length - 1));
        track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    }, [images.length]);

    /* ── Touch swipe (pointer events — works on both mobile & desktop) ────── */
    const pointerStart = useRef(null);
    const handlePointerDown = (e) => {
        // Only handle horizontal swipes via one finger / mouse
        pointerStart.current = { x: e.clientX, y: e.clientY, moved: false };
    };
    const handlePointerUp = (e) => {
        const start = pointerStart.current;
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = Math.abs(e.clientY - start.y);
        // Require predominantly horizontal movement (> 30px, < 2:1 vertical ratio)
        if (Math.abs(dx) > 30 && dy < Math.abs(dx) * 1.2) {
            if (dx < 0) goTo(current + 1);
            else goTo(current - 1);
        }
        pointerStart.current = null;
    };

    /* ── Dot count — max 8 visible ─────────────────────────────────────────── */
    const totalDots = Math.min(images.length, 8);
    const dotStart = Math.max(0, Math.min(current - Math.floor(totalDots / 2), images.length - totalDots));

    if (!images.length) return null;

    return (
        <div className={`relative w-full overflow-hidden select-none ${className}`} style={{ aspectRatio }}>
            {/* ── Scroll track ─────────────────────────────────────────── */}
            <div
                ref={trackRef}
                className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                {images.map((src, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 w-full h-full snap-start overflow-hidden"
                    >
                        <img
                            src={src}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                    </div>
                ))}
            </div>

            {/* ── Image count badge (top-right) ─────────────────────────── */}
            {images.length > 1 && (
                <div
                    className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[11px] font-bold text-white"
                    style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(4px)" }}
                >
                    {current + 1} / {images.length}
                </div>
            )}

            {/* ── Dot indicator row (bottom) ────────────────────────────── */}
            {images.length > 1 && (
                <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
                    {Array.from({ length: totalDots }, (_, i) => {
                        const realIdx = dotStart + i;
                        const active = realIdx === current;
                        return (
                            <div
                                key={realIdx}
                                className="rounded-full transition-all duration-300"
                                style={{
                                    width: active ? 7 : 5,
                                    height: active ? 7 : 5,
                                    background: active ? "var(--evoa-accent-primary)" : "rgba(255,255,255,0.70)",
                                    boxShadow: active
                                        ? "0 0 6px rgba(0,184,169,0.8)"
                                        : "0 1px 3px rgba(0,0,0,0.4)",
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* ── Multi-image indicator icon (if only one slide shown) ─── */}
            {images.length > 1 && (
                <div
                    className="absolute top-2.5 left-2.5 p-1 rounded-full"
                    style={{ background: "rgba(0,0,0,0.40)", backdropFilter: "blur(4px)" }}
                >
                    <FaImages size={11} className="text-white opacity-90" />
                </div>
            )}
        </div>
    );
}
