import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { IoArrowBack, IoSparkles, IoCloudUpload, IoVideocam } from "react-icons/io5";
import { FaSpinner, FaRocket } from "react-icons/fa";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import PitchVideoEditor from "../../components/shared/PitchVideoEditor/PitchVideoEditor";
import reelsService from "../../services/reelsService";

export default function PitchVideoEditorPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [searchParams] = useSearchParams();
  const reelId = searchParams.get("reelId");

  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [myReels, setMyReels] = useState([]);
  const [loadingReels, setLoadingReels] = useState(true);
  const [targetReelId, setTargetReelId] = useState(reelId || null);

  useEffect(() => {
    if (userRole !== "startup" && userRole !== "admin") {
      navigate("/");
      return;
    }

    reelsService.getMyReels()
      .then((res) => {
        const list = res?.data?.data || res?.data || [];
        setMyReels(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoadingReels(false));

    if (reelId) {
      setTargetReelId(reelId);
      setIsEditorOpen(true);
    }
  }, [userRole, reelId, navigate]);

  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        setErrorMsg("Video size must be under 200 MB.");
        e.target.value = "";
        return;
      }
      setErrorMsg("");
      setSelectedFile(file);
      setTargetReelId(null);
      setIsEditorOpen(true);
      e.target.value = "";
    }
  };

  const handleEditExisting = (id) => {
    setTargetReelId(id);
    setSelectedFile(null);
    setIsEditorOpen(true);
  };

  return (
    <AppShell>
      <AppHeader title="Pitch Video Editor" />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Banner */}
        <div
          className={`p-6 rounded-3xl mb-8 border transition-all ${
            isDark
              ? "bg-gradient-to-br from-gray-950 via-gray-900 to-black border-white/10"
              : "bg-gradient-to-br from-teal-50 via-white to-teal-50 border-teal-100 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-evoa/20 text-evoa flex items-center justify-center flex-shrink-0">
              <IoSparkles size={28} />
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                In-App Pitch Video Editor
              </h1>
              <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/60" : "text-gray-600"}`}>
                Trim, crop (9:16 / 1:1 / 16:9), rotate, adjust lighting, add EVOA text overlays, brand watermark & thumbnail covers before publishing to investors.
              </p>
            </div>
          </div>
        </div>

        {/* Upload New Pitch Card */}
        <div className="mb-8">
          <h2 className={`text-base font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            Upload & Edit New Video
          </h2>
          <label
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed cursor-pointer transition-all ${
              isDark
                ? "border-white/20 hover:border-evoa bg-white/5 hover:bg-white/10"
                : "border-gray-300 hover:border-evoa bg-white hover:bg-teal-50/50 shadow-sm"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-evoa/15 text-evoa flex items-center justify-center mb-3">
              <IoCloudUpload size={32} />
            </div>
            <p className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
              Select a video from your device
            </p>
            <p className={`text-xs mt-1 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              Supports MP4, MOV, WebM (up to 200MB &bull; auto-compressed if &gt; 50MB)
            </p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          {errorMsg && (
            <p className="text-red-400 text-xs mt-2 px-1 font-medium">{errorMsg}</p>
          )}
        </div>

        {/* Existing Pitches Section */}
        <div>
          <h2 className={`text-base font-bold mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
            Or Edit Existing Published Pitches
          </h2>

          {loadingReels ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="animate-spin text-evoa" size={24} />
            </div>
          ) : myReels.length === 0 ? (
            <div className={`p-8 rounded-2xl text-center border ${isDark ? "bg-white/5 border-white/10 text-white/50" : "bg-white border-gray-200 text-gray-500"}`}>
              <IoVideocam size={36} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">You haven't uploaded any pitch reels yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myReels.map((reel) => (
                <div
                  key={reel.id}
                  className={`rounded-2xl overflow-hidden border transition-all hover:scale-[1.01] ${
                    isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="relative aspect-video bg-black">
                    {reel.thumbnailUrl ? (
                      <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" />
                    ) : (
                      <video src={reel.videoUrl} className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-white">
                      {reel.duration ? `${reel.duration}s` : "Pitch"}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <h3 className={`font-bold text-sm truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                      {reel.title || "Pitch Reel"}
                    </h3>
                    <p className={`text-xs mt-0.5 truncate ${isDark ? "text-white/50" : "text-gray-500"}`}>
                      {reel.description || "No description"}
                    </p>
                    <button
                      onClick={() => handleEditExisting(reel.id)}
                      className="mt-3 w-full py-2 rounded-xl text-xs font-bold bg-evoa/15 text-evoa hover:bg-evoa hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <IoSparkles size={13} /> Edit in Video Editor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* In-App Video Editor Modal */}
      <PitchVideoEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedFile(null);
          setTargetReelId(null);
        }}
        videoFile={selectedFile}
        targetReelId={targetReelId}
        onSaved={() => {
          setIsEditorOpen(false);
          // Refresh my reels
          reelsService.getMyReels().then((res) => {
            const list = res?.data?.data || res?.data || [];
            setMyReels(Array.isArray(list) ? list : []);
          });
        }}
      />
    </AppShell>
  );
}
