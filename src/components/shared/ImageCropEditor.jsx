import React, { useEffect, useRef, useState, useCallback } from "react";
import { IoCheckmark, IoExpand } from "react-icons/io5";

/**
 * ImageCropEditor
 * Zero-dependency, canvas-based image crop/reposition editor.
 *
 * Props:
 *   src         – object-URL of the image to crop
 *   aspectRatio – output frame W/H ratio (default 4/3)
 *   onConfirm   – fn(blob) — called with the cropped JPEG blob
 *   isDark      – bool
 */
export default function ImageCropEditor({
    src,
    aspectRatio = 4 / 3,
    onConfirm,
    isDark = false,
}) {
    const containerRef  = useRef(null);
    const canvasRef     = useRef(null);
    const imgRef        = useRef(null);
    const stateRef      = useRef({
        scale: 1, minScale: 1,
        offsetX: 0, offsetY: 0,
        dragging: false,
        lastX: 0, lastY: 0,          // raw clientX/Y (touch & mouse)
        lastDist: null,
        pivotX: 0, pivotY: 0,        // pinch pivot in canvas-local px
    });
    const rafIdRef      = useRef(null);

    const [ready, setReady]           = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [error, setError]           = useState(null);

    // ── clamp utility ─────────────────────────────────────────────────────────
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

    /**
     * Clamp image offset so the image stays visible and centred.
     *
     * When the image is SMALLER than the canvas (contain mode):
     *   the image stays centred — it can't be dragged at all.
     *   (lo = 0 .. hi = canvas - iW  →  free range within the frame)
     *
     * When the image is LARGER than the canvas (zoomed-in / cover mode):
     *   the image must always cover the frame.
     *   (lo = canvas - iW .. hi = 0  →  negative range keeps edges flush)
     */
    const clampOffset = (ox, oy, sc) => {
        const canvas = canvasRef.current;
        const img    = imgRef.current;
        if (!canvas || !img) return { x: ox, y: oy };

        const iW = img.naturalWidth  * sc;
        const iH = img.naturalHeight * sc;

        // x-axis
        let xLo, xHi;
        if (iW >= canvas.width) {
            xLo = canvas.width - iW;  // image wider → must cover left & right
            xHi = 0;
        } else {
            xLo = 0;                  // image narrower → keep inside frame
            xHi = canvas.width - iW;
        }

        // y-axis
        let yLo, yHi;
        if (iH >= canvas.height) {
            yLo = canvas.height - iH;
            yHi = 0;
        } else {
            yLo = 0;
            yHi = canvas.height - iH;
        }

        return {
            x: clamp(ox, xLo, xHi),
            y: clamp(oy, yLo, yHi),
        };
    };

    // ── draw loop ─────────────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const img    = imgRef.current;
        if (!canvas || !img || canvas.width === 0 || canvas.height === 0) {
            rafIdRef.current = requestAnimationFrame(draw);
            return;
        }

        const ctx                                    = canvas.getContext("2d");
        const { scale: sc, offsetX: ox, offsetY: oy } = stateRef.current;
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, ox, oy, img.naturalWidth * sc, img.naturalHeight * sc);

        // ── Grid overlay ──────────────────────────────────────────────────────
        const t = (performance.now() / 40) % 16;

        ctx.save();

        // Helper: draw a path twice — dark shadow then bright stroke
        const strokeDouble = (drawPath, shadowWidth, shadowColor, lineWidth, lineColor, dash, dashOffset) => {
            ctx.setLineDash(dash);
            ctx.lineDashOffset = dashOffset;

            // Shadow pass
            ctx.lineWidth   = shadowWidth;
            ctx.strokeStyle = shadowColor;
            drawPath();
            ctx.stroke();

            // Bright pass
            ctx.lineWidth   = lineWidth;
            ctx.strokeStyle = lineColor;
            drawPath();
            ctx.stroke();
        };

        // Outer animated border
        strokeDouble(
            () => ctx.strokeRect(1, 1, W - 2, H - 2),
            4,   "rgba(0,0,0,0.55)",
            2,   "rgba(255,255,255,0.92)",
            [8, 8], -t
        );

        // Inner rule-of-thirds lines
        const thirdsPath = () => {
            ctx.beginPath();
            [W / 3, (W * 2) / 3].forEach(x => { ctx.moveTo(x, 0); ctx.lineTo(x, H); });
            [H / 3, (H * 2) / 3].forEach(y => { ctx.moveTo(0, y); ctx.lineTo(W, y); });
        };
        strokeDouble(
            thirdsPath,
            2.5, "rgba(0,0,0,0.40)",
            1,   "rgba(255,255,255,0.55)",
            [5, 7], t
        );

        // Corner brackets
        ctx.setLineDash([]);
        const L = 20;
        [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].forEach(([x, y, dx, dy]) => {
            const bracket = () => {
                ctx.beginPath();
                ctx.moveTo(x + dx * L, y);
                ctx.lineTo(x, y);
                ctx.lineTo(x, y + dy * L);
            };
            // shadow
            ctx.lineWidth   = 5;
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            bracket(); ctx.stroke();
            // bright
            ctx.lineWidth   = 2.5;
            ctx.strokeStyle = "rgba(255,255,255,0.98)";
            bracket(); ctx.stroke();
        });

        ctx.restore();

        rafIdRef.current = requestAnimationFrame(draw);
    }, []);

    // ── init: load image, size canvas ─────────────────────────────────────────
    useEffect(() => {
        if (!src) return;
        let cancelled = false;

        const img = new Image();
        img.onload = () => {
            if (cancelled) return;
            imgRef.current = img;

            const trySize = () => {
                if (cancelled) return;
                const container = containerRef.current;
                const canvas    = canvasRef.current;
                if (!container || !canvas) { requestAnimationFrame(trySize); return; }

                const cW = Math.round(container.getBoundingClientRect().width) || container.clientWidth;
                if (!cW) { requestAnimationFrame(trySize); return; }

                const cH = Math.round(cW / aspectRatio);
                canvas.width  = cW;
                canvas.height = cH;

                const scaleX       = cW / img.naturalWidth;
                const scaleY       = cH / img.naturalHeight;
                const containScale = Math.min(scaleX, scaleY);   // full image visible

                const s    = stateRef.current;
                s.scale    = containScale;
                s.minScale = containScale;
                // Centre the image inside the canvas
                s.offsetX  = (cW - img.naturalWidth  * containScale) / 2;
                s.offsetY  = (cH - img.naturalHeight * containScale) / 2;

                setReady(true);
            };
            requestAnimationFrame(trySize);
        };
        img.onerror = () => { if (!cancelled) setError("Failed to load image."); };
        img.src = src;

        return () => { cancelled = true; };
    }, [src, aspectRatio]);

    // ── start / stop RAF ──────────────────────────────────────────────────────
    useEffect(() => {
        rafIdRef.current = requestAnimationFrame(draw);
        return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current); };
    }, [draw]);   // run immediately; draw() itself guards on canvas/img readiness

    // ── imperative event listeners (non-passive so preventDefault works) ──────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // ── wheel ──
        const handleWheel = (e) => {
            e.preventDefault();
            const s      = stateRef.current;
            const rect   = canvas.getBoundingClientRect();
            const px     = e.clientX - rect.left;
            const py     = e.clientY - rect.top;
            const factor   = e.deltaY > 0 ? 0.92 : 1.09;
            const newScale = clamp(s.scale * factor, s.minScale, s.minScale * 4);
            const ratio    = newScale / s.scale;
            const rawOX    = px - ratio * (px - s.offsetX);
            const rawOY    = py - ratio * (py - s.offsetY);
            const { x, y } = clampOffset(rawOX, rawOY, newScale);
            s.scale = newScale; s.offsetX = x; s.offsetY = y;
        };

        // ── touch start ──
        const handleTouchStart = (e) => {
            // don't preventDefault on start — lets tap-to-focus work
            const s = stateRef.current;
            if (e.touches.length === 1) {
                s.dragging = true;
                s.lastDist = null;
                s.lastX    = e.touches[0].clientX;
                s.lastY    = e.touches[0].clientY;
            } else if (e.touches.length >= 2) {
                e.preventDefault();
                s.dragging = false;
                const rect = canvas.getBoundingClientRect();
                s.lastDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                s.pivotX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
                s.pivotY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
            }
        };

        // ── touch move ──
        const handleTouchMove = (e) => {
            e.preventDefault();
            const s = stateRef.current;

            if (e.touches.length === 1 && s.dragging) {
                const dx = e.touches[0].clientX - s.lastX;
                const dy = e.touches[0].clientY - s.lastY;
                const { x, y } = clampOffset(s.offsetX + dx, s.offsetY + dy, s.scale);
                s.offsetX = x; s.offsetY = y;
                s.lastX   = e.touches[0].clientX;
                s.lastY   = e.touches[0].clientY;
            } else if (e.touches.length >= 2 && s.lastDist != null) {
                const dist     = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const factor   = dist / s.lastDist;
                const newScale = clamp(s.scale * factor, s.minScale, s.minScale * 4);
                const ratio    = newScale / s.scale;
                const rawOX    = s.pivotX - ratio * (s.pivotX - s.offsetX);
                const rawOY    = s.pivotY - ratio * (s.pivotY - s.offsetY);
                const { x, y } = clampOffset(rawOX, rawOY, newScale);
                s.scale    = newScale;
                s.offsetX  = x; s.offsetY = y;
                s.lastDist = dist;
            }
        };

        // ── touch end ──
        const handleTouchEnd = (e) => {
            if (e.touches.length === 0) {
                stateRef.current.dragging  = false;
                stateRef.current.lastDist  = null;
            } else if (e.touches.length === 1) {
                // Transition from pinch back to single-finger drag
                stateRef.current.dragging = true;
                stateRef.current.lastDist = null;
                stateRef.current.lastX    = e.touches[0].clientX;
                stateRef.current.lastY    = e.touches[0].clientY;
            }
        };

        canvas.addEventListener("wheel",      handleWheel,      { passive: false });
        canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
        canvas.addEventListener("touchmove",  handleTouchMove,  { passive: false });
        canvas.addEventListener("touchend",   handleTouchEnd,   { passive: false });

        return () => {
            canvas.removeEventListener("wheel",      handleWheel);
            canvas.removeEventListener("touchstart", handleTouchStart);
            canvas.removeEventListener("touchmove",  handleTouchMove);
            canvas.removeEventListener("touchend",   handleTouchEnd);
        };
    }, []);   // only once — handlers read live refs, no stale-closure risk

    // ── mouse (fine for desktop) ──────────────────────────────────────────────
    const onMouseDown = (e) => {
        const s = stateRef.current;
        s.dragging = true;
        s.lastX    = e.clientX;
        s.lastY    = e.clientY;
    };
    const onMouseMove = (e) => {
        const s = stateRef.current;
        if (!s.dragging) return;
        const { x, y } = clampOffset(s.offsetX + e.clientX - s.lastX, s.offsetY + e.clientY - s.lastY, s.scale);
        s.offsetX = x; s.offsetY = y;
        s.lastX   = e.clientX;
        s.lastY   = e.clientY;
    };
    const onMouseUp = () => { stateRef.current.dragging = false; };

    // ── confirm ───────────────────────────────────────────────────────────────
    const handleConfirm = () => {
        const canvas = canvasRef.current;
        const img    = imgRef.current;
        if (!canvas || !img) return;
        setConfirming(true);
        const { scale: sc, offsetX: ox, offsetY: oy } = stateRef.current;
        const out = document.createElement("canvas");
        out.width  = canvas.width;
        out.height = canvas.height;
        out.getContext("2d").drawImage(img, ox, oy, img.naturalWidth * sc, img.naturalHeight * sc);
        out.toBlob(blob => { setConfirming(false); onConfirm(blob); }, "image/jpeg", 0.92);
    };

    // ── render ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 py-10 text-sm ${isDark ? "text-red-400" : "text-red-500"}`}>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0">
            {/* Hint bar */}
            <div className={`flex items-center justify-center gap-1.5 py-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <IoExpand size={13} />
                <span className="text-xs font-medium select-none">Drag or pinch to adjust</span>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-2xl"
                style={{ aspectRatio: String(aspectRatio) }}
            >
                {!ready && (
                    <div className={`absolute inset-0 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                )}
                <canvas
                    ref={canvasRef}
                    className="w-full h-full block select-none"
                    style={{ display: ready ? "block" : "none", cursor: "grab", touchAction: "none" }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                />
            </div>

            {/* Continue button — full width, no Retake */}
            <div className="pt-3">
                <button
                    onClick={handleConfirm}
                    disabled={!ready || confirming}
                    className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00B8A9] to-purple-500 text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                >
                    <IoCheckmark size={16} />
                    {confirming ? "Processing…" : "Continue"}
                </button>
            </div>
        </div>
    );
}
