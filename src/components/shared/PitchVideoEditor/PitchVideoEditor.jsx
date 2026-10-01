import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import {
  IoClose, IoPlay, IoPause, IoVolumeMedium, IoVolumeMute,
  IoColorPalette, IoCrop, IoRefresh, IoText, IoImage,
  IoCheckmarkCircle, IoArrowBack, IoLayers, IoTime,
  IoSunny, IoContrast, IoColorWand, IoSparkles
} from "react-icons/io5";
import {
  FaUndo, FaRedo, FaTrash, FaPlus, FaCheck, FaSpinner,
  FaFileImage, FaSlidersH, FaTag
} from "react-icons/fa";
import storageService from "../../../services/storageService";
import reelsService from "../../../services/reelsService";

const EVOA_TEXT_PRESETS = [
  { label: "Problem", text: "Problem: The pain point we solve" },
  { label: "Solution", text: "Solution: Our core innovation" },
  { label: "Market", text: "Market Size: $X Billion TAM" },
  { label: "Traction", text: "Traction: X% MoM Growth & Users" },
  { label: "Business Model", text: "Business Model: Recurring Revenue" },
  { label: "Funding Ask", text: "Raising: ₹X Cr / Seed Round" },
];

const FILTER_PRESETS = [
  { id: "original", label: "Original", css: "none" },
  { id: "bright", label: "Bright", css: "brightness(1.12) contrast(1.08) saturate(1.15)" },
  { id: "warm", label: "Warm", css: "sepia(0.2) saturate(1.2) hue-rotate(-10deg)" },
  { id: "cool", label: "Cool", css: "saturate(1.1) hue-rotate(15deg) brightness(1.05)" },
  { id: "bw", label: "B & W", css: "grayscale(1) contrast(1.15)" },
  { id: "high_contrast", label: "High Contrast", css: "contrast(1.35) saturate(1.2)" },
];

const formatTime = (secs) => {
  if (isNaN(secs) || secs < 0) return "00:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.floor((secs % 1) * 10);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
};

export default function PitchVideoEditor({
  isOpen,
  onClose,
  videoFile = null,
  videoUrl = null,
  targetReelId = null,
  startupInfo = null,
  onSaved = null,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useAuth();

  // ── Source video resolution ──────────────────────────────────────────────
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // ── Active tab: 'trim' | 'crop' | 'rotate' | 'adjust' | 'filter' | 'text' | 'logo' | 'audio' | 'cover'
  const [activeTab, setActiveTab] = useState("trim");

  // ── Editing States ───────────────────────────────────────────────────────
  // A. Trim
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);

  // B. Crop / Aspect Ratio
  const [aspectRatio, setAspectRatio] = useState("9:16"); // '9:16' | '1:1' | '16:9' | 'original'

  // C. Rotation (0, 90, 180, 270)
  const [rotation, setRotation] = useState(0);

  // D. Adjustments
  const [brightness, setBrightness] = useState(100); // 50 to 150
  const [contrast, setContrast] = useState(100);     // 50 to 150
  const [saturation, setSaturation] = useState(100); // 0 to 200

  // E. Filters
  const [selectedFilter, setSelectedFilter] = useState("original");

  // F. Audio
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100); // 0 to 100

  // G. Text Overlays
  const [textOverlays, setTextOverlays] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);

  // H. Logo Overlay
  const [hasLogo, setHasLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(startupInfo?.logoUrl || "");
  const [logoPosition, setLogoPosition] = useState("top_right"); // top_left, top_right, bottom_left, bottom_right
  const [logoSize, setLogoSize] = useState("medium"); // small, medium, large
  const [logoOpacity, setLogoOpacity] = useState(90); // 10 to 100

  // I. Thumbnail / Cover
  const [coverTime, setCoverTime] = useState(0);
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  // Post Meta
  const [pitchTitle, setPitchTitle] = useState(startupInfo?.name || "");
  const [pitchDescription, setPitchDescription] = useState("");
  const [pitchHashtags, setPitchHashtags] = useState("");
  const [setAsProfilePitch, setSetAsProfilePitch] = useState(true);

  // Processing & Export states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const videoRef = useRef(null);
  const timelineRef = useRef(null);
  const isDraggingRef = useRef(null); // 'start' | 'end' | 'scrub' | null
  const [activeDragHandle, setActiveDragHandle] = useState(null);
  const logoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const trimBoundsRef = useRef({ start: 0, end: 0, duration: 0 });
  useEffect(() => {
    trimBoundsRef.current = { start: trimStart, end: trimEnd, duration };
  }, [trimStart, trimEnd, duration]);

  // ── Instagram-Style Timeline Pointer Drag Handler ────────────────────────
  const handleTimelinePointerDown = (type, e) => {
    e.stopPropagation();
    isDraggingRef.current = type;
    setActiveDragHandle(type);

    const getTimeFromPointer = (ev) => {
      if (!timelineRef.current || trimBoundsRef.current.duration <= 0) return 0;
      const rect = timelineRef.current.getBoundingClientRect();
      const clientX = ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX;
      const fraction = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1);
      return fraction * trimBoundsRef.current.duration;
    };

    if (type === "scrub") {
      const time = getTimeFromPointer(e);
      handleSeek(time);
    }

    const onPointerMove = (moveEv) => {
      if (!isDraggingRef.current) return;
      const time = getTimeFromPointer(moveEv);
      const { start, end, duration: dur } = trimBoundsRef.current;

      if (isDraggingRef.current === "start") {
        const clamped = Math.max(0, Math.min(time, (end || dur) - 0.5));
        setTrimStart(clamped);
        handleSeek(clamped);
      } else if (isDraggingRef.current === "end") {
        const clamped = Math.max((start || 0) + 0.5, Math.min(time, dur || 100));
        setTrimEnd(clamped);
        handleSeek(clamped);
      } else if (isDraggingRef.current === "scrub") {
        const clamped = Math.max(start || 0, Math.min(time, end || dur));
        handleSeek(clamped);
      }
    };

    const onPointerUp = () => {
      isDraggingRef.current = null;
      setActiveDragHandle(null);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
  };

  // ── Load & initialize video ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setResolvedVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (videoUrl) {
      setResolvedVideoUrl(videoUrl);
    } else if (targetReelId) {
      reelsService.getEditDetails(targetReelId)
        .then((res) => {
          const d = res?.data?.data || res?.data || {};
          setResolvedVideoUrl(d.originalVideoUrl || d.videoUrl);
          if (d.title) setPitchTitle(d.title);
          if (d.description) setPitchDescription(d.description);
          if (d.hashtags?.length) setPitchHashtags(d.hashtags.join(", "));
          if (d.thumbnailUrl) {
            setCustomThumbnailUrl(d.thumbnailUrl);
            setCoverPreview(d.thumbnailUrl);
          }
          if (d.startup?.logoUrl) {
            setLogoUrl(d.startup.logoUrl);
            setHasLogo(true);
          }
          // Restore prior edit metadata if present
          if (d.editMetadata) {
            const m = d.editMetadata;
            if (m.crop?.aspectRatio) setAspectRatio(m.crop.aspectRatio);
            if (m.rotation) setRotation(m.rotation);
            if (m.adjustments?.brightness) setBrightness(m.adjustments.brightness);
            if (m.adjustments?.contrast) setContrast(m.adjustments.contrast);
            if (m.adjustments?.saturation) setSaturation(m.adjustments.saturation);
            if (m.filter) setSelectedFilter(m.filter);
            if (m.audio?.muted !== undefined) setIsMuted(m.audio.muted);
            if (m.audio?.volume !== undefined) setVolume(m.audio.volume);
            if (m.textOverlays) setTextOverlays(m.textOverlays);
            if (m.logoOverlay) {
              setHasLogo(true);
              if (m.logoOverlay.position) setLogoPosition(m.logoOverlay.position);
              if (m.logoOverlay.size) setLogoSize(m.logoOverlay.size);
            }
          }
        })
        .catch((err) => {
          setErrorMessage("Failed to load existing pitch details.");
        });
    }

    if (startupInfo?.logoUrl) {
      setLogoUrl(startupInfo.logoUrl);
      setHasLogo(true);
    }
  }, [isOpen, videoFile, videoUrl, targetReelId, startupInfo]);

  // ── Video event handlers ────────────────────────────────────────────────
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setDuration(dur);
    setTrimStart(0);
    setTrimEnd(dur);
    setCoverTime(Math.min(1, dur / 2));
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Loop video within trim bounds
    if (t >= trimEnd && trimEnd > trimStart) {
      videoRef.current.currentTime = trimStart;
      videoRef.current.play().catch(() => {});
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (time) => {
    if (!videoRef.current) return;
    const clamped = Math.max(trimStart, Math.min(trimEnd, time));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  // ── Capture Frame as Thumbnail ───────────────────────────────────────────
  const captureCurrentFrameAsCover = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 720;
      canvas.height = videoRef.current.videoHeight || 1280;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCoverPreview(dataUrl);
      setCoverTime(videoRef.current.currentTime);
      setCustomThumbnailUrl("");
      setSuccessMessage("Frame captured as cover!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (e) {
      setErrorMessage("Could not capture frame from video.");
    }
  };

  // ── Custom Thumbnail Upload ──────────────────────────────────────────────
  const handleCustomThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCoverPreview(preview);
    setCustomThumbnailUrl(preview);
    setCoverTime(0);
  };

  // ── Text Overlay actions ────────────────────────────────────────────────
  const addTextOverlay = (initialText = "New Pitch Headline") => {
    const newOverlay = {
      id: Date.now().toString(),
      text: initialText,
      fontSize: 18,
      isBold: true,
      color: "#FFFFFF",
      position: "bottom", // 'top' | 'center' | 'bottom' | 'custom'
      alignment: "center",
      hasBackground: true,
      startTime: trimStart,
      endTime: trimEnd,
      customYPercent: 80,
    };
    setTextOverlays((prev) => [...prev, newOverlay]);
    setSelectedTextId(newOverlay.id);
  };

  const updateSelectedText = (field, val) => {
    setTextOverlays((prev) =>
      prev.map((item) => (item.id === selectedTextId ? { ...item, [field]: val } : item))
    );
  };

  const removeSelectedText = (id) => {
    setTextOverlays((prev) => prev.filter((item) => item.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // ── Reset helpers ───────────────────────────────────────────────────────
  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const resetAll = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    setAspectRatio("9:16");
    setRotation(0);
    resetAdjustments();
    setSelectedFilter("original");
    setIsMuted(false);
    setVolume(100);
    setTextOverlays([]);
    setHasLogo(Boolean(startupInfo?.logoUrl));
    setLogoPosition("top_right");
    setLogoSize("medium");
    setCoverPreview("");
  };

  // ── Save / Export logic ──────────────────────────────────────────────────
  const handleExport = async () => {
    setIsProcessing(true);
    setErrorMessage("");
    setSuccessMessage("");
    setProcessProgress("Preparing video stream...");

    try {
      let finalSourceVideoUrl = resolvedVideoUrl;

      // 1. If we have a local File object, upload/compress it
      if (videoFile) {
        if (videoFile.size > 200 * 1024 * 1024) {
          throw new Error("Video size must be under 200 MB.");
        }
        if (videoFile.size > 50 * 1024 * 1024) {
          setProcessProgress("Compressing and optimizing video (Target ≤ 50MB)...");
          const compRes = await reelsService.compressVideo(videoFile);
          const compData = compRes?.data?.data || compRes?.data || {};
          if (!compData.videoUrl) {
            throw new Error("We couldn't optimize this video. Please try again.");
          }
          finalSourceVideoUrl = compData.videoUrl;
        } else {
          setProcessProgress("Uploading original pitch video...");
          const ext = videoFile.name.split(".").pop() || "mp4";
          const path = `reels/${user?.id}/raw_${Date.now()}.${ext}`;
          finalSourceVideoUrl = await storageService.uploadFile(videoFile, "evoa-media", path);
        }
      }

      // 2. If custom thumbnail is a local blob/file, upload it
      let finalCustomThumbUrl = customThumbnailUrl;
      if (coverPreview && coverPreview.startsWith("data:image")) {
        setProcessProgress("Uploading thumbnail cover...");
        const res = await fetch(coverPreview);
        const blob = await res.blob();
        const thumbPath = `thumbnails/${user?.id}/custom_${Date.now()}.jpg`;
        finalCustomThumbUrl = await storageService.uploadFile(blob, "evoa-media", thumbPath);
      }

      setProcessProgress("Processing video edits (Trim, Crop, Filters, Watermark)...");

      const tagArr = pitchHashtags
        .split(/[\s,#]+/)
        .filter(Boolean)
        .map((t) => t.replace(/^#/, ""));

      const payload = {
        videoUrl: finalSourceVideoUrl,
        targetReelId: targetReelId || undefined,
        trim: {
          startTime: Number(trimStart.toFixed(2)),
          endTime: Number(trimEnd.toFixed(2)),
        },
        crop: {
          aspectRatio,
        },
        rotation,
        adjustments: {
          brightness,
          contrast,
          saturation,
        },
        filter: selectedFilter,
        audio: {
          muted: isMuted,
          volume,
        },
        textOverlays: textOverlays.map((t) => ({
          text: t.text,
          fontSize: t.fontSize,
          isBold: t.isBold,
          color: t.color,
          position: t.position,
          alignment: t.alignment,
          hasBackground: t.hasBackground,
          startTime: t.startTime,
          endTime: t.endTime,
          customYPercent: t.customYPercent,
        })),
        logoOverlay: hasLogo
          ? {
              logoUrl,
              position: logoPosition,
              size: logoSize,
              opacity: logoOpacity / 100,
            }
          : undefined,
        thumbnail: {
          captureTime: Number(coverTime.toFixed(2)),
          customThumbnailUrl: finalCustomThumbUrl || undefined,
        },
        title: pitchTitle.trim() || undefined,
        description: pitchDescription.trim() || undefined,
        hashtags: tagArr,
        setAsStartupPitchVideo: setAsProfilePitch,
      };

      const response = await reelsService.processVideo(payload);
      const resultData = response?.data?.data || response?.data || response;

      setProcessProgress("Pitch video processed successfully!");
      setSuccessMessage("Pitch video saved and published successfully!");

      setTimeout(() => {
        setIsProcessing(false);
        onSaved?.(resultData);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Video export failed:", err);
      setIsProcessing(false);
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Failed to process video. Please try again."
      );
    }
  };

  if (!isOpen) return null;

  // Active text overlay object
  const activeText = textOverlays.find((t) => t.id === selectedTextId);

  // Compute live CSS Filter string
  const getComputedCssFilter = () => {
    const fObj = FILTER_PRESETS.find((f) => f.id === selectedFilter);
    const filterCss = fObj?.css !== "none" ? fObj?.css || "" : "";
    const bCss = brightness !== 100 ? `brightness(${brightness / 100})` : "";
    const cCss = contrast !== 100 ? `contrast(${contrast / 100})` : "";
    const sCss = saturation !== 100 ? `saturate(${saturation / 100})` : "";
    return [filterCss, bCss, cCss, sCss].filter(Boolean).join(" ") || "none";
  };

  // Compute aspect ratio container style
  const getAspectContainerStyle = () => {
    switch (aspectRatio) {
      case "9:16":
        return { aspectRatio: "9/16", maxHeight: "58vh" };
      case "1:1":
        return { aspectRatio: "1/1", maxHeight: "50vh" };
      case "16:9":
        return { aspectRatio: "16/9", maxHeight: "45vh" };
      default:
        return { maxHeight: "58vh" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Container Card */}
      <div
        className={`relative w-full max-w-4xl max-h-[96vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border ${
          isDark
            ? "bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white border-white/15"
            : "bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900 border-gray-200"
        }`}
      >
        {/* ── Top Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-evoa/20 text-evoa">
              <IoSparkles size={18} />
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight">
                Pitch Video Editor
              </h3>
              <p className="text-[11px] opacity-60">
                Trim, crop, add text overlays, brand logo & export
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              title="Reset all edits"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition-all"
            >
              <FaUndo size={10} /> Reset All
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <IoClose size={22} />
            </button>
          </div>
        </div>

        {/* ── Main Body: Video Preview & Editing Controls ────────────── */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6">
          
          {/* LEFT: Video Player / Preview (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {/* Viewport Frame */}
            <div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10 flex items-center justify-center transition-all duration-300"
              style={getAspectContainerStyle()}
            >
              {/* Video Element */}
              <video
                ref={videoRef}
                src={resolvedVideoUrl}
                crossOrigin="anonymous"
                playsInline
                muted={isMuted}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-200"
                style={{
                  filter: getComputedCssFilter(),
                  transform: `rotate(${rotation}deg)`,
                }}
              />

              {/* Play / Pause Floating Overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all opacity-0 hover:opacity-100 group"
              >
                <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition-transform">
                  {isPlaying ? <IoPause size={26} /> : <IoPlay size={26} className="ml-1" />}
                </div>
              </button>

              {/* Text Overlays Render on Preview */}
              {textOverlays.map((t) => {
                const isVisible =
                  currentTime >= (t.startTime ?? 0) &&
                  currentTime <= (t.endTime ?? (duration || 9999));
                if (!isVisible) return null;

                let posClass = "bottom-6 inset-x-4";
                if (t.position === "top") posClass = "top-6 inset-x-4";
                if (t.position === "center") posClass = "top-1/2 -translate-y-1/2 inset-x-4";

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTextId(t.id);
                      setActiveTab("text");
                    }}
                    className={`absolute ${posClass} z-20 pointer-events-auto cursor-pointer transition-all ${
                      selectedTextId === t.id ? "ring-2 ring-evoa scale-[1.02]" : ""
                    }`}
                    style={{ textAlign: t.alignment || "center" }}
                  >
                    <span
                      className={`inline-block px-3 py-1.5 rounded-xl transition-all ${
                        t.hasBackground ? "bg-black/75 backdrop-blur-md" : ""
                      }`}
                      style={{
                        fontSize: `${t.fontSize || 16}px`,
                        fontWeight: t.isBold ? "bold" : "normal",
                        color: t.color || "#FFFFFF",
                        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                      }}
                    >
                      {t.text}
                    </span>
                  </div>
                );
              })}

              {/* Logo Overlay Render on Preview */}
              {hasLogo && logoUrl && (
                <div
                  className={`absolute z-20 pointer-events-none p-3 ${
                    logoPosition === "top_left"
                      ? "top-1 left-1"
                      : logoPosition === "bottom_left"
                      ? "bottom-1 left-1"
                      : logoPosition === "bottom_right"
                      ? "bottom-1 right-1"
                      : "top-1 right-1"
                  }`}
                  style={{ opacity: logoOpacity / 100 }}
                >
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className={`object-contain rounded-lg drop-shadow-md ${
                      logoSize === "small"
                        ? "w-10 h-10"
                        : logoSize === "large"
                        ? "w-20 h-20"
                        : "w-14 h-14"
                    }`}
                  />
                </div>
              )}

              {/* Timecode Badge */}
              <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-mono text-white/90">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* ── Visual Timeline & Instagram-Style Interactive Trimmer ── */}
            <div className="w-full max-w-sm mt-3 px-1">
              <div className="flex items-center justify-between text-[11px] font-mono opacity-70 mb-1.5 px-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-evoa inline-block" />
                  Start: <strong className="font-bold text-white">{formatTime(trimStart)}</strong>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-evoa/20 text-evoa font-semibold">
                  Trimmed: {formatTime(Math.max(0, trimEnd - trimStart))}
                </span>
                <span className="flex items-center gap-1">
                  End: <strong className="font-bold text-white">{formatTime(trimEnd)}</strong>
                  <span className="w-2 h-2 rounded-full bg-evoa inline-block" />
                </span>
              </div>

              {/* Interactive Timeline Track */}
              <div
                ref={timelineRef}
                onPointerDown={(e) => handleTimelinePointerDown("scrub", e)}
                className="relative w-full h-12 rounded-2xl bg-gray-900 border border-white/20 select-none cursor-pointer overflow-visible touch-none shadow-inner"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 12px)`,
                }}
              >
                {/* Left Dimmed Out-of-Bounds Region */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-black/75 backdrop-blur-[1px] pointer-events-none z-10 rounded-l-2xl"
                  style={{ width: `${duration > 0 ? (trimStart / duration) * 100 : 0}%` }}
                />

                {/* Right Dimmed Out-of-Bounds Region */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/75 backdrop-blur-[1px] pointer-events-none z-10 rounded-r-2xl"
                  style={{ width: `${duration > 0 ? 100 - (trimEnd / duration) * 100 : 0}%` }}
                />

                {/* Active Highlighted Trim Window */}
                <div
                  className="absolute top-0 bottom-0 border-t-2 border-b-2 border-evoa bg-evoa/15 z-20 pointer-events-none"
                  style={{
                    left: `${duration > 0 ? (trimStart / duration) * 100 : 0}%`,
                    width: `${duration > 0 ? Math.max(0, ((trimEnd - trimStart) / duration) * 100) : 100}%`,
                  }}
                />

                {/* Left Drag Handle (Start Time) */}
                <div
                  onPointerDown={(e) => handleTimelinePointerDown("start", e)}
                  className={`absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize touch-none transition-transform ${
                    activeDragHandle === "start" ? "scale-110 z-40" : ""
                  }`}
                  style={{
                    left: `${duration > 0 ? (trimStart / duration) * 100 : 0}%`,
                    width: "22px",
                    transform: "translateX(-100%)",
                  }}
                  title="Drag left handle to trim start time"
                >
                  <div className="w-5 h-full rounded-l-xl bg-gradient-to-r from-evoa to-[#00a897] shadow-lg shadow-black/60 flex flex-col items-center justify-center gap-1 border-y border-l border-white/50 hover:brightness-110 active:brightness-125">
                    <div className="w-0.5 h-3.5 bg-white/90 rounded-full" />
                    <div className="w-0.5 h-3.5 bg-white/90 rounded-full" />
                  </div>
                  {activeDragHandle === "start" && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-evoa text-black text-[10px] font-bold font-mono whitespace-nowrap shadow-md pointer-events-none">
                      {formatTime(trimStart)}
                    </div>
                  )}
                </div>

                {/* Right Drag Handle (End Time) */}
                <div
                  onPointerDown={(e) => handleTimelinePointerDown("end", e)}
                  className={`absolute top-0 bottom-0 z-30 flex items-center justify-center cursor-ew-resize touch-none transition-transform ${
                    activeDragHandle === "end" ? "scale-110 z-40" : ""
                  }`}
                  style={{
                    left: `${duration > 0 ? (trimEnd / duration) * 100 : 100}%`,
                    width: "22px",
                    transform: "translateX(0)",
                  }}
                  title="Drag right handle to trim end time"
                >
                  <div className="w-5 h-full rounded-r-xl bg-gradient-to-r from-[#00a897] to-evoa shadow-lg shadow-black/60 flex flex-col items-center justify-center gap-1 border-y border-r border-white/50 hover:brightness-110 active:brightness-125">
                    <div className="w-0.5 h-3.5 bg-white/90 rounded-full" />
                    <div className="w-0.5 h-3.5 bg-white/90 rounded-full" />
                  </div>
                  {activeDragHandle === "end" && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-evoa text-black text-[10px] font-bold font-mono whitespace-nowrap shadow-md pointer-events-none">
                      {formatTime(trimEnd)}
                    </div>
                  )}
                </div>

                {/* Playhead Scrubber Line */}
                {duration > 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl pointer-events-none z-25"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="w-2.5 h-2.5 -ml-1 -mt-0.5 rounded-full bg-white shadow-md shadow-black" />
                  </div>
                )}
              </div>

              <p className="text-[10px] text-center opacity-50 mt-1.5">
                Drag the left & right handles to trim &bull; Tap track to seek
              </p>
            </div>
          </div>

          {/* RIGHT: Tabbed Controls (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            
            {/* Scrollable Tool Tabs Toolbar */}
            <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar border-b border-white/10 mb-4">
              {[
                { id: "trim", label: "Trim", icon: IoTime },
                { id: "crop", label: "Crop", icon: IoCrop },
                { id: "rotate", label: "Rotate", icon: IoRefresh },
                { id: "adjust", label: "Adjust", icon: IoSunny },
                { id: "filter", label: "Filter", icon: IoColorWand },
                { id: "text", label: "Text", icon: IoText },
                { id: "logo", label: "Logo", icon: IoImage },
                { id: "audio", label: "Audio", icon: IoVolumeMedium },
                { id: "cover", label: "Cover", icon: FaFileImage },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-evoa text-white shadow-md shadow-evoa/30"
                        : isDark
                        ? "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="flex-1 space-y-4 min-h-[220px]">
              
              {/* ── TRIM PANEL ── */}
              {activeTab === "trim" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Timeline Trim</h4>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-evoa/15 text-evoa font-semibold">
                      {formatTime(Math.max(0, trimEnd - trimStart))} selected
                    </span>
                  </div>

                  {/* Interactive Trim Info Card (Instagram style) */}
                  <div className={`p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-evoa/20 text-evoa flex items-center justify-center flex-shrink-0">
                        <IoTime size={18} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold">Interactive Timeline Trimming</p>
                        <p className="opacity-70 text-[11px] mt-0.5">
                          Drag the left and right handles on the timeline bar directly below the video to choose your trim section.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
                      <div className={`p-2.5 rounded-xl ${isDark ? "bg-black/30" : "bg-gray-50"} text-center`}>
                        <span className="text-[10px] opacity-60 block uppercase font-mono">Start Time</span>
                        <span className="font-mono font-bold text-sm text-evoa">{formatTime(trimStart)}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl ${isDark ? "bg-black/30" : "bg-gray-50"} text-center`}>
                        <span className="text-[10px] opacity-60 block uppercase font-mono">End Time</span>
                        <span className="font-mono font-bold text-sm text-evoa">{formatTime(trimEnd)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Jump & Reset Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSeek(trimStart)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      Jump to Start
                    </button>
                    <button
                      onClick={() => handleSeek(Math.max(trimStart, trimEnd - 0.5))}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                      }`}
                    >
                      Jump to End
                    </button>
                    <button
                      onClick={() => {
                        setTrimStart(0);
                        setTrimEnd(duration || 0);
                        handleSeek(0);
                      }}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                        isDark ? "bg-white/10 hover:bg-white/20 text-white/80 hover:text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      Reset Trim
                    </button>
                  </div>
                </div>
              )}

              {/* ── CROP / ASPECT RATIO PANEL ── */}
              {activeTab === "crop" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">Crop & Aspect Ratio</h4>
                  <p className="text-xs opacity-70">
                    Choose standard framing presets for EVOA feed or landscape pitch decks.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "9:16", label: "9:16 Reel", desc: "EVOA Feed" },
                      { id: "1:1", label: "1:1 Square", desc: "Feed Post" },
                      { id: "16:9", label: "16:9 Landscape", desc: "Web / Deck" },
                      { id: "original", label: "Original", desc: "No Crop" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAspectRatio(item.id)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          aspectRatio === item.id
                            ? "border-evoa bg-evoa/15 text-evoa font-bold"
                            : isDark
                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-[10px] opacity-60 mt-0.5">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── ROTATE PANEL ── */}
              {activeTab === "rotate" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">Rotate Video</h4>
                  <p className="text-xs opacity-70">
                    Orient phone recordings right-side up.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRotation((r) => (r + 270) % 360)}
                      className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <FaUndo size={14} /> Rotate Left 90°
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <FaRedo size={14} /> Rotate Right 90°
                    </button>
                  </div>
                  <p className="text-xs font-mono text-center opacity-60">
                    Current Angle: {rotation}°
                  </p>
                </div>
              )}

              {/* ── ADJUSTMENTS PANEL ── */}
              {activeTab === "adjust" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Basic Adjustments</h4>
                    <button
                      onClick={resetAdjustments}
                      className="text-xs text-evoa hover:underline"
                    >
                      Reset Adjustments
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Brightness</span>
                      <span className="font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                      className="w-full accent-evoa"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Contrast</span>
                      <span className="font-mono">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                      className="w-full accent-evoa"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Saturation</span>
                      <span className="font-mono">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                      className="w-full accent-evoa"
                    />
                  </div>
                </div>
              )}

              {/* ── FILTERS PANEL ── */}
              {activeTab === "filter" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm">Filter Presets</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {FILTER_PRESETS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          selectedFilter === f.id
                            ? "border-evoa bg-evoa/20 text-evoa font-bold"
                            : isDark
                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-xs font-semibold">{f.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TEXT OVERLAY PANEL ── */}
              {activeTab === "text" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Text Overlays</h4>
                    <button
                      onClick={() => addTextOverlay("New Pitch Headline")}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-evoa text-white font-semibold"
                    >
                      <FaPlus size={10} /> Add Text
                    </button>
                  </div>

                  {/* EVOA Quick Presets */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-semibold opacity-60 mb-1.5">
                      EVOA Pitch Presets
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {EVOA_TEXT_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          onClick={() => addTextOverlay(p.text)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-evoa/15 text-evoa hover:bg-evoa/25 transition-colors font-medium"
                        >
                          +{p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Text Inspector */}
                  {activeText ? (
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-evoa">Edit Text Layer</span>
                        <button
                          onClick={() => removeSelectedText(activeText.id)}
                          className="text-xs text-rose-400 hover:text-rose-300"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={activeText.text}
                        onChange={(e) => updateSelectedText("text", e.target.value)}
                        placeholder="Type text here..."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-black/40 border border-white/10 focus:outline-none focus:border-evoa"
                      />

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] opacity-60">Position</label>
                          <select
                            value={activeText.position}
                            onChange={(e) => updateSelectedText("position", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg text-xs bg-black/40 border border-white/10"
                          >
                            <option value="top">Top</option>
                            <option value="center">Center</option>
                            <option value="bottom">Bottom</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] opacity-60">Font Size</label>
                          <input
                            type="number"
                            min="12"
                            max="36"
                            value={activeText.fontSize || 18}
                            onChange={(e) => updateSelectedText("fontSize", parseInt(e.target.value, 10))}
                            className="w-full px-2 py-1.5 rounded-lg text-xs bg-black/40 border border-white/10"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] opacity-60">Style</label>
                          <button
                            onClick={() => updateSelectedText("isBold", !activeText.isBold)}
                            className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                              activeText.isBold ? "bg-evoa text-white" : "bg-white/10"
                            }`}
                          >
                            Bold {activeText.isBold ? "✓" : ""}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeText.hasBackground}
                            onChange={(e) => updateSelectedText("hasBackground", e.target.checked)}
                            className="accent-evoa"
                          />
                          Background Badge
                        </label>
                      </div>
                    </div>
                  ) : textOverlays.length > 0 ? (
                    <p className="text-xs opacity-60 italic">Click a text on the preview or select above to edit.</p>
                  ) : null}
                </div>
              )}

              {/* ── LOGO OVERLAY PANEL ── */}
              {activeTab === "logo" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Startup Logo Watermark</h4>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasLogo}
                        onChange={(e) => setHasLogo(e.target.checked)}
                        className="accent-evoa"
                      />
                      Enable Logo
                    </label>
                  </div>

                  {hasLogo && (
                    <div className="space-y-3 pt-1">
                      {/* Logo selector / uploader */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/10 p-1 flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0">
                          {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <FaFileImage size={20} className="opacity-40" />
                          )}
                        </div>
                        <div className="flex-1">
                          <button
                            onClick={() => logoInputRef.current?.click()}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20"
                          >
                            {logoUrl ? "Change Logo" : "Upload Logo"}
                          </button>
                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) setLogoUrl(URL.createObjectURL(f));
                            }}
                          />
                        </div>
                      </div>

                      {/* Position */}
                      <div>
                        <label className="text-xs opacity-70 block mb-1">Corner Position</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "top_left", label: "Top Left" },
                            { id: "top_right", label: "Top Right" },
                            { id: "bottom_left", label: "Bottom Left" },
                            { id: "bottom_right", label: "Bottom Right" },
                          ].map((pos) => (
                            <button
                              key={pos.id}
                              onClick={() => setLogoPosition(pos.id)}
                              className={`py-2 rounded-xl text-xs font-semibold border ${
                                logoPosition === pos.id
                                  ? "border-evoa bg-evoa/15 text-evoa"
                                  : "border-white/10 bg-white/5"
                              }`}
                            >
                              {pos.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Size */}
                      <div className="grid grid-cols-3 gap-2">
                        {["small", "medium", "large"].map((s) => (
                          <button
                            key={s}
                            onClick={() => setLogoSize(s)}
                            className={`py-1.5 rounded-xl text-xs capitalize ${
                              logoSize === s ? "bg-evoa text-white font-bold" : "bg-white/10"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── AUDIO PANEL ── */}
              {activeTab === "audio" && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm">Audio Controls</h4>
                  
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      {isMuted ? <IoVolumeMute size={20} className="text-rose-400" /> : <IoVolumeMedium size={20} className="text-evoa" />}
                      <span className="text-xs font-semibold">{isMuted ? "Audio Muted" : "Audio Active"}</span>
                    </div>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        isMuted ? "bg-rose-500 text-white" : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {isMuted ? "Unmute" : "Mute Audio"}
                    </button>
                  </div>

                  {!isMuted && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Volume Level</span>
                        <span className="font-mono">{volume}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                        className="w-full accent-evoa"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ── COVER / THUMBNAIL PANEL ── */}
              {activeTab === "cover" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm">Pitch Thumbnail Cover</h4>
                  <p className="text-xs opacity-70">
                    Capture the best frame or upload a custom pitch cover image.
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-28 rounded-xl bg-black border border-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] opacity-40 text-center px-1">No cover selected</span>
                      )}
                    </div>

                    <div className="space-y-2 flex-1">
                      <button
                        onClick={captureCurrentFrameAsCover}
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-evoa text-white hover:bg-[#00a098] shadow-md shadow-evoa/20"
                      >
                        Capture Current Frame
                      </button>
                      <button
                        onClick={() => thumbInputRef.current?.click()}
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20"
                      >
                        Upload Custom Cover
                      </button>
                      <input
                        ref={thumbInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCustomThumbnailChange}
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Error / Success feedback */}
            {errorMessage && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 mt-2">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 mt-2">
                {successMessage}
              </p>
            )}

            {/* ── Bottom Actions (Save / Cancel) ────────────────────────── */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleExport}
                disabled={isProcessing}
                className="flex-1 max-w-[220px] py-2.5 rounded-xl text-xs font-bold bg-evoa text-white hover:bg-[#00a098] shadow-lg shadow-evoa/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <FaSpinner className="animate-spin" size={13} />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheck size={12} />
                    Save Changes & Export
                  </>
                )}
              </button>
            </div>

            {/* Processing Progress Status */}
            {isProcessing && (
              <div className="mt-2 text-center">
                <p className="text-[11px] text-evoa animate-pulse font-medium">
                  {processProgress}
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
