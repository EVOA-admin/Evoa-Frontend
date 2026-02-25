import React, { useRef, useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { FaTimes, FaImage, FaVideo } from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import storiesService from "../../services/storiesService";

export default function StoryUploadModal({ isOpen, onClose, onUploaded }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const fileInputRef = useRef(null);

    const [preview, setPreview] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleFile = (f) => {
        if (!f) return;
        if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
            setError("Please select an image or video.");
            return;
        }
        setError("");
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            await storiesService.createStory(file);
            onUploaded?.();
            handleClose();
        } catch (err) {
            setError(err?.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setPreview(null);
        setFile(null);
        setError("");
        setUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Sheet */}
            <div
                className={`relative z-10 w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl transition-all ${isDark ? "bg-[#111]" : "bg-white"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2
                        className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"
                            }`}
                    >
                        Add Your Story
                    </h2>
                    <button
                        onClick={handleClose}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isDark
                                ? "bg-white/10 text-white/70 hover:bg-white/20"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                    >
                        <FaTimes size={13} />
                    </button>
                </div>

                {/* Drop zone / preview */}
                {preview ? (
                    <div className="relative w-full aspect-[9/16] max-h-64 rounded-2xl overflow-hidden mb-4">
                        {file?.type.startsWith("video/") ? (
                            <video
                                src={preview}
                                className="w-full h-full object-cover"
                                controls
                            />
                        ) : (
                            <img
                                src={preview}
                                alt="Story preview"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <button
                            onClick={() => { setPreview(null); setFile(null); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                        >
                            <FaTimes size={10} />
                        </button>
                    </div>
                ) : (
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full aspect-[9/16] max-h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all mb-4 ${isDark
                                ? "border-white/20 hover:border-[#00B8A9]/60 bg-white/5"
                                : "border-gray-200 hover:border-[#00B8A9]/60 bg-gray-50"
                            }`}
                    >
                        <FiUploadCloud
                            size={32}
                            className={isDark ? "text-white/40" : "text-gray-400"}
                        />
                        <p
                            className={`text-sm mt-2 ${isDark ? "text-white/50" : "text-gray-500"
                                }`}
                        >
                            Tap to choose a photo or video
                        </p>
                        <div className="flex gap-2 mt-3">
                            <FaImage className="text-purple-400" size={14} />
                            <FaVideo className="text-pink-400" size={14} />
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                {error && (
                    <p className="text-red-500 text-xs text-center mb-3">{error}</p>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${file && !uploading
                            ? "bg-gradient-to-r from-[#00B8A9] to-[#007a73] text-white active:scale-95"
                            : isDark
                                ? "bg-white/10 text-white/30 cursor-not-allowed"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    {uploading ? "Uploading…" : "Share Story"}
                </button>
            </div>
        </div>
    );
}
