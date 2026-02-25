import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaPlus } from "react-icons/fa";
import StoryUploadModal from "./StoryUploadModal";
import StoryViewer from "./StoryViewer";
import storiesService from "../../services/storiesService";

/** Generate a base64 SVG avatar from initials */
const makeAvatar = (name = "U", bg = "#00B8A9") => {
  const text = (name || "U").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='${bg}'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='sans-serif'>${text}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Instagram-style stories bar.
 * - First bubble: current user's avatar with a "+" to upload a story.
 * - Subsequent bubbles: other users' real uploaded and non-expired stories.
 * - Tapping a story bubble opens the full-screen StoryViewer.
 */
export default function StatusComponent() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === "dark";

  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchStories = useCallback(async () => {
    try {
      const res = await storiesService.getActiveStories();
      const raw = res?.data?.data || res?.data || [];
      // Group by userId — keep only the most recent story per user
      const byUser = {};
      (Array.isArray(raw) ? raw : []).forEach((s) => {
        if (!byUser[s.userId]) byUser[s.userId] = s;
      });
      setStories(Object.values(byUser));
    } catch (_) {
      setStories([]);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const userAvatarFallback = makeAvatar(user?.fullName || user?.email || "Me", "#00B8A9");
  const userAvatar = user?.avatarUrl || userAvatarFallback;
  const firstName = user?.fullName?.split(" ")[0] || "You";

  // Separate own story from others
  const myStory = stories.find((s) => s.userId === user?.id);
  const othersStories = stories.filter((s) => s.userId !== user?.id);

  // All viewable stories (own first if it exists, then others)
  const viewableStories = [
    ...(myStory ? [myStory] : []),
    ...othersStories,
  ];

  const openViewer = (story) => {
    const idx = viewableStories.findIndex((s) => s.id === story.id);
    setViewerIndex(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  };

  return (
    <>
      <div
        className={`flex gap-3.5 overflow-x-auto pb-2 px-3 scrollbar-hide ${isDark ? "bg-black" : "bg-white"
          }`}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* ── Own avatar bubble ── */}
        <button
          onClick={() =>
            myStory ? openViewer(myStory) : setShowModal(true)
          }
          className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
          title={myStory ? "View your story" : "Add your story"}
        >
          <div className="relative">
            <div
              className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${myStory
                ? "p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                : isDark
                  ? "border-2 border-dashed border-white/30"
                  : "border-2 border-dashed border-gray-300"
                }`}
            >
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${myStory ? (isDark ? "p-[2px] bg-black" : "p-[2px] bg-white") : ""
                  }`}
              >
                <img
                  src={myStory?.user?.avatarUrl || userAvatar}
                  alt="Your story"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = userAvatarFallback; }}
                />
              </div>
            </div>
            {/* + badge always visible so user can add another story */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
              className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md bg-[#00B8A9]"
              title="Add story"
            >
              <FaPlus size={9} />
            </button>
          </div>
          <span
            className={`text-[10px] max-w-[58px] truncate ${isDark ? "text-white/60" : "text-gray-500"
              }`}
          >
            {firstName}
          </span>
        </button>

        {/* ── Others' story bubbles ── */}
        {othersStories.map((story) => {
          const name =
            story.user?.fullName?.split(" ")[0] ||
            story.user?.email?.split("@")[0] ||
            "User";
          const avatarFallback = makeAvatar(story.user?.fullName || "U", "#6366f1");
          const avatar = story.user?.avatarUrl || avatarFallback;

          return (
            <button
              key={story.id}
              onClick={() => openViewer(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
              title={name}
            >
              <div className="w-[60px] h-[60px] rounded-full p-[2.5px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                <div
                  className={`w-full h-full rounded-full p-[2px] ${isDark ? "bg-black" : "bg-white"
                    }`}
                >
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = avatarFallback; }}
                  />
                </div>
              </div>
              <span
                className={`text-[10px] max-w-[58px] truncate ${isDark ? "text-white/70" : "text-gray-700"
                  }`}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Upload Modal ── */}
      <StoryUploadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUploaded={fetchStories}
      />

      {/* ── Full-screen Story Viewer ── */}
      {viewerOpen && viewableStories.length > 0 && (
        <StoryViewer
          stories={viewableStories}
          startIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
