import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import StatusComponent from "../../components/shared/StatusComponent";
import PitchCard from "../../components/shared/PitchCard";
import {
  FaBell,
  FaSearch,
  FaUser,
  FaPlay,
  FaRegNewspaper
} from "react-icons/fa";
import EmptyState from "../../components/shared/EmptyState";
import { HiSun, HiMoon } from "react-icons/hi"; // Theme toggle icons
import logo from "../../assets/logo.avif";
import reelsService from "../../services/reelsService";
import { getStartupDetails, followStartup, unfollowStartup } from "../../services/startupsService";
import { getNotifications } from "../../services/notificationsService";



export default function Investor() {
  const { theme, toggleTheme } = useTheme(); // Added toggleTheme
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchFeed();
    fetchUnreadCount();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const { data, error } = await reelsService.getFeed('foryou', cursor);
      if (error) throw error;

      const feedData = data?.reels || data || [];
      const nextCursor = data?.nextCursor || null;

      const mappedPitches = feedData.map(reel => ({
        id: reel.id,
        startupId: reel.startupId,
        isFollowing: reel.isFollowing,
        username: reel.startup?.name || 'Unknown',
        profilePhoto: reel.startup?.logoUrl || null,
        summary: reel.title,
        image: reel.thumbnailUrl,
        video: reel.videoUrl,
        caption: reel.description,
        hashtags: reel.hashtags ? reel.hashtags.join(' ') : '',
        likes: reel.likeCount,
        views: reel.viewCount,
        clickthroughs: 0,
        liked: reel.isLiked,
        saved: reel.isSaved,
        dealInfo: reel.startup?.dealInfo || null,
        links: {
          website: reel.startup?.website,
          linkedin: reel.startup?.linkedin,
          instagram: reel.startup?.instagram
        },
        pitchDeck: reel.startup?.pitchDeckUrl,
        investors: []
      }));

      if (!cursor) {
        setPitches(mappedPitches);
      } else {
        setPitches(prev => [...prev, ...mappedPitches]);
      }
      setCursor(nextCursor);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getNotifications();
      const data = res?.data?.data || res?.data || [];
      const notifications = Array.isArray(data) ? data : [];
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    } catch (err) {
      // Non-critical
    }
  };

  const handleFollow = async (startupId) => {
    // Optimistic update
    const newPitches = pitches.map(p => {
      if (p.startupId === startupId) {
        return { ...p, isFollowing: !p.isFollowing };
      }
      return p;
    });
    setPitches(newPitches);

    // Find current state from first matching pitch
    const pitch = pitches.find(p => p.startupId === startupId);
    if (!pitch) return;
    const isFollowing = pitch.isFollowing;

    try {
      if (isFollowing) {
        await unfollowStartup(startupId);
      } else {
        await followStartup(startupId);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      setPitches(pitches); // Revert
    }
  };


  const handleLike = async (pitchId) => {
    // Optimistic update
    const pitchIndex = pitches.findIndex(p => p.id === pitchId);
    if (pitchIndex === -1) return;

    const pitch = pitches[pitchIndex];
    const isLiked = pitch.liked;

    const newPitches = [...pitches];
    newPitches[pitchIndex] = {
      ...pitch,
      liked: !isLiked,
      likes: isLiked ? Number(pitch.likes) - 1 : Number(pitch.likes) + 1
    };
    setPitches(newPitches);

    try {
      if (isLiked) {
        await reelsService.unlikeReel(pitchId);
      } else {
        await reelsService.likeReel(pitchId);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert
      setPitches(pitches);
    }
  };

  const handleSave = async (pitchId) => {
    // Optimistic update
    const pitchIndex = pitches.findIndex(p => p.id === pitchId);
    if (pitchIndex === -1) return;

    const pitch = pitches[pitchIndex];
    const isSaved = pitch.saved;

    const newPitches = [...pitches];
    newPitches[pitchIndex] = {
      ...pitch,
      saved: !isSaved
    };
    setPitches(newPitches);

    try {
      if (isSaved) {
        await reelsService.unsaveReel(pitchId);
      } else {
        await reelsService.saveReel(pitchId);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
      setPitches(pitches);
    }
  };

  const handleComment = (pitchId) => {
    navigate(`/reels/${pitchId}/comments`); // Updated route to match likely structure
  };

  const handleShare = (pitchId) => {
    // navigate(`/share/${pitchId}`);
    reelsService.shareReel(pitchId).catch(console.error);
  };


  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-[#f7f9fa]'}`}>
      {/* Top Navigation Bar - Enhanced with Theme Toggle */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${isDark
        ? 'bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/98 to-[#0a0a0a]/95 backdrop-blur-2xl border-b border-white/[0.08]'
        : 'bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-2xl border-b border-gray-200/60'
        } shadow-sm`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-3xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="EVO-A" className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-xl" />
            <span className={`text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r ${isDark
              ? 'from-white via-[#00B8A9] to-[#00A89A] text-transparent bg-clip-text'
              : 'from-gray-900 via-[#00B8A9] to-[#00A89A] text-transparent bg-clip-text'
              }`}>EVO-A</span>
          </div>

          {/* Navigation Icons - Mobile Responsive with Theme Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Pitch Button */}
            <button
              onClick={() => {
                const firstPitch = pitches[0];
                if (firstPitch?.id) {
                  navigate(`/pitch/${firstPitch.id}`);
                } else {
                  navigate('/explore');
                }
              }}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${isDark
                ? 'text-white/70 hover:text-[#00B8A9] hover:bg-white/10'
                : 'text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100'
                }`}
              title="View Pitch"
            >
              <FaPlay size={18} className="sm:hidden" />
              <FaPlay size={20} className="hidden sm:block" />
            </button>

            {/* Search Button */}
            <button
              onClick={() => navigate('/explore')}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${isDark
                ? 'text-white/70 hover:text-[#00B8A9] hover:bg-white/10'
                : 'text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100'
                }`}
              title="Search"
            >
              <FaSearch size={18} className="sm:hidden" />
              <FaSearch size={20} className="hidden sm:block" />
            </button>

            {/* Theme Toggle Button - NEW */}
            <button
              onClick={toggleTheme}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 hover:scale-110 ${isDark
                ? 'text-white/70 hover:text-[#B0FFFA] hover:bg-white/10 border border-[#B0FFFA]/20'
                : 'text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100 border border-[#00B8A9]/20'
                }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <HiSun size={20} className="sm:hidden animate-spin-slow" />
                  <HiSun size={22} className="hidden sm:block animate-spin-slow" />
                </>
              ) : (
                <>
                  <HiMoon size={20} className="sm:hidden" />
                  <HiMoon size={22} className="hidden sm:block" />
                </>
              )}
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => navigate('/notifications')}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 relative active:scale-95 ${isDark
                ? 'text-white/70 hover:text-[#00B8A9] hover:bg-white/10'
                : 'text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100'
                }`}
              title="Notifications"
            >
              <FaBell size={18} className="sm:hidden" />
              <FaBell size={20} className="hidden sm:block" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-current" />
              )}
            </button>

            {/* Profile Button */}
            <button
              onClick={() => navigate('/profile')}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${isDark
                ? 'text-white/70 hover:text-[#00B8A9] hover:bg-white/10'
                : 'text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100'
                }`}
              title="Profile"
            >
              <FaUser size={18} className="sm:hidden" />
              <FaUser size={20} className="hidden sm:block" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 md:pt-24">
        <div className="max-w-3xl mx-auto px-0 sm:px-4 pb-16 sm:pb-20">
          {/* Status Component */}
          <div className="mb-4 px-2 sm:px-0">
            <StatusComponent />
          </div>

          {/* Pitch Cards */}
          <div className="space-y-4 px-2 sm:px-0">
            {!loading && pitches.length === 0 && (
              <EmptyState
                icon={FaRegNewspaper}
                title="No Pitches Yet"
                description="Your feed is currently empty. Follow some startups to see their pitches here."
                actionLabel="Find Startups"
                onAction={() => navigate('/explore')}
              />
            )}
            {pitches.map((pitch) => (
              <PitchCard
                key={pitch.id}
                pitch={pitch}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onSave={handleSave}
                onFollow={handleFollow}
              />
            ))}
          </div>
        </div>
      </main>


    </div>
  );
}
