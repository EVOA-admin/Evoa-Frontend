/**
 * compressVideo.js
 *
 * Client-side video compression using HTMLVideoElement + canvas + MediaRecorder.
 * No external libraries needed — runs entirely in the browser.
 *
 * Strategy:
 *  1. If the file is already ≤ TARGET_MB, return it unchanged.
 *  2. Otherwise read its duration, calculate a bitrate that fits in TARGET_MB,
 *     draw each frame of the video onto a (possibly downscaled) canvas and
 *     record via MediaRecorder at that bitrate.
 *  3. Returns a new File in video/webm format.
 *
 * @param {File}     file           — original video File object
 * @param {number}   [targetMB=10]  — desired maximum output size in MB
 * @param {Function} [onProgress]   — optional callback(pct: 0–100)
 * @returns {Promise<File>}         — compressed (or original) File
 */

const TARGET_MB = 10;
const MAX_WIDTH = 720;   // downscale wide videos to 720p
const MAX_HEIGHT = 1280; // keep portrait 1080p → 720p
const FPS = 30;

export async function compressVideo(file, targetMB = TARGET_MB, onProgress) {
    const limitBytes = targetMB * 1024 * 1024;

    // Already small enough → return as-is
    if (file.size <= limitBytes) return file;

    // Get video duration via a temporary object URL
    const duration = await getVideoDuration(file);
    if (!duration || duration <= 0) return file; // can't compress safely

    // Target bitrate (bits/s). Reserve 10% headroom + 96 kbps for audio.
    const audioBps = 96_000;
    const totalBits = targetMB * 8 * 1024 * 1024 * 0.88; // 88% headroom
    const videoBps = Math.max(Math.floor((totalBits / duration) - audioBps), 200_000);

    // Prefer VP9 with Opus audio, fall back to vp8 / h264
    const mimeType = getSupportedMime();
    if (!mimeType) {
        console.warn('[compressVideo] MediaRecorder not supported in this browser — uploading original');
        return file;
    }

    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.src = objectUrl;
        video.muted = false;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';

        video.addEventListener('error', () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file); // fallback: return original
        });

        video.addEventListener('loadedmetadata', () => {
            // Compute canvas dimensions (scale down if needed)
            let w = video.videoWidth;
            let h = video.videoHeight;
            if (w > MAX_WIDTH || h > MAX_HEIGHT) {
                const scale = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h);
                w = Math.floor(w * scale / 2) * 2; // even numbers required
                h = Math.floor(h * scale / 2) * 2;
            }

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');

            // Capture canvas stream (video frames) + audio from the video element
            const canvasStream = canvas.captureStream(FPS);

            // Try to add audio tracks from the video element's stream
            let combinedStream = canvasStream;
            try {
                if (video.captureStream) {
                    const videoStream = video.captureStream();
                    const audioTracks = videoStream.getAudioTracks();
                    audioTracks.forEach(t => combinedStream.addTrack(t));
                } else if (video.mozCaptureStream) {
                    const videoStream = video.mozCaptureStream();
                    const audioTracks = videoStream.getAudioTracks();
                    audioTracks.forEach(t => combinedStream.addTrack(t));
                }
            } catch (_) { /* audio capture unsupported — video only */ }

            const recorder = new MediaRecorder(combinedStream, {
                mimeType,
                videoBitsPerSecond: videoBps,
                audioBitsPerSecond: audioBps,
            });

            const chunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

            recorder.onstop = () => {
                URL.revokeObjectURL(objectUrl);
                const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                const blob = new Blob(chunks, { type: mimeType });
                const outName = file.name.replace(/\.[^.]+$/, `.${ext}`);
                resolve(new File([blob], outName, { type: mimeType }));
            };

            recorder.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(file); // fallback
            };

            // Draw frames to canvas while video plays
            let animFrame;
            const drawFrame = () => {
                if (video.paused || video.ended) return;
                ctx.drawImage(video, 0, 0, w, h);
                const pct = duration > 0 ? Math.min((video.currentTime / duration) * 100, 99) : 0;
                onProgress?.(Math.round(pct));
                animFrame = requestAnimationFrame(drawFrame);
            };

            video.addEventListener('play', () => {
                recorder.start(100); // collect data in 100ms chunks
                drawFrame();
            });

            video.addEventListener('ended', () => {
                cancelAnimationFrame(animFrame);
                recorder.stop();
                onProgress?.(100);
            });

            video.addEventListener('pause', () => {
                // If paused mid-way (e.g. browser limit), resume
                if (!video.ended) video.play().catch(() => { });
            });

            video.play().catch(() => {
                URL.revokeObjectURL(objectUrl);
                resolve(file);
            });
        });
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getVideoDuration(file) {
    return new Promise(resolve => {
        const url = URL.createObjectURL(file);
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.src = url;
        v.onloadedmetadata = () => {
            URL.revokeObjectURL(url);
            resolve(v.duration);
        };
        v.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    });
}

const MIME_CANDIDATES = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
];

function getSupportedMime() {
    if (!window.MediaRecorder) return null;
    return MIME_CANDIDATES.find(m => MediaRecorder.isTypeSupported(m)) || null;
}
