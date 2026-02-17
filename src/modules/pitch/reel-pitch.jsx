import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaRegPaperPlane,
  FaBookmark,
  FaRegBookmark,
  FaVolumeUp,
  FaVolumeMute,
  FaArrowLeft
} from "react-icons/fa";
import reelsService from "../../services/reelsService";

export default function ReelPitch() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { id } = useParams();
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reelStates, setReelStates] = useState({});
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Fetch reels from backend
  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await reelsService.getFeed({
        type: 'for_you',
        cursor: nextCursor,
        limit: 20
      });

      const newReels = response.data.reels || [];
      setPitches(prev => nextCursor ? [...prev, ...newReels] : newReels);
      setNextCursor(response.data.nextCursor);
      setHasMore(response.data.hasMore);

      // Initialize reel states for new reels
      const initialState = {};
      newReels.forEach((reel) => {
        initialState[reel.id] = {
          isLiked: reel.isLiked || false,
          isSaved: reel.isSaved || false,
          isPlaying: false,
          isMuted: true
        };
      });
      setReelStates(prev => ({ ...prev, ...initialState }));
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reels:', err);
      setError('Failed to load reels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPitch = pitches[currentIndex] || null;

  // Handle scroll and play/pause videos
  useEffect(() => {
    const container = containerRef.current;
    if (!container || pitches.length === 0) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollTop / windowHeight);

      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < pitches.length) {
        setCurrentIndex(newIndex);

        // Track view for new reel
        const newReel = pitches[newIndex];
        if (newReel) {
          reelsService.trackView(newReel.id);
        }

        // Pause all videos
        Object.values(videoRefs.current).forEach((video) => {
          if (video) video.pause();
        });

        // Reset all states
        setReelStates((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((id) => {
            updated[id] = { ...updated[id], isPlaying: false };
          });
          return updated;
        });

        // Play current video
        const currentVideo = videoRefs.current[pitches[newIndex].id];
        if (currentVideo) {
          currentVideo.muted = reelStates[pitches[newIndex].id]?.isMuted ?? true;
          currentVideo.play().catch(() => { });
          setReelStates((prev) => ({
            ...prev,
            [pitches[newIndex].id]: {
              ...prev[pitches[newIndex].id],
              isPlaying: true
            }
          }));
        }
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, reelStates, pitches]);

  // Play first video on mount and track view
  useEffect(() => {
    if (pitches.length > 0 && videoRefs.current[pitches[0].id]) {
      const firstVideo = videoRefs.current[pitches[0].id];
      if (firstVideo && reelStates[pitches[0].id]) {
        firstVideo.muted = reelStates[pitches[0].id].isMuted;
        firstVideo.play().catch(() => { });
        setReelStates((prev) => ({
          ...prev,
          [pitches[0].id]: { ...prev[pitches[0].id], isPlaying: true }
        }));

        // Track view for first reel
        reelsService.trackView(pitches[0].id);
      }
    }
  }, [pitches.length]);

  const togglePlay = (pitchId) => {
    const video = videoRefs.current[pitchId];
    if (video) {
      const currentState = reelStates[pitchId];
      if (currentState.isPlaying) {
        video.pause();
        setReelStates((prev) => ({
          ...prev,
          [pitchId]: { ...prev[pitchId], isPlaying: false }
        }));
      } else {
        video.play();
        setReelStates((prev) => ({
          ...prev,
          [pitchId]: { ...prev[pitchId], isPlaying: true }
        }));
      }
    }
  };

  const toggleMute = (pitchId) => {
    const video = videoRefs.current[pitchId];
    if (video) {
      const newMuted = !reelStates[pitchId].isMuted;
      video.muted = newMuted;
      setReelStates((prev) => ({
        ...prev,
        [pitchId]: { ...prev[pitchId], isMuted: newMuted }
      }));
    }
  };

  const handleLike = async (pitchId) => {
    const currentState = reelStates[pitchId];
    const wasLiked = currentState?.isLiked;

    // Optimistic update
    setReelStates((prev) => ({
      ...prev,
      [pitchId]: { ...prev[pitchId], isLiked: !wasLiked }
    }));

    setPitches(prev => prev.map(p =>
      p.id === pitchId
        ? { ...p, likeCount: p.likeCount + (wasLiked ? -1 : 1) }
        : p
    ));

    try {
      if (wasLiked) {
        await reelsService.unlikeReel(pitchId);
      } else {
        await reelsService.likeReel(pitchId);
      }
    } catch (error) {
      // Revert on error
      console.error('Failed to like/unlike:', error);
      setReelStates((prev) => ({
        ...prev,
        [pitchId]: { ...prev[pitchId], isLiked: wasLiked }
      }));
      setPitches(prev => prev.map(p =>
        p.id === pitchId
          ? { ...p, likeCount: p.likeCount + (wasLiked ? 1 : -1) }
          : p
      ));
    }
  };

  const handleSave = async (pitchId) => {
    const currentState = reelStates[pitchId];
    const wasSaved = currentState?.isSaved;

    // Optimistic update
    setReelStates((prev) => ({
      ...prev,
      [pitchId]: { ...prev[pitchId], isSaved: !wasSaved }
    }));

    try {
      if (wasSaved) {
        await reelsService.unsaveReel(pitchId);
      } else {
        await reelsService.saveReel(pitchId);
      }
    } catch (error) {
      // Revert on error
      console.error('Failed to save/unsave:', error);
      setReelStates((prev) => ({
        ...prev,
        [pitchId]: { ...prev[pitchId], isSaved: wasSaved }
      }));
    }
  };

  const handleComment = (pitchId) => {
    // Navigate to comments or open comment modal
    console.log('Open comments', pitchId);
  };

  const handleShare = async (pitchId) => {
    try {
      await reelsService.shareReel(pitchId, 'other');
      setPitches(prev => prev.map(p =>
        p.id === pitchId
          ? { ...p, shareCount: (p.shareCount || 0) + 1 }
          : p
      ));
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleSupport = (pitchId) => {
    // Navigate to support page
    navigate(`/support/${pitchId}`);
  };

  const renderReel = (pitch, index) => {
    const state = reelStates[pitch.id] || { isLiked: false, isSaved: false, isPlaying: false, isMuted: true };

    return (
      <div key={pitch.id} className="w-full h-screen flex-shrink-0 relative overflow-hidden">
        {/* Video/Image Container */}
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
          <video
            ref={(el) => (videoRefs.current[pitch.id] = el)}
            src={pitch.video}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={state.isMuted}
            onClick={() => togglePlay(pitch.id)}
            onPlay={() => setReelStates((prev) => ({
              ...prev,
              [pitch.id]: { ...prev[pitch.id], isPlaying: true }
            }))}
            onPause={() => setReelStates((prev) => ({
              ...prev,
              [pitch.id]: { ...prev[pitch.id], isPlaying: false }
            }))}
          />

          {/* Category Tag - Top Left */}
          <div className="absolute top-11 sm:top-14 md:top-16 left-2 sm:left-3 md:left-4 z-10">
            <div className={`px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-full text-[9px] sm:text-[10px] md:text-xs font-semibold ${isDark
              ? 'bg-black/60 backdrop-blur-sm text-white border border-white/20'
              : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200'
              }`}>
              {pitch.category}
            </div>
          </div>

          {/* Volume Icon - Top Right */}
          <button
            onClick={() => toggleMute(pitch.id)}
            className={`absolute top-11 sm:top-14 md:top-16 right-2 sm:right-3 md:right-4 z-10 p-1.5 sm:p-1.5 md:p-2 rounded-full transition-all active:scale-95 ${isDark
              ? 'bg-black/60 backdrop-blur-sm text-white hover:bg-black/80'
              : 'bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white'
              }`}
          >
            {state.isMuted ? (
              <>
                <FaVolumeMute size={14} className="sm:hidden" />
                <FaVolumeMute size={16} className="hidden sm:block" />
              </>
            ) : (
              <>
                <FaVolumeUp size={14} className="sm:hidden" />
                <FaVolumeUp size={16} className="hidden sm:block" />
              </>
            )}
          </button>

          {/* Play/Pause Overlay */}
          {!state.isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
              onClick={() => togglePlay(pitch.id)}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <div className="w-0 h-0 border-l-[10px] sm:border-l-[12px] border-l-gray-900 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent ml-0.5 sm:ml-1"></div>
              </div>
            </div>
          )}

          {/* Right Side - User Info & Interaction Buttons */}
          <div className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2 sm:gap-3 md:gap-6 max-h-[90vh] overflow-hidden">
            {/* User Avatar */}
            <div className="relative">
              <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden ring-2 ring-purple-500">
                <img
                  src={pitch.profilePhoto}
                  alt={pitch.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Like Button */}
            <button
              onClick={() => handleLike(pitch.id)}
              className="flex flex-col items-center gap-0.5 sm:gap-1 active:scale-95 transition-transform"
            >
              {state.isLiked ? (
                <>
                  <FaHeart size={20} className="sm:hidden text-red-500" />
                  <FaHeart size={24} className="hidden sm:block md:hidden text-red-500" />
                  <FaHeart size={28} className="hidden md:block text-red-500" />
                </>
              ) : (
                <>
                  <FaRegHeart size={20} className="sm:hidden text-white drop-shadow-lg" />
                  <FaRegHeart size={24} className="hidden sm:block md:hidden text-white drop-shadow-lg" />
                  <FaRegHeart size={28} className="hidden md:block text-white drop-shadow-lg" />
                </>
              )}
              <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-white drop-shadow-md">{(pitch.likeCount || 0).toLocaleString()}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => handleComment(pitch.id)}
              className="flex flex-col items-center gap-0.5 sm:gap-1 active:scale-95 transition-transform"
            >
              <FaRegComment size={20} className="sm:hidden text-white drop-shadow-lg" />
              <FaRegComment size={24} className="hidden sm:block md:hidden text-white drop-shadow-lg" />
              <FaRegComment size={28} className="hidden md:block text-white drop-shadow-lg" />
              <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-white drop-shadow-md">{pitch.commentCount || 0}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={() => handleShare(pitch.id)}
              className="flex flex-col items-center gap-0.5 sm:gap-1 active:scale-95 transition-transform"
            >
              <FaRegPaperPlane size={20} className="sm:hidden text-white drop-shadow-lg" />
              <FaRegPaperPlane size={24} className="hidden sm:block md:hidden text-white drop-shadow-lg" />
              <FaRegPaperPlane size={28} className="hidden md:block text-white drop-shadow-lg" />
              <span className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-white drop-shadow-md">{pitch.shareCount || 0}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => handleSave(pitch.id)}
              className="flex flex-col items-center gap-0.5 sm:gap-1 active:scale-95 transition-transform"
            >
              {state.isSaved ? (
                <>
                  <FaBookmark size={20} className="sm:hidden text-amber-400" />
                  <FaBookmark size={24} className="hidden sm:block md:hidden text-amber-400" />
                  <FaBookmark size={28} className="hidden md:block text-amber-400" />
                </>
              ) : (
                <>
                  <FaRegBookmark size={20} className="sm:hidden text-white drop-shadow-lg" />
                  <FaRegBookmark size={24} className="hidden sm:block md:hidden text-white drop-shadow-lg" />
                  <FaRegBookmark size={28} className="hidden md:block text-white drop-shadow-lg" />
                </>
              )}
            </button>
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none max-w-full overflow-hidden">
            {/* Gradient Overlay */}
            <div className={`h-40 sm:h-52 md:h-64 bg-gradient-to-t pointer-events-none ${isDark ? 'from-black via-black/85 to-transparent' : 'from-white via-white/85 to-transparent'
              }`}></div>

            {/* Content */}
            <div className={`absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 md:p-5 pointer-events-auto max-w-full overflow-hidden ${isDark ? 'text-white' : 'text-black'}`}>
              {/* User Info */}
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2 md:mb-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-purple-500 flex-shrink-0">
                  <img
                    src={pitch.profilePhoto}
                    alt={pitch.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 pr-1 sm:pr-2 overflow-hidden">
                  <h3 className="font-bold text-[10px] sm:text-xs md:text-base truncate">{pitch.name}</h3>
                  <p className="text-[9px] sm:text-[10px] md:text-sm opacity-80 truncate">{pitch.hashtag}</p>
                </div>
              </div>

              {/* Support Button */}
              <button
                onClick={() => handleSupport(pitch.id)}
                className={`w-full py-2 sm:py-2 md:py-3 rounded-lg text-[10px] sm:text-xs md:text-base font-semibold mb-2 sm:mb-2.5 md:mb-4 transition-all active:scale-95 ${isDark
                  ? 'bg-gray-800 text-white hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
              >
                Support this startup
              </button>

              {/* Financial Details */}
              <div className="flex gap-1.5 sm:gap-2 md:gap-3 mb-1.5 sm:mb-2 md:mb-3">
                <div className={`flex-1 px-2 sm:px-2.5 md:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg transition-all min-w-0 ${isDark
                  ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black hover:shadow-[0_0_20px_rgba(176,255,250,0.5)]'
                  : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white hover:shadow-[0_0_20px_rgba(0,184,169,0.4)]'
                  }`}>
                  <p className="text-[8px] sm:text-[9px] md:text-xs opacity-90 mb-0.5 sm:mb-1">Ask</p>
                  <p className="font-bold text-[9px] sm:text-[10px] md:text-sm leading-tight break-words">{pitch.dealInfo.ask} for {pitch.dealInfo.equity}</p>
                </div>
                <div className={`flex-1 px-2 sm:px-2.5 md:px-4 py-1.5 sm:py-2 md:py-3 rounded-lg transition-all min-w-0 ${isDark
                  ? 'bg-gradient-to-r from-[#80E5FF] to-[#B0FFFA] text-black hover:shadow-[0_0_20px_rgba(128,229,255,0.5)]'
                  : 'bg-gradient-to-r from-[#008C81] to-[#00B8A9] text-white hover:shadow-[0_0_20px_rgba(0,140,129,0.4)]'
                  }`}>
                  <p className="text-[8px] sm:text-[9px] md:text-xs opacity-90 mb-0.5 sm:mb-1">Revenue</p>
                  <p className="font-bold text-[9px] sm:text-[10px] md:text-sm leading-tight break-words">{pitch.dealInfo.revenue} Revenue</p>
                </div>
              </div>

              {/* Team Info */}
              <p className={`text-[9px] sm:text-[10px] md:text-sm mb-1 sm:mb-1.5 md:mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                Team of {pitch.teamSize}
              </p>

              {/* Description */}
              <p className={`text-[9px] sm:text-[10px] md:text-sm line-clamp-2 ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
                {pitch.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 ${isDark ? 'bg-black' : 'bg-gray-100'} overflow-hidden`}>
      {/* Container with max-width for larger screens */}
      <div className="w-full h-full max-w-md mx-auto relative shadow-2xl overflow-hidden max-h-screen">
        {/* Header - Fixed */}
        <div className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 ${isDark ? 'bg-gradient-to-b from-black/80 to-transparent' : 'bg-gradient-to-b from-white/80 to-transparent'
          }`}>
          <button
            onClick={() => navigate(-1)}
            className={`p-1.5 sm:p-2 rounded-full transition-all flex-shrink-0 ${isDark ? 'bg-black/50 text-white hover:bg-black/70' : 'bg-white/50 text-black hover:bg-white/70'
              }`}
          >
            <FaArrowLeft size={16} className="sm:hidden" />
            <FaArrowLeft size={18} className="hidden sm:block" />
          </button>
          <h1 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-black'}`}>
            Pitch Reels
          </h1>
          <div className="w-8 sm:w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Loading State */}
        {loading && pitches.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && pitches.length === 0 && (
          <div className="flex items-center justify-center h-full p-4">
            <div className={`text-center ${isDark ? 'text-white' : 'text-black'}`}>
              <p className="mb-4">{error}</p>
              <button
                onClick={fetchReels}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Reels Container */}
        {!loading && !error && pitches.length > 0 && (
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide max-h-screen"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {pitches.map((pitch, index) => (
              <div key={pitch.id} className="snap-start">
                {renderReel(pitch, index)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
