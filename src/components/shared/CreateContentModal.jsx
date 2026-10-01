import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
    IoClose, IoImage, IoVideocam, IoCloudUpload,
    IoCheckmarkCircle, IoAlertCircle, IoArrowBack, IoAdd, IoSparkles,
    IoCrop, IoRefresh, IoSunny, IoColorWand, IoText,
} from "react-icons/io5";
import { FaUndo, FaRedo, FaTrash, FaPlus, FaCheck, FaSpinner, FaBold } from "react-icons/fa";
import { MdOutlineSwapHoriz } from "react-icons/md";
import storageService from "../../services/storageService";
import postsService from "../../services/postsService";
import reelsService from "../../services/reelsService";
import { openRazorpayCheckout } from "../../utils/razorpay";
import PostCarousel from "./PostCarousel";
import PitchVideoEditor from "./PitchVideoEditor/PitchVideoEditor";

const MAX_IMAGES = 10;
const MAX_INPUT_MB = 200;
const TARGET_FILE_MB = 50;

const GALLERY_FILTER_PRESETS = [
    { id: "original", label: "Original" },
    { id: "bright", label: "Bright" },
    { id: "warm", label: "Warm" },
    { id: "cool", label: "Cool" },
    { id: "bw", label: "B & W" },
    { id: "high_contrast", label: "High Contrast" },
];

const ASPECT_RATIO_PRESETS = [
    { id: "original", label: "Original", desc: "No crop" },
    { id: "1:1", label: "1:1", desc: "Square" },
    { id: "4:5", label: "4:5", desc: "Portrait" },
    { id: "16:9", label: "16:9", desc: "Landscape" },
];

const EVOA_TEXT_PRESETS = [
    { label: "Problem", text: "Problem: The pain point we solve" },
    { label: "Solution", text: "Solution: Our core innovation" },
    { label: "Market", text: "Market Size: $X Billion TAM" },
    { label: "Traction", text: "Traction: X% MoM Growth & Users" },
    { label: "Business Model", text: "Business Model: Recurring Revenue" },
    { label: "Funding Ask", text: "Raising: ₹X Cr / Seed Round" },
];

const getFilterCss = (item) => {
    if (!item) return "none";
    const b = (item.brightness ?? 100) / 100;
    const c = (item.contrast ?? 100) / 100;
    const s = (item.saturation ?? 100) / 100;
    let base = `brightness(${b}) contrast(${c}) saturate(${s})`;
    if (item.filter === "bright") {
        base += " brightness(1.12) contrast(1.08) saturate(1.15)";
    } else if (item.filter === "warm") {
        base += " sepia(0.2) saturate(1.2) hue-rotate(-10deg)";
    } else if (item.filter === "cool") {
        base += " saturate(1.1) hue-rotate(15deg) brightness(1.05)";
    } else if (item.filter === "bw") {
        base += " grayscale(1) contrast(1.15)";
    } else if (item.filter === "high_contrast") {
        base += " contrast(1.35) saturate(1.2)";
    }
    return base;
};

// Canvas baking function for saving image edits
const renderEditedImageBlob = async (item) => {
    const hasCrop = item.aspectRatio && item.aspectRatio !== "original";
    const hasRotation = item.rotation && item.rotation % 360 !== 0;
    const hasAdjustments = (
        (item.brightness && item.brightness !== 100) ||
        (item.contrast && item.contrast !== 100) ||
        (item.saturation && item.saturation !== 100) ||
        (item.filter && item.filter !== "original")
    );
    const hasText = item.textOverlays && item.textOverlays.length > 0;

    const hasEdits = hasCrop || hasRotation || hasAdjustments || hasText;

    // If no edits were made, upload the original file directly with 0 transformation
    if (!hasEdits) {
        return item.file;
    }

    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const naturalW = img.naturalWidth || img.width;
                const naturalH = img.naturalHeight || img.height;

                let cropW = naturalW;
                let cropH = naturalH;
                let cropX = 0;
                let cropY = 0;

                // ONLY apply aspect ratio cropping if user explicitly picked a preset (1:1, 4:5, 16:9)
                if (hasCrop) {
                    let targetRatio = 1;
                    if (item.aspectRatio === "1:1") targetRatio = 1;
                    else if (item.aspectRatio === "4:5") targetRatio = 4 / 5;
                    else if (item.aspectRatio === "16:9") targetRatio = 16 / 9;

                    const currentRatio = naturalW / naturalH;
                    if (currentRatio > targetRatio) {
                        cropW = naturalH * targetRatio;
                        cropH = naturalH;
                        cropX = (naturalW - cropW) / 2;
                        cropY = 0;
                    } else {
                        cropW = naturalW;
                        cropH = naturalW / targetRatio;
                        cropX = 0;
                        cropY = (naturalH - cropH) / 2;
                    }
                }

                const rot = ((item.rotation || 0) % 360 + 360) % 360;
                const isRotated90or270 = rot === 90 || rot === 270;

                const canvasW = isRotated90or270 ? cropH : cropW;
                const canvasH = isRotated90or270 ? cropW : cropH;

                const canvas = document.createElement("canvas");
                canvas.width = canvasW;
                canvas.height = canvasH;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(item.file);
                    return;
                }

                const b = (item.brightness ?? 100) / 100;
                const c = (item.contrast ?? 100) / 100;
                const s = (item.saturation ?? 100) / 100;
                let filterStr = `brightness(${b}) contrast(${c}) saturate(${s})`;

                if (item.filter === "bright") {
                    filterStr += " brightness(1.12) contrast(1.08) saturate(1.15)";
                } else if (item.filter === "warm") {
                    filterStr += " sepia(0.2) saturate(1.2) hue-rotate(-10deg)";
                } else if (item.filter === "cool") {
                    filterStr += " saturate(1.1) hue-rotate(15deg) brightness(1.05)";
                } else if (item.filter === "bw") {
                    filterStr += " grayscale(1) contrast(1.15)";
                } else if (item.filter === "high_contrast") {
                    filterStr += " contrast(1.35) saturate(1.2)";
                }

                ctx.filter = filterStr;

                ctx.save();
                ctx.translate(canvasW / 2, canvasH / 2);
                ctx.rotate((rot * Math.PI) / 180);
                ctx.drawImage(
                    img,
                    cropX, cropY, cropW, cropH,
                    -cropW / 2, -cropH / 2, cropW, cropH
                );
                ctx.restore();

                ctx.filter = "none";

                if (item.textOverlays && item.textOverlays.length > 0) {
                    item.textOverlays.forEach((txtObj) => {
                        if (!txtObj.text?.trim()) return;
                        const text = txtObj.text;
                        const fontSize = Math.max(16, Math.round((canvasW / 400) * (txtObj.fontSize || 18)));
                        const fontWeight = txtObj.isBold ? "bold" : "600";
                        ctx.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
                        ctx.textAlign = txtObj.alignment || "center";
                        ctx.textBaseline = "middle";

                        let x = canvasW / 2;
                        if (txtObj.alignment === "left") x = canvasW * 0.08;
                        if (txtObj.alignment === "right") x = canvasW * 0.92;

                        let y = canvasH / 2;
                        if (txtObj.position === "top") y = canvasH * 0.15;
                        if (txtObj.position === "bottom") y = canvasH * 0.85;

                        if (txtObj.hasBackground !== false) {
                            const metrics = ctx.measureText(text);
                            const paddingX = fontSize * 0.6;
                            const paddingY = fontSize * 0.35;
                            const bgW = metrics.width + paddingX * 2;
                            const bgH = fontSize * 1.5;
                            let bgX = x - bgW / 2;
                            if (txtObj.alignment === "left") bgX = x - paddingX;
                            if (txtObj.alignment === "right") bgX = x - bgW + paddingX;
                            const bgY = y - bgH / 2;

                            ctx.fillStyle = "rgba(0, 0, 0, 0.68)";
                            ctx.beginPath();
                            if (ctx.roundRect) {
                                ctx.roundRect(bgX, bgY, bgW, bgH, 8);
                            } else {
                                ctx.rect(bgX, bgY, bgW, bgH);
                            }
                            ctx.fill();
                        }

                        ctx.fillStyle = txtObj.color || "#ffffff";
                        ctx.fillText(text, x, y);
                    });
                }

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else resolve(item.file);
                    },
                    item.file?.type === "image/png" ? "image/png" : "image/jpeg",
                    0.94
                );
            } catch (e) {
                console.error("Canvas baking error:", e);
                resolve(item.file);
            }
        };
        img.onerror = () => resolve(item.file);
        img.src = item.preview;
    });
};

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
     *   'gallery' — multi-image thumbnail strip with compact inline editing toolbar
     *   'post'    — caption / hashtags / preview / share
     *   'reel'    — reel upload step
     */
    const [step, setStep] = useState(canUploadReel ? "choose" : "gallery");

    // ── Multi-image state ────────────────────────────────────────────────────
    const [mediaItems, setMediaItems] = useState([]);
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [galleryEditTab, setGalleryEditTab] = useState("crop"); // 'crop' | 'rotate' | 'adjust' | 'filter' | 'text'
    const [activeTextId, setActiveTextId] = useState(null);
    const [isBaking, setIsBaking] = useState(false);

    // ── Reel state ────────────────────────────────────────────────────────────
    const [reelFile, setReelFile] = useState(null);
    const [reelPreview, setReelPreview] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    // ── Shared form state ─────────────────────────────────────────────────────
    const [caption, setCaption] = useState("");
    const [hashtags, setHashtags] = useState("");
    const [uploadState, setUploadState] = useState("idle"); // idle|compressing|uploading|success|error
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errorMsg, setErrorMsg] = useState("");
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [pitchInfo, setPitchInfo] = useState({ checked: false, pitchCount: 0, isPremium: false });

    useEffect(() => {
        if (isOpen && canUploadReel) {
            reelsService.getPitchCount()
                .then(res => {
                    const data = res?.data?.data || res?.data || {};
                    setPitchInfo({
                        checked: true,
                        pitchCount: data?.pitchCount || 0,
                        isPremium: Boolean(data?.isPremium),
                    });
                })
                .catch(err => console.warn("Pitch count check error:", err));
        }
    }, [isOpen, canUploadReel]);

    const imageInputRef = useRef(null);
    const addMoreInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // ── Reset ─────────────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        setStep(canUploadReel ? "choose" : "gallery");
        setMediaItems([]);
        setSelectedImageIdx(0);
        setGalleryEditTab("crop");
        setActiveTextId(null);
        setIsBaking(false);
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
        const newItems = arr.map(f => {
            const url = URL.createObjectURL(f);
            const itemObj = {
                file: f,
                preview: url,
                aspectRatio: "original",
                rotation: 0,
                brightness: 100,
                contrast: 100,
                saturation: 100,
                filter: "original",
                textOverlays: [],
                croppedBlob: null,
                croppedPreview: null,
                naturalWidth: null,
                naturalHeight: null,
            };
            const img = new Image();
            img.onload = () => {
                itemObj.naturalWidth = img.naturalWidth || img.width;
                itemObj.naturalHeight = img.naturalHeight || img.height;
                setMediaItems(prev => [...prev]);
            };
            img.src = url;
            return itemObj;
        });
        setMediaItems(prev => {
            const combined = [...prev, ...newItems];
            return combined.slice(0, MAX_IMAGES);
        });
        setSelectedImageIdx(0);
        setStep("gallery");
    };

    const handleImageInputChange = (e) => handleImageFiles(e.target.files);
    const handleAddMoreChange = (e) => { handleImageFiles(e.target.files); e.target.value = ""; };

    // ── Remove an image from gallery ──────────────────────────────────────────
    const handleRemoveItem = (idx, e) => {
        e?.stopPropagation();
        setMediaItems(prev => {
            const next = prev.filter((_, i) => i !== idx);
            if (next.length === 0) {
                setStep(canUploadReel ? "choose" : "gallery");
            }
            return next;
        });
        setSelectedImageIdx(prev => Math.max(0, Math.min(prev, mediaItems.length - 2)));
    };

    // ── Reorder by drag — simple swap ─────────────────────────────────────────
    const handleMoveLeft = (idx, e) => {
        e?.stopPropagation();
        if (idx === 0) return;
        setMediaItems(prev => {
            const next = [...prev];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next;
        });
        if (selectedImageIdx === idx) {
            setSelectedImageIdx(idx - 1);
        } else if (selectedImageIdx === idx - 1) {
            setSelectedImageIdx(idx);
        }
    };

    // ── Update current selected image properties ─────────────────────────────
    const updateCurrentImage = (updater) => {
        setMediaItems(prev => prev.map((item, i) => {
            if (i !== selectedImageIdx) return item;
            return typeof updater === "function" ? updater(item) : { ...item, ...updater };
        }));
    };

    const resetCurrentImage = () => {
        updateCurrentImage({
            aspectRatio: "original",
            rotation: 0,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            filter: "original",
            textOverlays: [],
        });
    };

    // ── Text overlay management ──────────────────────────────────────────────
    const addTextOverlay = (defaultText = "Add headline") => {
        const newOverlay = {
            id: "txt_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
            text: defaultText,
            position: "center",
            alignment: "center",
            fontSize: 16,
            color: "#ffffff",
            isBold: true,
            hasBackground: true,
        };
        updateCurrentImage(item => ({
            ...item,
            textOverlays: [...(item.textOverlays || []), newOverlay],
        }));
        setActiveTextId(newOverlay.id);
    };

    const updateTextOverlay = (id, field, value) => {
        updateCurrentImage(item => ({
            ...item,
            textOverlays: (item.textOverlays || []).map(t =>
                t.id === id ? { ...t, [field]: value } : t
            ),
        }));
    };

    const removeTextOverlay = (id) => {
        updateCurrentImage(item => ({
            ...item,
            textOverlays: (item.textOverlays || []).filter(t => t.id !== id),
        }));
        if (activeTextId === id) setActiveTextId(null);
    };

    // ── Advance from gallery → post with canvas baking ────────────────────────
    const handleGalleryNext = async () => {
        if (mediaItems.length === 0 && !caption.trim()) {
            setErrorMsg("Add at least one image or write a caption.");
            return;
        }
        setErrorMsg("");
        setIsBaking(true);
        try {
            const updated = await Promise.all(
                mediaItems.map(async (item) => {
                    const blob = await renderEditedImageBlob(item);
                    const url = URL.createObjectURL(blob);
                    return {
                        ...item,
                        croppedBlob: blob,
                        croppedPreview: url,
                    };
                })
            );
            setMediaItems(updated);
            setStep("post");
        } catch (err) {
            console.error("Image processing error:", err);
            setStep("post");
        } finally {
            setIsBaking(false);
        }
    };

    // ── Reel selection ────────────────────────────────────────────────────────
    const handleReelSelect = async () => {
        setErrorMsg("");

        // Fast path: if limit is already reached, immediately show upgrade prompt without opening file picker
        if (pitchInfo.checked && pitchInfo.pitchCount >= 1 && !pitchInfo.isPremium) {
            setShowUpgradePrompt(true);
            setStep("choose");
            return;
        }

        try {
            const response = await reelsService.getPitchCount();
            const data = response?.data?.data || response?.data || {};
            const count = data?.pitchCount || 0;
            const isPrem = Boolean(data?.isPremium);
            setPitchInfo({ checked: true, pitchCount: count, isPremium: isPrem });

            if (count >= 1 && !isPrem) {
                setShowUpgradePrompt(true);
                setStep("choose");
                return;
            }
        } catch (err) {
            console.warn("Could not check pitch count:", err);
        }

        // Only open file picker if under free limit or premium
        setStep("reel");
        videoInputRef.current?.click();
    };

    const handleVideoFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (pitchInfo.checked && pitchInfo.pitchCount >= 1 && !pitchInfo.isPremium) {
            setShowUpgradePrompt(true);
            setStep("choose");
            e.target.value = "";
            return;
        }
        if (f.size > MAX_INPUT_MB * 1024 * 1024) {
            setErrorMsg("Video size must be under 200 MB.");
            e.target.value = "";
            return;
        }
        setErrorMsg("");
        setReelFile(f);
        setReelPreview(URL.createObjectURL(f));
        setStep("reel");
        e.target.value = "";
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
            const imageUrls = await Promise.all(
                mediaItems.map(async (item) => {
                    const source = item.croppedBlob || item.file;
                    if (!source) return null;
                    const ext = item.croppedBlob ? "jpg" : (item.file?.name?.split(".").pop() || "jpg");
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
        if (uploadState === "uploading" || uploadState === "compressing") return;
        setErrorMsg("");
        try {
            const tagArr = hashtags.split(/[\s,#]+/).filter(Boolean).map(t => t.replace(/^#/, ""));
            let videoUrl = "";
            let thumbnailUrl = "";

            if (reelFile.size > TARGET_FILE_MB * 1024 * 1024) {
                setUploadState("compressing");
                setUploadProgress(20);
                const compressRes = await reelsService.compressVideo(reelFile, (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 70) / progressEvent.total);
                        setUploadProgress(percent);
                    }
                });
                const resData = compressRes?.data?.data || compressRes?.data || {};
                videoUrl = resData.videoUrl;
                thumbnailUrl = resData.thumbnailUrl;
                setUploadState("uploading");
                setUploadProgress(90);
            } else {
                setUploadState("uploading");
                setUploadProgress(40);
                const ext = reelFile.name.split(".").pop() || "mp4";
                const path = `reels/${user?.id}/${Date.now()}.${ext}`;
                videoUrl = await storageService.uploadFile(reelFile, "evoa-media", path);
                setUploadProgress(90);
            }

            await reelsService.createReel({
                videoUrl,
                thumbnailUrl: thumbnailUrl || undefined,
                title: caption,
                description: caption,
                hashtags: tagArr,
            });

            setUploadState("success");
            setUploadProgress(100);
            setTimeout(() => { handleClose(); onCreated?.("reel"); }, 1200);
        } catch (err) {
            console.error(err);
            const errMsg = (err?.response?.data?.message || err?.message || "").toLowerCase();
            if (errMsg.includes("upgrade") || errMsg.includes("limit") || errMsg.includes("pitch reel") || err?.status === 403) {
                setShowUpgradePrompt(true);
                setStep("choose");
                setErrorMsg("You've reached your free pitch limit. Upgrade to continue pitching.");
            } else {
                setErrorMsg(err?.response?.data?.message || err?.message || "Upload failed. Try again.");
            }
            setUploadState("error");
        }
    };

    if (!isOpen) return null;

    const currentItem = mediaItems[selectedImageIdx] || mediaItems[0] || null;
    const activeText = currentItem?.textOverlays?.find(t => t.id === activeTextId) || currentItem?.textOverlays?.[0] || null;
    const previewImages = mediaItems.map(item => item.croppedPreview || item.preview).filter(Boolean);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            {/* Sheet */}
            <div
                className={`relative w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl overflow-hidden ${isDark ? "bg-gray-950" : "bg-white"} shadow-2xl flex flex-col`}
                style={{ maxHeight: "94vh" }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                    <div className={`w-10 h-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-200"}`} />
                </div>

                {/* Header */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    {(step === "post" || step === "reel") && (
                        <button
                            onClick={() => {
                                if (step === "post") { setStep("gallery"); }
                                else { setStep(canUploadReel ? "choose" : "gallery"); setReelFile(null); setReelPreview(null); }
                            }}
                            className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                        >
                            <IoArrowBack size={18} className={isDark ? "text-white" : "text-gray-800"} />
                        </button>
                    )}
                    <h2 className={`text-base font-bold flex-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                        {step === "choose" ? "Create"
                            : step === "gallery" ? `Gallery (${mediaItems.length}/${MAX_IMAGES})`
                            : step === "reel" ? "New Pitch Reel"
                            : "New Post"}
                    </h2>
                    <button onClick={handleClose} className={`p-1.5 rounded-lg ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                        <IoClose size={18} className={isDark ? "text-white/70" : "text-gray-500"} />
                    </button>
                </div>

                {/* Scrollable Modal Body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
                    {/* ── CHOOSE step ── */}
                    {step === "choose" && (
                        <div className="py-2">
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
                                        className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-dashed transition-all active:scale-95 ${isDark ? "border-white/15 hover:border-evoa/60 hover:bg-evoa/10" : "border-gray-200 hover:border-evoa/60 hover:bg-evoa/5"}`}>
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-evoa to-evoa-darker flex items-center justify-center shadow-lg shadow-evoa/30">
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

                    {/* ── GALLERY step with inline toolbar ── */}
                    {step === "gallery" && (
                        <div className="space-y-4">
                            {mediaItems.length === 0 ? (
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
                                    {/* Thumbnail strip */}
                                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x">
                                        {mediaItems.map((item, idx) => {
                                            const isSelected = selectedImageIdx === idx;
                                            const hasEdits = (
                                                (item.aspectRatio && item.aspectRatio !== "original") ||
                                                (item.rotation && item.rotation % 360 !== 0) ||
                                                (item.brightness && item.brightness !== 100) ||
                                                (item.contrast && item.contrast !== 100) ||
                                                (item.saturation && item.saturation !== 100) ||
                                                (item.filter && item.filter !== "original") ||
                                                (item.textOverlays && item.textOverlays.length > 0)
                                            );

                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => setSelectedImageIdx(idx)}
                                                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer transition-all snap-start ${
                                                        isSelected
                                                            ? "ring-2 ring-evoa ring-offset-2 ring-offset-black scale-100"
                                                            : "opacity-75 hover:opacity-100 border border-white/10"
                                                    }`}
                                                >
                                                    <img
                                                        src={item.preview}
                                                        alt={`Thumbnail ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                        style={{
                                                            filter: getFilterCss(item),
                                                            transform: `rotate(${item.rotation || 0}deg)`,
                                                        }}
                                                    />

                                                    {/* Index badge */}
                                                    <div className="absolute top-1 left-1 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center">
                                                        <span className="text-[9px] text-white font-bold">{idx + 1}</span>
                                                    </div>

                                                    {/* Edit active indicator badge */}
                                                    {hasEdits && (
                                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-evoa rounded-full flex items-center justify-center shadow">
                                                            <IoSparkles size={8} className="text-white" />
                                                        </div>
                                                    )}

                                                    {/* Swap left button */}
                                                    {idx > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleMoveLeft(idx, e)}
                                                            className="absolute bottom-1 left-1 w-4 h-4 bg-black/70 hover:bg-black rounded-full flex items-center justify-center text-white"
                                                            title="Move left"
                                                        >
                                                            <MdOutlineSwapHoriz size={10} />
                                                        </button>
                                                    )}

                                                    {/* Remove button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleRemoveItem(idx, e)}
                                                        className="absolute top-1 right-1 w-4 h-4 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                                                        title="Remove"
                                                    >
                                                        <IoClose size={10} />
                                                    </button>
                                                </div>
                                            );
                                        })}

                                        {/* Add more button */}
                                        {mediaItems.length < MAX_IMAGES && (
                                            <button
                                                type="button"
                                                onClick={() => addMoreInputRef.current?.click()}
                                                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${
                                                    isDark ? "border-white/15 hover:border-evoa/60 bg-white/5" : "border-gray-200 hover:border-evoa/60 bg-gray-50"
                                                }`}
                                            >
                                                <IoAdd size={18} className={isDark ? "text-gray-400" : "text-gray-500"} />
                                                <span className={`text-[9px] font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Add</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Main Live Preview of Currently Selected Image */}
                                    {currentItem && (
                                        <div className={`relative w-full rounded-2xl overflow-hidden ${isDark ? "bg-black/90 border border-white/10" : "bg-gray-950 border border-gray-200"} flex items-center justify-center min-h-[200px] max-h-[280px] p-2`}>
                                            <div
                                                className={`relative overflow-hidden flex items-center justify-center transition-all ${
                                                    currentItem.aspectRatio === "1:1"
                                                        ? "aspect-square h-full max-w-full"
                                                        : currentItem.aspectRatio === "4:5"
                                                        ? "aspect-[4/5] h-full max-w-full"
                                                        : currentItem.aspectRatio === "16:9"
                                                        ? "aspect-[16/9] w-full"
                                                        : "h-full w-full max-h-[260px]"
                                                }`}
                                                style={
                                                    currentItem.aspectRatio === "original" && currentItem.naturalWidth && currentItem.naturalHeight
                                                        ? {
                                                            aspectRatio: `${(currentItem.rotation || 0) % 180 !== 0 ? currentItem.naturalHeight : currentItem.naturalWidth} / ${(currentItem.rotation || 0) % 180 !== 0 ? currentItem.naturalWidth : currentItem.naturalHeight}`,
                                                            maxWidth: "100%",
                                                            maxHeight: "260px",
                                                        }
                                                        : {}
                                                }
                                            >
                                                <img
                                                    src={currentItem.preview}
                                                    alt="Editing preview"
                                                    className={`w-full h-full ${currentItem.aspectRatio && currentItem.aspectRatio !== "original" ? "object-cover" : "object-contain"} transition-transform duration-200`}
                                                    style={{
                                                        filter: getFilterCss(currentItem),
                                                        transform: `rotate(${currentItem.rotation || 0}deg)`,
                                                    }}
                                                />

                                                {/* Live Text Overlays */}
                                                {currentItem.textOverlays?.map((txtObj) => (
                                                    <div
                                                        key={txtObj.id}
                                                        onClick={() => {
                                                            setGalleryEditTab("text");
                                                            setActiveTextId(txtObj.id);
                                                        }}
                                                        className={`absolute cursor-pointer select-none transition-all ${
                                                            txtObj.position === "top"
                                                                ? "top-3 left-0 right-0"
                                                                : txtObj.position === "bottom"
                                                                ? "bottom-3 left-0 right-0"
                                                                : "top-1/2 -translate-y-1/2 left-0 right-0"
                                                        } ${
                                                            txtObj.alignment === "left"
                                                                ? "text-left px-4"
                                                                : txtObj.alignment === "right"
                                                                ? "text-right px-4"
                                                                : "text-center px-4"
                                                        }`}
                                                    >
                                                        <span
                                                            style={{
                                                                color: txtObj.color || "#ffffff",
                                                                fontSize: `${txtObj.fontSize || 16}px`,
                                                                fontWeight: txtObj.isBold ? "bold" : "600",
                                                                backgroundColor: txtObj.hasBackground !== false ? "rgba(0,0,0,0.68)" : "transparent",
                                                                padding: txtObj.hasBackground !== false ? "4px 10px" : "0",
                                                                borderRadius: "8px",
                                                                display: "inline-block",
                                                                maxWidth: "90%",
                                                                wordBreak: "break-word",
                                                            }}
                                                            className={activeTextId === txtObj.id ? "ring-2 ring-evoa" : ""}
                                                        >
                                                            {txtObj.text || "Text"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Photo number indicator */}
                                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white/90">
                                                Photo {selectedImageIdx + 1} of {mediaItems.length}
                                            </div>
                                        </div>
                                    )}

                                    {/* ── Compact Editing Toolbar directly inside Gallery screen ── */}
                                    <div className={`p-3 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}>
                                        {/* Tab navigation strip */}
                                        <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar border-b border-white/10 mb-3">
                                            {[
                                                { id: "crop", label: "Crop", icon: IoCrop },
                                                { id: "rotate", label: "Rotate", icon: IoRefresh },
                                                { id: "adjust", label: "Adjust", icon: IoSunny },
                                                { id: "filter", label: "Filter", icon: IoColorWand },
                                                { id: "text", label: "Text", icon: IoText },
                                            ].map((tab) => {
                                                const Icon = tab.icon;
                                                const isActive = galleryEditTab === tab.id;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => setGalleryEditTab(tab.id)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                                            isActive
                                                                ? "bg-evoa text-white shadow-sm"
                                                                : isDark
                                                                ? "bg-white/5 hover:bg-white/10 text-white/70"
                                                                : "bg-white hover:bg-gray-200 text-gray-700 border border-gray-200"
                                                        }`}
                                                    >
                                                        <Icon size={13} />
                                                        {tab.label}
                                                    </button>
                                                );
                                            })}

                                            {/* Quick Reset Photo Button */}
                                            <button
                                                type="button"
                                                onClick={resetCurrentImage}
                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold ml-auto whitespace-nowrap transition-colors ${
                                                    isDark ? "text-white/60 hover:text-white bg-white/5 hover:bg-white/10" : "text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300"
                                                }`}
                                                title="Reset current photo edits"
                                            >
                                                <FaUndo size={10} /> Reset
                                            </button>
                                        </div>

                                        {/* ── CROP TAB PANEL ── */}
                                        {galleryEditTab === "crop" && currentItem && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold">Aspect Ratio Crop</span>
                                                    <span className="text-[11px] opacity-60 font-mono">
                                                        {currentItem.aspectRatio || "Original"}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-4 gap-1.5">
                                                    {ASPECT_RATIO_PRESETS.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => updateCurrentImage({ aspectRatio: p.id })}
                                                            className={`py-2 px-1 rounded-xl text-center border transition-all ${
                                                                (currentItem.aspectRatio || "original") === p.id
                                                                    ? "border-evoa bg-evoa/15 text-evoa font-bold shadow-sm"
                                                                    : isDark
                                                                    ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                                                                    : "border-gray-200 bg-white hover:bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            <p className="text-xs font-semibold">{p.label}</p>
                                                            <p className="text-[9px] opacity-60 mt-0.5">{p.desc}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── ROTATE TAB PANEL ── */}
                                        {galleryEditTab === "rotate" && currentItem && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold">Orientation</span>
                                                    <span className="text-[11px] opacity-60 font-mono">
                                                        {((currentItem.rotation || 0) % 360 + 360) % 360}°
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCurrentImage(item => ({ rotation: ((item.rotation || 0) + 270) % 360 }))}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                                                            isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-gray-200 hover:bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        <FaUndo size={11} /> Rotate Left 90°
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCurrentImage(item => ({ rotation: ((item.rotation || 0) + 90) % 360 }))}
                                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                                                            isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-white border-gray-200 hover:bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        <FaRedo size={11} /> Rotate Right 90°
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── ADJUST TAB PANEL ── */}
                                        {galleryEditTab === "adjust" && currentItem && (
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold">Image Adjustments</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateCurrentImage({ brightness: 100, contrast: 100, saturation: 100 })}
                                                        className="text-[11px] text-evoa hover:underline"
                                                    >
                                                        Reset Sliders
                                                    </button>
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[11px] mb-0.5">
                                                        <span>Brightness</span>
                                                        <span className="font-mono">{currentItem.brightness ?? 100}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="50"
                                                        max="150"
                                                        value={currentItem.brightness ?? 100}
                                                        onChange={(e) => updateCurrentImage({ brightness: parseInt(e.target.value, 10) })}
                                                        className="w-full accent-evoa h-1.5"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[11px] mb-0.5">
                                                        <span>Contrast</span>
                                                        <span className="font-mono">{currentItem.contrast ?? 100}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="50"
                                                        max="150"
                                                        value={currentItem.contrast ?? 100}
                                                        onChange={(e) => updateCurrentImage({ contrast: parseInt(e.target.value, 10) })}
                                                        className="w-full accent-evoa h-1.5"
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[11px] mb-0.5">
                                                        <span>Saturation</span>
                                                        <span className="font-mono">{currentItem.saturation ?? 100}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="200"
                                                        value={currentItem.saturation ?? 100}
                                                        onChange={(e) => updateCurrentImage({ saturation: parseInt(e.target.value, 10) })}
                                                        className="w-full accent-evoa h-1.5"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* ── FILTER TAB PANEL ── */}
                                        {galleryEditTab === "filter" && currentItem && (
                                            <div className="space-y-2">
                                                <span className="text-xs font-bold block">Filters</span>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {GALLERY_FILTER_PRESETS.map((f) => (
                                                        <button
                                                            key={f.id}
                                                            type="button"
                                                            onClick={() => updateCurrentImage({ filter: f.id })}
                                                            className={`py-2 px-1 rounded-xl text-center border text-xs font-semibold transition-all ${
                                                                (currentItem.filter || "original") === f.id
                                                                    ? "border-evoa bg-evoa/20 text-evoa font-bold shadow-sm"
                                                                    : isDark
                                                                    ? "border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                                                                    : "border-gray-200 bg-white hover:bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {f.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* ── TEXT OVERLAY TAB PANEL ── */}
                                        {galleryEditTab === "text" && currentItem && (
                                            <div className="space-y-2.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold">Text Overlays</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => addTextOverlay("New Headline")}
                                                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-evoa text-white font-semibold shadow-sm"
                                                    >
                                                        <FaPlus size={9} /> Add Text
                                                    </button>
                                                </div>

                                                {/* EVOA Presets */}
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-60 mb-1">
                                                        EVOA Presets
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {EVOA_TEXT_PRESETS.map((p) => (
                                                            <button
                                                                key={p.label}
                                                                type="button"
                                                                onClick={() => addTextOverlay(p.text)}
                                                                className="px-2 py-0.5 rounded-lg text-[10px] bg-evoa/15 text-evoa hover:bg-evoa/25 font-medium transition-colors"
                                                            >
                                                                +{p.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Active Text Layer Inspector */}
                                                {activeText && (
                                                    <div className={`p-2.5 rounded-xl border space-y-2 ${isDark ? "bg-black/30 border-white/10" : "bg-white border-gray-200"}`}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-bold text-evoa">Edit Text Layer</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTextOverlay(activeText.id)}
                                                                className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1"
                                                            >
                                                                <FaTrash size={10} /> Delete
                                                            </button>
                                                        </div>

                                                        <input
                                                            type="text"
                                                            value={activeText.text}
                                                            onChange={(e) => updateTextOverlay(activeText.id, "text", e.target.value)}
                                                            placeholder="Type overlay text..."
                                                            className={`w-full px-2.5 py-1.5 rounded-lg text-xs outline-none border ${
                                                                isDark ? "bg-white/5 border-white/15 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                                            }`}
                                                        />

                                                        <div className="grid grid-cols-3 gap-1.5">
                                                            <div>
                                                                <label className="text-[9px] opacity-60 block mb-0.5">Position</label>
                                                                <select
                                                                    value={activeText.position}
                                                                    onChange={(e) => updateTextOverlay(activeText.id, "position", e.target.value)}
                                                                    className={`w-full px-1.5 py-1 rounded-lg text-xs outline-none border ${
                                                                        isDark ? "bg-gray-900 border-white/15 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                                                    }`}
                                                                >
                                                                    <option value="top">Top</option>
                                                                    <option value="center">Center</option>
                                                                    <option value="bottom">Bottom</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="text-[9px] opacity-60 block mb-0.5">Align</label>
                                                                <select
                                                                    value={activeText.alignment}
                                                                    onChange={(e) => updateTextOverlay(activeText.id, "alignment", e.target.value)}
                                                                    className={`w-full px-1.5 py-1 rounded-lg text-xs outline-none border ${
                                                                        isDark ? "bg-gray-900 border-white/15 text-white" : "bg-gray-50 border-gray-200 text-gray-900"
                                                                    }`}
                                                                >
                                                                    <option value="center">Center</option>
                                                                    <option value="left">Left</option>
                                                                    <option value="right">Right</option>
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="text-[9px] opacity-60 block mb-0.5">Size ({activeText.fontSize || 16}px)</label>
                                                                <input
                                                                    type="range"
                                                                    min="12"
                                                                    max="28"
                                                                    value={activeText.fontSize || 16}
                                                                    onChange={(e) => updateTextOverlay(activeText.id, "fontSize", parseInt(e.target.value, 10))}
                                                                    className="w-full accent-evoa h-1.5 mt-1"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateTextOverlay(activeText.id, "isBold", !activeText.isBold)}
                                                                className={`px-2 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                                                                    activeText.isBold
                                                                        ? "border-evoa bg-evoa/20 text-evoa"
                                                                        : isDark
                                                                        ? "border-white/10 text-white/70"
                                                                        : "border-gray-200 text-gray-600"
                                                                }`}
                                                            >
                                                                Bold
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => updateTextOverlay(activeText.id, "hasBackground", !activeText.hasBackground)}
                                                                className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                                                                    activeText.hasBackground !== false
                                                                        ? "border-evoa bg-evoa/20 text-evoa"
                                                                        : isDark
                                                                        ? "border-white/10 text-white/70"
                                                                        : "border-gray-200 text-gray-600"
                                                                }`}
                                                            >
                                                                Dark Pill
                                                            </button>

                                                            <div className="flex items-center gap-1">
                                                                {["#ffffff", "#00d2b4", "#fbbf24", "#ef4444"].map((c) => (
                                                                    <button
                                                                        key={c}
                                                                        type="button"
                                                                        onClick={() => updateTextOverlay(activeText.id, "color", c)}
                                                                        className={`w-4 h-4 rounded-full border ${
                                                                            activeText.color === c ? "ring-2 ring-white scale-110" : ""
                                                                        }`}
                                                                        style={{ backgroundColor: c }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                            {mediaItems.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleGalleryNext}
                                    disabled={isBaking}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-75"
                                >
                                    {isBaking ? (
                                        <>
                                            <IoSparkles size={16} className="animate-spin" />
                                            Applying edits…
                                        </>
                                    ) : (
                                        "Next →"
                                    )}
                                </button>
                            )}

                            {mediaItems.length === 0 && (
                                <button
                                    type="button"
                                    onClick={() => { setErrorMsg(""); setStep("post"); }}
                                    className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all ${isDark ? "border-white/10 text-white/60 hover:border-white/20 hover:text-white" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"}`}
                                >
                                    Post text only (no image)
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── POST step ── */}
                    {step === "post" && (
                        <div className="space-y-4">
                            {previewImages.length > 0 && (
                                <div className={`rounded-2xl overflow-hidden relative ${isDark ? "bg-gray-900 border border-white/10" : "bg-gray-100 border border-gray-200"}`}>
                                    {previewImages.length === 1 ? (
                                        <div className="w-full min-h-[200px] max-h-[320px] flex items-center justify-center bg-black/40 overflow-hidden">
                                            <img
                                                src={previewImages[0]}
                                                alt="Preview"
                                                className="w-full h-full max-h-[320px] object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <PostCarousel
                                            images={previewImages}
                                            aspectRatio={
                                                mediaItems[0]?.aspectRatio === "1:1"
                                                    ? "1/1"
                                                    : mediaItems[0]?.aspectRatio === "4:5"
                                                    ? "4/5"
                                                    : mediaItems[0]?.aspectRatio === "16:9"
                                                    ? "16/9"
                                                    : (mediaItems[0]?.naturalWidth && mediaItems[0]?.naturalHeight
                                                        ? `${mediaItems[0].naturalWidth}/${mediaItems[0].naturalHeight}`
                                                        : "4/3")
                                            }
                                            imageFit={mediaItems.some(i => i.aspectRatio && i.aspectRatio !== "original") ? "cover" : "contain"}
                                            isDark={isDark}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setStep("gallery")}
                                        className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md shadow-md z-10"
                                        style={{ background: "rgba(0,0,0,0.65)" }}
                                    >
                                        ← Edit
                                    </button>
                                </div>
                            )}

                            {previewImages.length > 1 && (
                                <p className={`text-xs text-center font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                    📷 {previewImages.length} photos selected
                                </p>
                            )}

                            <textarea
                                value={caption}
                                onChange={e => setCaption(e.target.value)}
                                placeholder="Write a caption…"
                                rows={3}
                                className={`w-full rounded-xl p-3 text-sm resize-none outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                            />

                            <input
                                value={hashtags}
                                onChange={e => setHashtags(e.target.value)}
                                placeholder="#hashtag1  #hashtag2"
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`}
                            />

                            {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}

                            <UploadButton state={uploadState} progress={uploadProgress} onPress={handleSubmitPost} label="Share Post" mediaType="image" />
                        </div>
                    )}

                    {/* ── REEL step ── */}
                    {step === "reel" && (
                        <div className="p-4 space-y-4">
                            {!reelPreview ? (
                                <button
                                    type="button"
                                    onClick={() => videoInputRef.current?.click()}
                                    className={`w-full p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                                        isDark
                                            ? "border-white/20 hover:border-evoa/60 bg-white/5 hover:bg-evoa/10"
                                            : "border-gray-300 hover:border-evoa/60 bg-gray-50 hover:bg-teal-50/50"
                                    }`}
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-evoa to-evoa-darker flex items-center justify-center shadow-lg shadow-evoa/30 text-white">
                                        <IoVideocam size={30} />
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                            Select Video from Gallery
                                        </p>
                                        <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                                            Supports MP4, MOV, WebM (up to 200MB &bull; auto-compressed if &gt; 50MB)
                                        </p>
                                    </div>
                                    <span className="mt-1 px-4 py-1.5 rounded-xl text-xs font-semibold bg-evoa text-white shadow-md shadow-evoa/20">
                                        Choose Video
                                    </span>
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-64 flex items-center justify-center">
                                        <video
                                            src={reelPreview}
                                            controls
                                            playsInline
                                            className="w-full h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setReelFile(null); setReelPreview(null); }}
                                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors z-10"
                                            title="Remove video"
                                        >
                                            <IoClose size={14} />
                                        </button>
                                    </div>

                                    {reelFile && reelFile.size > TARGET_FILE_MB * 1024 * 1024 && (
                                        <div className={`p-3 rounded-2xl border flex items-center gap-3 ${
                                            isDark ? "bg-teal-950/40 border-teal-500/30 text-teal-200" : "bg-teal-50 border-teal-200 text-teal-950"
                                        }`}>
                                            <div className="w-8 h-8 rounded-xl bg-evoa/20 text-evoa flex items-center justify-center flex-shrink-0">
                                                <IoSparkles size={16} className="animate-pulse" />
                                            </div>
                                            <div className="text-xs flex-1">
                                                <p className="font-bold">Video selected: {(reelFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                                                <p className="opacity-80 mt-0.5">Optimizing your video... This may take a moment.</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditorOpen(true)}
                                            className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-evoa to-[#008f84] text-white hover:opacity-95 shadow-md shadow-evoa/30 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <IoSparkles size={14} /> Edit in Video Editor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => videoInputRef.current?.click()}
                                            className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                                                isDark ? "border-white/10 hover:bg-white/10 text-white/80" : "border-gray-200 hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            )}
                            <textarea value={caption} onChange={e => setCaption(e.target.value)}
                                placeholder="Pitch title or description…" rows={3}
                                className={`w-full rounded-xl p-3 text-sm resize-none outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
                            <input value={hashtags} onChange={e => setHashtags(e.target.value)}
                                placeholder="#saas  #fintech"
                                className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none border ${isDark ? "bg-gray-900 border-white/10 text-white placeholder:text-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400"}`} />
                            {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                            <UploadButton state={uploadState} progress={uploadProgress} onPress={handleSubmitReel} label="Publish Reel" mediaType="video" />
                        </div>
                    )}
                </div>

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
                    accept="video/mp4,video/quicktime,video/webm,video/*"
                    className="hidden"
                    onChange={handleVideoFileChange}
                />

                <div className="h-4 flex-shrink-0" />
            </div>

            {isEditorOpen && reelFile && (
                <PitchVideoEditor
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    videoFile={reelFile}
                    onSaved={() => {
                        setIsEditorOpen(false);
                        handleClose();
                        onCreated?.("reel");
                    }}
                />
            )}
        </div>
    );
}

function UploadButton({ state, progress, onPress, label, mediaType = "image" }) {
    const isCompressing = state === "compressing";
    const isUploading = state === "uploading";
    const isSuccess = state === "success";
    const isDisabled = isCompressing || isUploading || isSuccess;
    const isVideo = mediaType === "video" || mediaType === "reel";

    return (
        <button
            onClick={onPress}
            disabled={isDisabled}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isSuccess
                    ? "bg-green-500 text-white"
                    : isCompressing
                    ? "bg-gradient-to-r from-teal-600 to-evoa text-white opacity-95 cursor-wait"
                    : "bg-evoa text-white hover:bg-evoa-hover active:scale-95 disabled:opacity-80"
            }`}
        >
            {isSuccess ? (
                isVideo ? (
                    <><IoCheckmarkCircle size={18} />Video ready</>
                ) : (
                    <><IoCheckmarkCircle size={18} />Uploaded</>
                )
            ) : isCompressing ? (
                <><IoSparkles size={18} className="animate-spin" />Compressing video… {progress > 0 ? `${progress}%` : ''}</>
            ) : isUploading ? (
                isVideo ? (
                    <><IoCloudUpload size={18} className="animate-bounce" />Uploading video… {progress > 0 ? `${progress}%` : ''}</>
                ) : (
                    <><IoCloudUpload size={18} className="animate-bounce" />Uploading… {progress > 0 ? `${progress}%` : ''}</>
                )
            ) : (
                label
            )}
        </button>
    );
}
