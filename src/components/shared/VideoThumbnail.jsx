import React, { useState, useEffect, useRef } from 'react';

export default function VideoThumbnail({ videoUrl, alt, className = "" }) {
    const [thumbnailStr, setThumbnailStr] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!videoUrl) return;

        const video = videoRef.current;
        if (!video) return;

        const generateThumbnail = () => {
            try {
                const canvas = canvasRef.current;
                if (!canvas) return;

                // Allow a tiny bit of time for the frame to be ready
                setTimeout(() => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg');
                    setThumbnailStr(dataUrl);
                }, 100);
            } catch (err) {
                console.warn("Failed to generate thumbnail for", videoUrl, err);
            }
        };

        // We capture frame at 1s to avoid black frames at 0s
        video.currentTime = 1.0;

        video.addEventListener('seeked', generateThumbnail, { once: true });

        return () => {
            video.removeEventListener('seeked', generateThumbnail);
        };
    }, [videoUrl]);

    if (!videoUrl) {
        return <div className={`bg-gray-800 ${className}`}></div>;
    }

    return (
        <>
            {/* Hidden elements for processing */}
            <video
                ref={videoRef}
                src={videoUrl}
                crossOrigin="anonymous"
                muted
                playsInline
                style={{ display: 'none' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Display */}
            {thumbnailStr ? (
                <img src={thumbnailStr} alt={alt} className={className} />
            ) : (
                <div className={`flex items-center justify-center bg-gray-900 ${className}`}>
                    <div className="w-4 h-4 border-2 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </>
    );
}
