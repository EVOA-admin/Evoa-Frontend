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
 *   onCancel    – fn() — "Retake" pressed
 *   isDark      – bool
 */
export default function ImageCropEditor({
    src,
    aspectRatio = 4 / 3,
    onConfirm,
    onCancel,
    isDark = false,
}) {
    const containerRef = useRef(null);   // div wrapper we measure
    const canvasRef    = useRef(null);
    const imgRef       = useRef(null);
    const stateRef     = useRef({
        scale: 1, minScale: 1,
        offsetX: 0, offsetY: 0,
        dragging: false, lastX: 0, lastY: 0,
        lastDist: null, pivotX: 0, pivotY: 0,
    });
    const rafIdRef     = useRef(null);

    const [ready, setReady]         = useState(false);  // image loaded + canvas sized
    const [confirming, setConfirming] = useState(false);
    const [error, setError]         = useState(null);

    // ── helpers ──────────────────────────────────────────────────────────────
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const clampOffset = useCallback((ox, oy, sc) => {
        const canvas = canvasRef.current;
        const img    = imgRef.current;
        if (!canvas || !img) return { x: ox, y: oy };
        const iW = img.naturalWidth  * sc;
        const iH = img.naturalHeight * sc;
        return {
            x: clamp(ox, canvas.width  - iW, 0),
            y: clamp(oy, canvas.height - iH, 0),
        };
    }, []);

    // ── draw loop (RAF) ───────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        const img    = imgRef.current;
        if (!canvas || !img || canvas.width === 0 || canvas.height === 0) return;

        const ctx = canvas.getContext("2d");
        const { scale: sc, offsetX: ox, offsetY: oy } = stateRef.current;
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, ox, oy, img.naturalWidth * sc, img.naturalHeight * sc);

        // Animated marching-ants overlay
        const t = (performance.now() / 40) % 16;

        ctx.save();
        // outer border
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -t;
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, W - 2, H - 2);

        // thirds lines
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = t;
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        [W / 3, (W * 2) / 3].forEach(x => { ctx.moveTo(x, 0); ctx.lineTo(x, H); });
        [H / 3, (H * 2) / 3].forEach(y => { ctx.moveTo(0, y); ctx.lineTo(W, y); });
        ctx.stroke();

        // corner brackets
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 2.5;
        const L = 20;
        [[0,0,1,1],[W,0,-1,1],[0,H,1,-1],[W,H,-1,-1]].forEach(([x,y,dx,dy]) => {
            ctx.beginPath();
            ctx.moveTo(x + dx * L, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * L);
            ctx.stroke();
        });
        ctx.restore();

        rafIdRef.current = requestAnimationFrame(draw);
    }, []);

    // ── initialise: load image then size canvas ───────────────────────────────
    useEffect(() => {
        if (!src) return;
        let cancelled = false;

        const img = new Image();
        img.onload = () => {
            if (cancelled) return;
            imgRef.current = img;

            // Measure the container — retry via rAF until it has a real width
            const trySize = () => {
                if (cancelled) return;
                const container = containerRef.current;
                const canvas    = canvasRef.current;
                if (!container || !canvas) { requestAnimationFrame(trySize); return; }

                const cW = container.getBoundingClientRect().width || container.clientWidth;
                if (!cW) { requestAnimationFrame(trySize); return; }   // not laid out yet

                const cH = Math.round(cW / aspectRatio);
                canvas.width  = cW;
                canvas.height = cH;

                const scaleX = cW / img.naturalWidth;
                const scaleY = cH / img.naturalHeight;
                // "contain" — full image visible by default, user can pinch/zoom in
                const containScale = Math.min(scaleX, scaleY);
                // "cover"  — used as the maximum snap-back limit when zooming out
                const coverScale   = Math.max(scaleX, scaleY);

                const s = stateRef.current;
                s.scale    = containScale;
                s.minScale = containScale;           // can zoom OUT to full-image-visible
                s.maxScale = coverScale * 4;         // store for reference (not enforced here)
                s.offsetX  = (cW - img.naturalWidth  * containScale) / 2;
                s.offsetY  = (cH - img.naturalHeight * containScale) / 2;

                setReady(true);
            };
            requestAnimationFrame(trySize);
        };
        img.onerror = () => {
            if (!cancelled) setError("Failed to load image.");
        };
        img.src = src;

        return () => { cancelled = true; };
    }, [src, aspectRatio]);

    // ── start / stop RAF ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!ready) return;
        rafIdRef.current = requestAnimationFrame(draw);
        return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current); };
    }, [ready, draw]);

    // ── wheel (non-passive) ───────────────────────────────────────────────────
    const onWheel = useCallback((e) => {
        e.preventDefault();
        const s      = stateRef.current;
        const canvas = canvasRef.current;
        const rect   = canvas.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const factor   = e.deltaY > 0 ? 0.92 : 1.09;
        const newScale = clamp(s.scale * factor, s.minScale, s.minScale * 4);
        const ratio    = newScale / s.scale;
        const { x, y } = (() => {
            const img = imgRef.current;
            if (!img) return { x: s.offsetX, y: s.offsetY };
            const iW = img.naturalWidth  * newScale;
            const iH = img.naturalHeight * newScale;
            return {
                x: clamp(px - ratio * (px - s.offsetX), canvas.width  - iW, 0),
                y: clamp(py - ratio * (py - s.offsetY), canvas.height - iH, 0),
            };
        })();
        s.scale = newScale; s.offsetX = x; s.offsetY = y;
    }, [clamp]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !ready) return;
        canvas.addEventListener("wheel", onWheel, { passive: false });
        return () => canvas.removeEventListener("wheel", onWheel);
    }, [ready, onWheel]);

    // ── mouse ─────────────────────────────────────────────────────────────────
    const onMouseDown = useCallback((e) => {
        const s = stateRef.current;
        s.dragging = true;
        const r = canvasRef.current.getBoundingClientRect();
        s.lastX = e.clientX - r.left;
        s.lastY = e.clientY - r.top;
    }, []);

    const onMouseMove = useCallback((e) => {
        const s = stateRef.current;
        if (!s.dragging) return;
        const r  = canvasRef.current.getBoundingClientRect();
        const cx = e.clientX - r.left, cy = e.clientY - r.top;
        const { x, y } = clampOffset(s.offsetX + cx - s.lastX, s.offsetY + cy - s.lastY, s.scale);
        s.offsetX = x; s.offsetY = y; s.lastX = cx; s.lastY = cy;
    }, [clampOffset]);

    const onMouseUp = useCallback(() => { stateRef.current.dragging = false; }, []);

    // ── touch ─────────────────────────────────────────────────────────────────
    const onTouchStart = useCallback((e) => {
        const s = stateRef.current;
        if (e.touches.length === 1) {
            s.dragging = true; s.lastDist = null;
            s.lastX = e.touches[0].clientX; s.lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            s.dragging = false;
            const r = canvasRef.current.getBoundingClientRect();
            s.lastDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            s.pivotX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
            s.pivotY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
        }
    }, []);

    const onTouchMove = useCallback((e) => {
        e.preventDefault();
        const s = stateRef.current;
        if (e.touches.length === 1 && s.dragging) {
            const dx = e.touches[0].clientX - s.lastX;
            const dy = e.touches[0].clientY - s.lastY;
            const { x, y } = clampOffset(s.offsetX + dx, s.offsetY + dy, s.scale);
            s.offsetX = x; s.offsetY = y;
            s.lastX = e.touches[0].clientX; s.lastY = e.touches[0].clientY;
        } else if (e.touches.length === 2 && s.lastDist) {
            const dist  = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const factor   = dist / s.lastDist;
            const newScale = clamp(s.scale * factor, s.minScale, s.minScale * 4);
            const ratio    = newScale / s.scale;
            const canvas   = canvasRef.current;
            const img      = imgRef.current;
            if (canvas && img) {
                const iW = img.naturalWidth  * newScale;
                const iH = img.naturalHeight * newScale;
                s.offsetX = clamp(s.pivotX - ratio * (s.pivotX - s.offsetX), canvas.width  - iW, 0);
                s.offsetY = clamp(s.pivotY - ratio * (s.pivotY - s.offsetY), canvas.height - iH, 0);
            }
            s.scale = newScale; s.lastDist = dist;
        }
    }, [clamp, clampOffset]);

    const onTouchEnd = useCallback((e) => {
        if (e.touches.length === 0) {
            stateRef.current.dragging = false;
            stateRef.current.lastDist = null;
        }
    }, []);

    // ── confirm ───────────────────────────────────────────────────────────────
    const handleConfirm = useCallback(() => {
        const canvas = canvasRef.current;
        const img    = imgRef.current;
        if (!canvas || !img) return;
        setConfirming(true);
        const { scale: sc, offsetX: ox, offsetY: oy } = stateRef.current;
        const out = document.createElement("canvas");
        out.width = canvas.width; out.height = canvas.height;
        out.getContext("2d").drawImage(img, ox, oy, img.naturalWidth * sc, img.naturalHeight * sc);
        out.toBlob(blob => { setConfirming(false); onConfirm(blob); }, "image/jpeg", 0.92);
    }, [onConfirm]);

    // ── render ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className={`flex flex-col items-center justify-center gap-3 py-10 ${isDark ? "text-red-400" : "text-red-500"}`}>
                <p className="text-sm font-medium">{error}</p>
                <button onClick={onCancel} className="text-xs underline opacity-70">Go back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-0">
            {/* Hint */}
            <div className={`flex items-center justify-center gap-1.5 py-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <IoExpand size={13} />
                <span className="text-xs font-medium select-none">Drag or pinch to adjust</span>
            </div>

            {/* Canvas container (measured by containerRef) */}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden rounded-2xl"
                style={{ aspectRatio: String(aspectRatio) }}
            >
                {/* Pulse skeleton while loading */}
                {!ready && (
                    <div className={`absolute inset-0 rounded-2xl animate-pulse ${isDark ? "bg-gray-800" : "bg-gray-200"}`} />
                )}

                <canvas
                    ref={canvasRef}
                    className="w-full h-full block select-none touch-none"
                    style={{
                        display: ready ? "block" : "none",
                        cursor: "grab",
                    }}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-3">
                <button
                    onClick={onCancel}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all active:scale-95 ${
                        isDark
                            ? "border-white/15 text-white/70 hover:bg-white/10"
                            : "border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                    Retake
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={!ready || confirming}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#00B8A9] to-purple-500 text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-60"
                >
                    <IoCheckmark size={16} />
                    {confirming ? "Processing…" : "Continue"}
                </button>
            </div>
        </div>
    );
}
