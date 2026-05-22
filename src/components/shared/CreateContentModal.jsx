import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
    IoClose, IoImage, IoVideocam, IoCloudUpload,
    IoCheckmarkCircle, IoAlertCircle, IoArrowBack, IoAdd,
} from "react-icons/io5";
import { FaPlay } from "react-icons/fa";
import { MdOutlineSwapHoriz } from "react-icons/md";
import storageService from "../../services/storageService";
import postsService from "../../services/postsService";
import reelsService from "../../services/reelsService";
import { openRazorpayCheckout } from "../../utils/razorpay";
import ImageCropEditor from "./ImageCropEditor";
import PostCarousel from "./PostCarousel";

const MAX_IMAGES = 10;
const MAX_FILE_MB = 50;

/**
 * CreateContentModal
 * Props:
 *  - isOpen: bool
 *  - onClose: fn
 *  - canUploadReel: bool (true for startup users only)
 *  - onCreated: fn(type) — called after successful creation
 */
export default function CreateContentModal({ isOpen, onClose, canUploadReel = false, onCreated }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { user, userRole, refreshUserProfile } = useAuth();

    /**
     * Step flow:
     *   'choose'  — pick type (post vs reel) — only shown if canUploadReel
     *   'gallery' — multi-image thumbnail strip; tap to crop
     *   'crop'    — ImageCropEditor for one selected image
     *   'post'    — caption / hashtags / preview / share
     *   'reel'    — reel upload step
     */
    const [step, setStep] = useState(canUploadReel ? "choose" : "gallery");

    // ── Multi-image state ────────────────────────────────────────────────────
    // Each item: { file, preview (objectURL), croppedBlob, croppedPreview }
    const [mediaItems, setMediaItems] = useState([]);
    const [cropIndex, setCropIndex] = useState(null); // which item is being cropped

    // ── Reel state ────────────────────────────────────────────────────────────
    const [reelFile, setReelFile] = useState(null);
    const [reelPreview, setReelPreview] = useState(null);

    // ── Shared form state ─────────────────────────────────────────────────────
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [uploadState, setUploadState] = useState("idle"); // idle|uploading|success|error
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [upgradeLoading, setUpgradeLoading] = useState(false);

    const imageInputRef = useRef(null);
    const addMoreInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // ── Reset ─────────────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        setStep(canUploadReel ? "choose" : "gallery");
        setMediaItems([]);
        setCropIndex(null);
        setReelFile(null);
        setReelPreview(null);
        setCaption("");
        setHashtags("");
        setUploadState("idle");
        setUploadProgress(0);
        setErrorMsg("");
        setShowUpgradePrompt(false);
        setUpgradeLoading(false);
    }, [canUploadReel]);

    const handleClose = () => { reset(); onClose(); };

    // ── Pick images ───────────────────────────────────────────────────────────
    const handleImageFiles = (files) => {
        if (!files?.length) return;
        const arr = Array.from(files).slice(0, MAX_IMAGES - mediaItems.length);
        const newItems = arr.map(f => ({
            file: f,
            preview: URL.createObjectURL(f),
            croppedBlob: null,
            croppedPreview: null,
        }));
        setMediaItems(prev => {
            const combined = [...prev, ...newItems];
            return combined.slice(0, MAX_IMAGES);
        });
        setStep("gallery");
    };

    const handleImageInputChange = (e) => handleImageFiles(e.target.files);
    const handleAddMoreChange = (e) => { handleImageFiles(e.target.files); e.target.value = ""; };

    // ── Remove an image from gallery ──────────────────────────────────────────
    const handleRemoveItem = (idx) => {
        setMediaItems(prev => {
            const next = prev.filter((_, i) => i !== idx);
            if (next.length === 0) {
                // Back to empty gallery / choose
                setStep(canUploadReel ? "choose" : "gallery");
            }
            return next;
        });
    };

    // ── Reorder by drag — simple swap via long-press buttons ─────────────────
    const handleMoveLeft = (idx) => {
        if (idx === 0) return;
        setMediaItems(prev => {
            const next = [...prev];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next;
        });
    };

    // ── Open crop for a specific image ────────────────────────────────────────
    const handleOpenCrop = (idx) => {
        setCropIndex(idx);
        setStep("crop");
    };

    const handleCropConfirm = (blob) => {
        const url = URL.createObjectURL(blob);
        setMediaItems(prev => prev.map((item, i) =>
            i === cropIndex
                ? { ...item, croppedBlob: blob, croppedPreview: url }
                : item
        ));
        setCropIndex(null);
        setStep("gallery");
    };

    const handleCropCancel = () => {
        setCropIndex(null);
        setStep("gallery");
    };

    // ── Advance from gallery → post ───────────────────────────────────────────
    const handleGalleryNext = () => {
        if (mediaItems.length === 0 && !caption.trim()) {
            setErrorMsg("Add at least one image or write a caption.");
            return;
        }
        setErrorMsg("");
        setStep("post");
    };

    // ── Reel selection ────────────────────────────────────────────────────────
    const handleReelSelect = async () => {
        setErrorMsg("");
        try {
            const response = await reelsService.getPitchCount();
            const data = response?.data?.data || response?.data || {};
            if ((data?.pitchCount || 0) >= 1 && !data?.isPremium) {
                setShowUpgradePrompt(true);
                return;
            }
            videoInputRef.current?.click();
        } catch (err) {
            setErrorMsg(err?.message || "Unable to check your pitch access right now.");
        }
    };

    const handleVideoFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > MAX_FILE_MB * 1024 * 1024) {
            setErrorMsg(`Video size must be under ${MAX_FILE_MB} MB.`);
            e.target.value = "";
            return;
        }
        setReelFile(f);
        setReelPreview(URL.createObjectURL(f));
        setStep("reel");
    };

    const handleUpgradeCheckout = async () => {
        if (!user) { handleClose(); navigate("/login"); return; }
        const planType = userRole === "startup" ? "startup_pro"
            : userRole === "investor" ? "investor_premium" : null;
        if (!planType) { setErrorMsg("Premium upgrade is only available for startup and investor accounts."); return; }
        try {
            setUpgradeLoading(true);
            setErrorMsg("");
            await openRazorpayCheckout({
                planType, user,
                onSuccess: async () => {
                    await refreshUserProfile();
                    handleClose();
                    navigate(planType === "startup_pro" ? "/startup" : "/investor", { replace: true });
                },
            });
        } catch (err) {
            setErrorMsg(err?.message || "Unable to start the payment process right now.");
        } finally {
            setUpgradeLoading(false);
        }
    };

    // ── Submit post ───────────────────────────────────────────────────────────
    const handleSubmitPost = async () => {
        if (mediaItems.length === 0 && !caption.trim()) {
            setErrorMsg("Add an image or caption to post.");
            return;
        }
        setUploadState("uploading");
        setErrorMsg("");
        try {
            // Upload all images in parallel
            const imageUrls = await Promise.all(
                mediaItems.map(async (item) => {
                    const source = item.croppedBlob || item.file;
                    if (!source) return null;
                    const ext = item.croppedBlob ? "jpg" : item.file.name.split(".").pop();
                    const path = `posts/${user?.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                    return storageService.uploadFile(source, "evoa-media", path);
                })
            );
            const validUrls = imageUrls.filter(Boolean);
            const tagArr = hashtags.split(/[\s,#]+/).filter(Boolean).map(t => t.replace(/^#/, ""));
            await postsService.createPost({
                imageUrl: validUrls[0] || null,
                imageUrls: validUrls,
                caption,
                hashtags: tagArr,
            });
            setUploadState("success");
            setTimeout(() => { handleClose(); onCreated?.("post"); }, 1200);
        } catch (err) {
            console.error(err);
            setErrorMsg(err?.message || "Upload failed. Try again.");
            setUploadState("error");
        }
    };

    const handleSubmitReel = async () => {
        if (!reelFile) { setErrorMsg("Select a video first."); return; }
        if (uploadState === "uploading") return;
        setErrorMsg("");
        try {
            setUploadState("uploading");
            const ext = reelFile.name.split(".").pop();
            const path = `reels/${user?.id}/${Date.now()}.${ext}`;
            const videoUrl = await storageService.uploadFile(reelFile, "evoa-media", path);
            const tagArr = hashtags.split(/[\s,#]+/).filter(Boolean).map(t => t.replace(/^#/, ""));
            await reelsService.createReel({ videoUrl, title: caption, description: caption, hashtags: tagArr });
            setUploadState("success");
            setTimeout(() => { handleClose(); onCreated?.("reel"); }, 1200);
        } catch (err) {
            console.error(err);
            if ((err?.message || "").toLowerCase().includes("upgrade required")) {
                setShowUpgradePrompt(true);
                setStep("choose");
                setErrorMsg("You've reached your free pitch limit. Upgrade to continue pitching.");
            } else {
                setErrorMsg(err?.message || "Upload failed. Try again.");
            }
            setUploadState("error");
        }
    };

    if (!isOpen) return null;

    // ── Derived: preview images for post step ─────────────────────────────────
    const previewImages = mediaItems.map(item => item.croppedPreview || item.preview).filter(Boolean);
    const allCropped = mediaItems.length > 0 && mediaItems.every(item => !!item.croppedBlob);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            {/* Sheet */}
            <div
                className={`relative w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl overflow-hidden ${isDark ? "bg-gray-950" : "bg-white"} shadow-2xl`}
                style={{ maxHeight: "92vh", overflowY: "auto" }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-200"}`} />
                </div>

                {/* Header */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    {(step === "crop" || step === "post" || step === "reel") && (
                        <button
                            onClick={() => {
                                if (step === "crop") { handleCropCancel(); }
                                else if (step === "post") { setStep("gallery"); }
                                else { setStep(canUploadReel ? "choose" : "gallery"); setReelFile(null); setReelPreview(null); }
                            }}
                            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                        >
                            <IoArrowBack size={18} className={isDark ? "text-white" : "text-gray-800"} />
                        </button>
                    )}
                    <h2 className={`text-base font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {step === "choose" ? "Create"
                            : step === "gallery" ? `Gallery${mediaItems.length > 0 ? ` (${mediaItems.length}/${MAX_IMAGES})` : ""}`
                            : step === "crop" ? "Adjust Photo"
                            : step === "reel" ? "New Pitch Reel"
                            : "New Post"}
                    </h2>
                    <button onClick={handleClose} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                        <IoClose size={18} className={isDark ? "text-white/70" : "text-gray-500"} />
                    </button>
                </div>

                {/* ── CHOOSE step ── */}
                {step === "choose" && (
                    <div className="p-5">
                        {showUpgradePrompt ? (
                            <div className={`rounded-2xl border p-5 ${isDark ? "border-[#E8341A]/30 bg-[#E8341A]/10" : "border-[#E8341A]/20 bg-[#E8341A]/5"}`}>
                                <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Upgrade to Premium 🚀</p>
                                <p className={`text-sm mt-2 leading-6 ${isDark ? "text-white/70" : "text-gray-600"}`}>
                                    You've reached your free pitch limit. Upgrade to continue pitching.
                                </p>
                                <div className="grid gap-3 mt-5">
                                    <button onClick={handleUpgradeCheckout} disabled={upgradeLoading}
                                        className="w-full min-h-[46px] rounded-xl bg-[#E8341A] text-[#060607] text-sm font-bold hover:bg-[#C9230F] transition-colors">
                                        {upgradeLoading ? "Processing..." : userRole === "investor" ? "Upgrade Now – ₹4999/month" : "Upgrade Now – ₹999/month"}
                                    </button>
                                    <button onClick={() => setShowUpgradePrompt(false)}
                                        className={`w-full min-h-[46px] rounded-xl border text-sm font-semibold transition-colors ${isDark ? "border-white/10 text-white/70 hover:border-white/20 hover:text-white" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"}`}>
                                        Back
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {/* Reel tile */}
                                <button onClick={handleReelSelect}
                                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all active:scale-95 ${isDark ? "border-white/15 hover:border-[#00B8A9]/60 hover:bg-[#00B8A9]/10" : "border-gray-200 hover:border-[#00B8A9]/60 hover:bg-[#00B8A9]/5"}`}>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00B8A9] to-[#007a73] flex items-center justify-center shadow-lg shadow-[#00B8A9]/30">
                                        <IoVideocam size={26} className="text-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Pitch Reel</p>
                                        <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Upload a video</p>
                                    </div>
                                </button>

                                {/* Post tile */}
                                <button onClick={() => imageInputRef.current?.click()}
                                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all active:scale-95 ${isDark ? "border-white/15 hover:border-purple-500/60 hover:bg-purple-500/10" : "border-gray-200 hover:border-purple-500/60 hover:bg-purple-50"}`}>
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                        <IoImage size={26} className="text-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Post</p>
                                        <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Share up to {MAX_IMAGES} photos</p>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── GALLERY step ── */}
                {step === "gallery" && (
                    <div className="p-4 space-y-4">
                        {mediaItems.length === 0 ? (
                            /* Empty state — tap to pick images */
                            <button
                                onClick={() => imageInputRef.current?.click()}
                                className={`w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all ${isDark ? "border-white/15 hover:border-purple-500/40 bg-white/5" : "border-gray-200 hover:border-purple-500/40 bg-gray-50"}`}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                    <IoImage size={28} className="text-white" />
                                </div>
                                <div className="text-center px-4">
                                    <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-800"}`}>Tap to add photos</p>
                                    <p className={`text-xs mt-0.5 ${isDark ? "text-gray-500" : "text-gray-400"}`}>Select up to {MAX_IMAGES} images at once</p>
                                </div>
                            </button>
                        ) : (
                            <>
                                {/* Horizontal thumbnail strip */}
                                <div className="flex gap-2 overflow-x-auto pb-1 snap-x" style={{ scrollbarWidth: "none" }}>
                                    {mediaItems.map((item, idx) => (
                                        <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden snap-start group">
                                            <img
                                                src={item.croppedPreview || item.preview}
                                                alt={`Image ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Cropped indicator */}
                                            {item.croppedBlob && (
                                                <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#00B8A9] rounded-full flex items-center justify-center">
                                                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                                                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            )}
                                            {/* Crop button overlay */}
                                            <button
                                                onClick={() => handleOpenCrop(idx)}
                                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold"
                                            >
                                                {item.croppedBlob ? "Re-crop" : "Crop"}
                                            </button>
                                            {/* Remove button */}
                                            <button
                                                onClick={() => handleRemoveItem(idx)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <IoClose size={10} className="text-white" />
                                            </button>
                                            {/* Move left arrow */}
                                            {idx > 0 && (
                                                <button
                                                    onClick={() => handleMoveLeft(idx)}
                                                    className="absolute bottom-1 left-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MdOutlineSwapHoriz size={11} className="text-white" />
                                                </button>
                                            )}
                                            {/* Index badge */}
                                            <div className="absolute top-1 left-1 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center">
                                                <span className="text-[8px] text-white font-bold">{idx + 1}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Add more button */}
                                    {mediaItems.length < MAX_IMAGES && (
                                        <button
                                            onClick={() => addMoreInputRef.current?.click()}
                                            className={`flex-shrink-0 w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${isDark ? "border-white/15 hover:border-[#00B8A9]/50 hover:bg-[#00B8A9]/5" : "border-gray-200 hover:border-[#00B8A9]/50"}`}
                                        >
                                            <IoAdd size={20} className={isDark ? "text-gray-400" : "text-gray-400"} />
                                            <span className={`text-[10px] font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>Add more</span>
                                        </button>
                                    )}
                                </div>

                                {/* Hint — crop reminder */}
                                {!allCropped && (
                                    <p className={`text-xs text-center ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                                        Tap a photo to crop and adjust it before posting
                                    </p>
                                )}

                                {/* Quick preview of selected images */}
                                {previewImages.length > 0 && (
                                    <div className={`rounded-2xl overflow-hidden ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                                        {previewImages.length === 1 ? (
                                            <div className="aspect-[4/3] overflow-hidden">
                                                <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <PostCarousel images={previewImages} aspectRatio="4/3" isDark={isDark} />
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                        {mediaItems.length > 0 && (
                            <button
                                onClick={handleGalleryNext}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold transition-all active:scale-95"
                            >
                                Next →
                            </button>
                        )}

                        {/* Text-only post shortcut */}
                        {mediaItems.length === 0 && (
                            <button
                                onClick={() => { setErrorMsg(""); setStep("post"); }}
                                className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all ${isDark ? "border-white/10 text-white/60 hover:border-white/20 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                            >
                                Post text only (no image)
                            </button>
                        )}
                    </div>
                )}

                {/* ── CROP step ── */}
                {step === "crop" && cropIndex !== null && mediaItems[cropIndex] && (
                    <div className="px-4 pb-2">
                        <ImageCropEditor
                            src={mediaItems[cropIndex].preview}
                            aspectRatio={4 / 3}
                            onConfirm={handleCropConfirm}
                            isDark={isDark}
                        />
                    </div>
                )}

                {/* ── POST step ── */}
                {step === "post" && (
                    <div className="p-4 space-y-4">
                        {/* Image preview */}
                        {previewImages.length > 0 && (
                            <div className={`rounded-2xl overflow-hidden relative ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
                                {previewImages.length === 1 ? (
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <PostCarousel images={previewImages} aspectRatio="4/3" isDark={isDark} />
                                )}
                                {/* Edit gallery back button */}
                                <button
                                    onClick={() => setStep("gallery")}
                                    className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-semibold text-white"
                                    style={{ background: "rgba(0,0,0,0.55)" }}
                                >
                                    Edit
                                </button>
                            </div>
                        )}

                        {/* Image count badge when multiple */}
                        {previewImages.length > 1 && (
                            <p className={`text-xs text-center font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                📷 {previewImages.length} photos selected
                            </p>
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
                        {!reelPreview ? (
                            <button
                                onClick={() => videoInputRef.current?.click()}
                                className={`w-full aspect-[9/16] max-h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${isDark ? "border-white/15 hover:border-[#00B8A9]/40 bg-white/5" : "border-gray-200 hover:border-[#00B8A9]/40 bg-gray-50"}`}
                            >
                                <IoVideocam size={32} className={isDark ? "text-gray-500" : "text-gray-300"} />
                                <span className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Tap to add video</span>
                            </button>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden">
                                <video src={reelPreview} className="w-full rounded-2xl max-h-64 object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FaPlay size={28} className="text-white opacity-80" />
                                </div>
                                <button onClick={() => { setReelFile(null); setReelPreview(null); }}
                                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full">
                                    <IoClose size={14} className="text-white" />
                                </button>
                            </div>
                        )}
                        <textarea value={caption} onChange={e => setCaption(e.target.value)}
                            placeholder="Pitch title or description…" rows={3}
                            className={`w-full rounded-xl p-3 text-sm resize-none outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
                        <input value={hashtags} onChange={e => setHashtags(e.target.value)}
                            placeholder="#saas  #fintech"
                            className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
                        {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                        <UploadButton state={uploadState} progress={uploadProgress} onPress={handleSubmitReel} label="Publish Reel" />
                    </div>
                )}

                {/* Hidden file inputs */}
                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageInputChange}
                />
                <input
                    ref={addMoreInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddMoreChange}
                />
                <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleVideoFileChange}
                />

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
                <><IoCloudUpload size={18} className="animate-bounce" />Uploading…</>
            ) : (
                label
            )}
        </button>
    );
}
