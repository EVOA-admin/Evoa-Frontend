import React, { useState, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
    IoClose, IoImage, IoVideocam, IoCloudUpload,
    IoCheckmarkCircle, IoAlertCircle, IoArrowBack,
} from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
import storageService from "../../services/storageService";
import postsService from "../../services/postsService";
import reelsService from "../../services/reelsService";
import ImageCropEditor from "./ImageCropEditor";

/**
 * CreateContentModal
 * Props:
 *  - isOpen: bool
 *  - onClose: fn
 *  - canUploadReel: bool (true for startup users only)
 *  - onCreated: fn(type) — called after successful creation
 */
export default function CreateContentModal({ isOpen, onClose, canUploadReel = false, onCreated }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { user } = useAuth();

    // Step: 'choose' | 'crop' | 'post' | 'reel'
    const [step, setStep] = useState(canUploadReel ? "choose" : "post");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [croppedBlob, setCroppedBlob] = useState(null);   // result from ImageCropEditor
    const [croppedPreview, setCroppedPreview] = useState(null); // URL for cropped blob
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [uploadState, setUploadState] = useState("idle"); // idle | uploading | success | error
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const reset = () => {
        setStep(canUploadReel ? "choose" : "post");
        setFile(null);
        setPreview(null);
        setCroppedBlob(null);
        setCroppedPreview(null);
        setCaption("");
        setHashtags("");
        setUploadState("idle");
        setUploadProgress(0);
        setErrorMsg("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const MAX_FILE_MB = 50;
    const handleFileChange = (e, type) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (type === "video" && f.size > MAX_FILE_MB * 1024 * 1024) {
            setErrorMsg(`Video size must be under ${MAX_FILE_MB} MB.`);
            e.target.value = "";
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        // Images go through the crop step first; videos skip straight to reel
        setStep(type === "video" ? "reel" : "crop");
    };

    // Called when the user accepts the crop
    const handleCropConfirm = (blob) => {
        setCroppedBlob(blob);
        const url = URL.createObjectURL(blob);
        setCroppedPreview(url);
        setStep("post");
    };

    // Called when the user taps "Retake" inside the crop editor
    const handleCropCancel = () => {
        setFile(null);
        setPreview(null);
        setCroppedBlob(null);
        setCroppedPreview(null);
        setStep(canUploadReel ? "choose" : "post");
    };

    const handleSubmitPost = async () => {
        if (!croppedBlob && !file && !caption.trim()) {
            setErrorMsg("Add an image or caption to post.");
            return;
        }
        setUploadState("uploading");
        setErrorMsg("");
        try {
            let imageUrl = null;
            // Upload the cropped blob if available, otherwise fall back to raw file
            const uploadSource = croppedBlob || file;
            if (uploadSource) {
                const ext = croppedBlob ? "jpg" : file.name.split(".").pop();
                const path = `posts/${user?.id}/${Date.now()}.${ext}`;
                // storageService.uploadFile accepts File or Blob
                imageUrl = await storageService.uploadFile(uploadSource, "evoa-media", path);
            }
            const tagArr = hashtags.split(/[\s,#]+/).filter(Boolean).map(t => t.replace(/^#/, ""));
            await postsService.createPost({ imageUrl, caption, hashtags: tagArr });
            setUploadState("success");
            setTimeout(() => { handleClose(); onCreated?.("post"); }, 1200);
        } catch (err) {
            console.error(err);
            setErrorMsg(err?.message || "Upload failed. Try again.");
            setUploadState("error");
        }
    };

    const handleSubmitReel = async () => {
        if (!file) { setErrorMsg("Select a video first."); return; }
        if (uploadState === "uploading") return;
        setErrorMsg("");
        try {
            setUploadState("uploading");
            const ext = file.name.split(".").pop();
            const path = `reels/${user?.id}/${Date.now()}.${ext}`;
            const videoUrl = await storageService.uploadFile(file, "evoa-media", path);
            const tagArr = hashtags.split(/[\s,#]+/).filter(Boolean).map(t => t.replace(/^#/, ""));
            await reelsService.createReel({ videoUrl, title: caption, description: caption, hashtags: tagArr });
            setUploadState("success");
            setTimeout(() => { handleClose(); onCreated?.("reel"); }, 1200);
        } catch (err) {
            console.error(err);
            setErrorMsg(err?.message || "Upload failed. Try again.");
            setUploadState("error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            {/* Sheet */}
            <div className={`relative w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl overflow-hidden ${isDark ? "bg-gray-950" : "bg-white"} shadow-2xl`} style={{ maxHeight: "92vh", overflowY: "auto" }}>

                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-200"}`} />
                </div>

                {/* Header */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    {step !== "choose" && step !== "crop" && (
                        <button
                            onClick={() => {
                                if (step === "post") {
                                    // Go back to crop if we have an original image, else choose/post
                                    if (preview) { setStep("crop"); setCroppedBlob(null); setCroppedPreview(null); }
                                    else { setStep(canUploadReel ? "choose" : "post"); setFile(null); }
                                } else {
                                    setStep(canUploadReel ? "choose" : "post"); setFile(null); setPreview(null);
                                }
                            }}
                            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                        >
                            <IoArrowBack size={18} className={isDark ? "text-white" : "text-gray-800"} />
                        </button>
                    )}
                    <h2 className={`text-base font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {step === "choose" ? "Create" : step === "crop" ? "Adjust Photo" : step === "reel" ? "New Pitch Reel" : "New Post"}
                    </h2>
                    <button onClick={handleClose} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                        <IoClose size={18} className={isDark ? "text-white/70" : "text-gray-500"} />
                    </button>
                </div>

                {/* ── CHOOSE step ── */}
                {step === "choose" && (
                    <div className="p-5 grid grid-cols-2 gap-3">
                        {/* Reel tile */}
                        <button
                            onClick={() => videoInputRef.current?.click()}
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all active:scale-95 ${isDark ? "border-white/15 hover:border-[#00B8A9]/60 hover:bg-[#00B8A9]/10" : "border-gray-200 hover:border-[#00B8A9]/60 hover:bg-[#00B8A9]/5"}`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00B8A9] to-[#007a73] flex items-center justify-center shadow-lg shadow-[#00B8A9]/30">
                                <IoVideocam size={26} className="text-white" />
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Pitch Reel</p>
                                <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Upload a video</p>
                            </div>
                        </button>

                        {/* Post tile */}
                        <button
                            onClick={() => imageInputRef.current?.click()}
                            className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all active:scale-95 ${isDark ? "border-white/15 hover:border-purple-500/60 hover:bg-purple-500/10" : "border-gray-200 hover:border-purple-500/60 hover:bg-purple-50"}`}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <IoImage size={26} className="text-white" />
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Post</p>
                                <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Share an image</p>
                            </div>
                        </button>
                    </div>
                )}

                {/* ── CROP step ── */}
                {step === "crop" && preview && (
                    <div className="px-4 pb-2">
                        <ImageCropEditor
                            src={preview}
                            aspectRatio={4 / 3}
                            onConfirm={handleCropConfirm}
                            onCancel={handleCropCancel}
                            isDark={isDark}
                        />
                    </div>
                )}

                {/* ── POST step ── */}
                {(step === "post") && (
                    <div className="p-4 space-y-4">
                        {/* Image picker — shown only when no image selected */}
                        {!croppedPreview && !preview ? (
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${isDark ? "border-white/15 hover:border-[#00B8A9]/40 bg-white/5" : "border-gray-200 hover:border-[#00B8A9]/40 bg-gray-50"}`}
                            >
                                <IoImage size={32} className={isDark ? "text-gray-500" : "text-gray-300"} />
                                <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tap to add photo</span>
                            </button>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                                <img src={croppedPreview || preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => { setFile(null); setPreview(null); setCroppedBlob(null); setCroppedPreview(null); }}
                                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full"
                                >
                                    <IoClose size={14} className="text-white" />
                                </button>
                            </div>
                        )}

                        {/* Caption */}
                        <textarea
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Write a caption…"
                            rows={3}
                            className={`w-full rounded-xl p-3 text-sm resize-none outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                        />

                        {/* Hashtags */}
                        <input
                            value={hashtags}
                            onChange={e => setHashtags(e.target.value)}
                            placeholder="#hashtag1  #hashtag2"
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                        />

                        {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                        <UploadButton state={uploadState} progress={uploadProgress} onPress={handleSubmitPost} label="Share Post" />
                    </div>
                )}

                {/* ── REEL step ── */}
                {step === "reel" && (
                    <div className="p-4 space-y-4">
                        {/* Video preview */}
                        {!preview ? (
                            <button
                                onClick={() => videoInputRef.current?.click()}
                                className={`w-full aspect-[9/16] max-h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${isDark ? "border-white/15 hover:border-[#00B8A9]/40 bg-white/5" : "border-gray-200 hover:border-[#00B8A9]/40 bg-gray-50"}`}
                            >
                                <IoVideocam size={32} className={isDark ? "text-gray-500" : "text-gray-300"} />
                                <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tap to add video</span>
                            </button>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden">
                                <video src={preview} className="w-full rounded-2xl max-h-64 object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FaPlay size={28} className="text-white opacity-80" />
                                </div>
                                <button
                                    onClick={() => { setFile(null); setPreview(null); }}
                                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full"
                                >
                                    <IoClose size={14} className="text-white" />
                                </button>
                            </div>
                        )}

                        {/* Caption / title */}
                        <textarea
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            placeholder="Pitch title or description…"
                            rows={3}
                            className={`w-full rounded-xl p-3 text-sm resize-none outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                        />

                        {/* Hashtags */}
                        <input
                            value={hashtags}
                            onChange={e => setHashtags(e.target.value)}
                            placeholder="#saas  #fintech"
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                        />

                        {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                        <UploadButton state={uploadState} progress={uploadProgress} onPress={handleSubmitReel} label="Publish Reel" />
                    </div>
                )}

                {/* Hidden inputs */}
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange(e, "image")} />
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden"
                    onChange={e => handleFileChange(e, "video")} />

                <div className="h-6" />
            </div>
        </div>
    );
}

function UploadButton({ state, progress, onPress, label }) {
    const isLoading = state === "uploading";
    const isSuccess = state === "success";
    return (
        <button
            onClick={onPress}
            disabled={isLoading || isSuccess}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${isSuccess
                ? "bg-green-500 text-white"
                : "bg-[#00B8A9] text-white hover:bg-[#00A89A] active:scale-95 disabled:opacity-80"
                }`}
        >
            {isSuccess ? (
                <><IoCheckmarkCircle size={18} />Done!</>
            ) : isLoading ? (
                <><IoCloudUpload size={18} className="animate-bounce" />Uploading post…</>
            ) : (
                label
            )}
        </button>
    );
}
