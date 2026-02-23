import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaHeart,
  FaBookmark,
  FaEllipsisH,
  FaRegHeart,
  FaRegBookmark,
  FaRegComment,
  FaShare,
  FaPlay,
  FaPause,
  FaBell,
  FaSearch,
  FaChartLine,
  FaUserPlus,
  FaGlobeAmericas,
  FaUser,
  FaRegNewspaper,
  FaPlus,
  FaTimes,
  FaVideo,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import EmptyState from "../../components/shared/EmptyState";
import { HiSun, HiMoon } from "react-icons/hi";
import { MdVerified } from "react-icons/md";
import logo from "../../assets/logo.avif";
import reelsService from "../../services/reelsService";
import storageService from "../../services/storageService";
import { getNotifications } from "../../services/notificationsService";
import { publishPitchReel } from "../../services/startupsService";

export default function Startup() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [publishStatus, setPublishStatus] = useState(null);
  const videoRefs = useRef({});

  // Upload reel modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadVideo, setUploadVideo] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadHashtags, setUploadHashtags] = useState('');
  const [uploadState, setUploadState] = useState('idle'); // idle | uploading | success | error
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFeed();
    fetchUnreadCount();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await reelsService.getFeed('for_you', cursor);
      // apiClient returns { error, status, data }
      const raw = res?.data;
      const reelsArr = raw?.reels || (Array.isArray(raw) ? raw : []);
      const nextCursor = raw?.nextCursor || null;
      const more = raw?.hasMore ?? false;

      // Normalize API reel shape to what this component renders
      const feedData = reelsArr.map(reel => ({
        id: reel.id,
        type: 'reel',
        displayName: reel.startup?.name || 'Unknown Startup',
        username: reel.startup?.username || reel.startup?.name || 'startup',
        userAvatar: reel.startup?.logoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.startup?.name || 'S')}&background=00B8A9&color=fff`,
        isVerified: false,
        timeAgo: reel.createdAt
          ? new Date(reel.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : '',
        caption: reel.description || reel.title || '',
        tags: Array.isArray(reel.hashtags)
          ? reel.hashtags.map(h => `#${h}`)
          : [],
        video: reel.videoUrl,
        image: null,
        likeCount: reel.likeCount || 0,
        commentCount: reel.commentCount || 0,
        shares: reel.shareCount || 0,
        views: reel.viewCount || 0,
        isLiked: reel.isLiked || false,
        isSaved: reel.isSaved || false,
        isSupporting: false,
        isPlaying: false,
      }));

      if (!cursor) {
        setPosts(feedData);
      } else {
        setPosts(prev => [...prev, ...feedData]);
      }
      setCursor(nextCursor);
      setHasMore(more);
    } catch (err) {
      console.error('Error fetching feed:', err);
      if (!cursor) setError('Failed to load feed');
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
      // Non-critical — silently fail
    }
  };

  const toggleLike = async (postId) => {
    // Optimistic update
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const isLiked = post.isLiked; // Assuming backend returns isLiked

    // Update local state immediately
    const newPosts = [...posts];
    newPosts[postIndex] = {
      ...post,
      isLiked: !isLiked,
      likeCount: isLiked ? Number(post.likeCount) - 1 : Number(post.likeCount) + 1
    };
    setPosts(newPosts);

    try {
      if (isLiked) {
        await reelsService.unlikeReel(postId);
      } else {
        await reelsService.likeReel(postId);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      // Revert on error
      setPosts(posts);
    }
  };

  const toggleSave = async (postId) => {
    // Optimistic update
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const isSaved = post.isSaved;

    const newPosts = [...posts];
    newPosts[postIndex] = {
      ...post,
      isSaved: !isSaved
    };
    setPosts(newPosts);

    try {
      if (isSaved) {
        await reelsService.unsaveReel(postId);
      } else {
        await reelsService.saveReel(postId);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
      setPosts(posts);
    }
  };

  const toggleSupport = (postId) => {
    // TODO: Implement follow/support logic
    console.log('Toggle support for', postId);
  };

  const toggleVideoPlay = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      if (video.paused) {
        video.play().catch(e => console.error("Play error:", e));
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, isPlaying: true } : { ...post, isPlaying: false }
        ));

        // Track view when played
        reelsService.trackView(postId).catch(e => console.error("Track view error", e));
      } else {
        video.pause();
        setPosts(posts.map(post =>
          post.id === postId ? { ...post, isPlaying: false } : post
        ));
      }
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handlePublishPitch = async () => {
    setPublishStatus('loading');
    try {
      await publishPitchReel();
      setPublishStatus('success');
      setTimeout(() => setPublishStatus(null), 3000);
    } catch (err) {
      console.error('Failed to publish pitch:', err);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus(null), 4000);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadVideo(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadState('idle');
    setUploadError('');
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadVideo(null);
    setUploadPreview(null);
    setUploadDesc('');
    setUploadHashtags('');
    setUploadState('idle');
    setUploadError('');
  };

  const handleUploadReel = async () => {
    if (!uploadVideo) { setUploadError('Please select a video file.'); return; }
    setUploadState('uploading');
    setUploadError('');
    try {
      // Upload video to Supabase storage
      let videoUrl = null;
      try {
        videoUrl = await storageService.uploadFile(uploadVideo, 'evoa-media', `reels/${Date.now()}_${uploadVideo.name}`);
      } catch {
        videoUrl = await storageService.uploadFile(uploadVideo, 'public', `reels/${Date.now()}_${uploadVideo.name}`);
      }
      if (!videoUrl) throw new Error('Upload returned no URL');

      // Publish as reel
      const hashtags = uploadHashtags
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(t => t.replace(/^#/, ''));

      await reelsService.createReel({
        videoUrl,
        title: uploadDesc || 'Pitch Reel',
        description: uploadDesc,
        hashtags,
      });

      setUploadState('success');
      setTimeout(() => { closeUploadModal(); fetchFeed(); }, 2000);
    } catch (err) {
      console.error('Upload reel failed:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
      setUploadState('error');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#000000]' : 'bg-[#f7f9fa]'
      }`}>
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

          {/* Navigation Icons - Mobile Responsive */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Pitch Button */}
            <button
              onClick={() => navigate('/pitch/hashtag')}
              className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${isDark
                ? 'text-white/70 hover:text-[#00B8A9] hover:bg-white/10'
                : 'text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100'
                }`}
              title="View Pitch Reels"
            >
              <FaPlay size={18} className="sm:hidden" />
              <FaPlay size={20} className="hidden sm:block" />
            </button>

            {/* ➕ Add Pitch Reel */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white shadow-lg shadow-[#00B8A9]/30 hover:shadow-[#00B8A9]/50 hover:scale-105 transition-all duration-200 active:scale-95"
              title="Add Pitch Reel"
            >
              <FaPlus size={18} className="sm:hidden" />
              <FaPlus size={20} className="hidden sm:block" />
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
              onClick={() => navigate('/startup/profile')}
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
        <div className="max-w-3xl mx-auto px-0 sm:px-4 pb-16 sm:pb-20 overflow-x-hidden">
          {/* Feed Posts - Enhanced Cards */}
          <div className="space-y-0 sm:space-y-4">
            {!loading && posts.length === 0 && (
              <EmptyState
                icon={FaRegNewspaper}
                title="No Posts Yet"
                description="Your feed is currently empty. Start following people to see their posts here."
                actionLabel="Explore"
                onAction={() => navigate('/explore')}
              />
            )}
            {posts.map((post) => (
              <article
                key={post.id}
                className={`overflow-hidden transition-all duration-300 ${isDark
                  ? 'bg-[#000000] sm:bg-[#0a0a0a] border-y sm:border sm:rounded-2xl border-white/[0.08]'
                  : 'bg-white border-y sm:border sm:rounded-2xl border-gray-200/80'
                  } sm:shadow-lg sm:hover:shadow-xl`}
              >
                {/* Post Header */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full overflow-hidden ring-2 ${post.type === "reel"
                        ? 'ring-gradient-to-tr from-purple-500 to-pink-500'
                        : isDark ? 'ring-white/10' : 'ring-gray-200'
                        }`}>
                        <img
                          src={post.userAvatar}
                          alt={post.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {post.type === "reel" && (
                        <div className="hidden sm:flex absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full items-center justify-center">
                          <FaPlay size={10} className="text-white ml-0.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className={`font-bold text-xs sm:text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                          {post.displayName}
                        </span>
                        {post.isVerified && (
                          <MdVerified className="text-[#00B8A9] flex-shrink-0" size={14} />
                        )}
                      </div>
                      <div className={`flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs ${isDark ? 'text-white/50' : 'text-gray-500'
                        }`}>
                        <span className="truncate">@{post.username}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{post.timeAgo}</span>
                        <span className="sm:hidden">{post.timeAgo}</span>
                        <FaGlobeAmericas size={9} className="ml-0.5 hidden sm:block" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {!post.isSupporting && (
                      <button
                        onClick={() => toggleSupport(post.id)}
                        className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all duration-200 flex items-center gap-1 sm:gap-1.5 bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-105 active:scale-95"
                      >
                        <FaUserPlus size={10} className="sm:hidden" />
                        <FaUserPlus size={12} className="hidden sm:block" />
                        <span className="hidden sm:inline">Support</span>
                      </button>
                    )}
                    <button className={`p-1.5 sm:p-2 rounded-full transition-colors ${isDark ? 'text-white/60 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                      }`}>
                      <FaEllipsisH size={14} className="sm:hidden" />
                      <FaEllipsisH size={16} className="hidden sm:block" />
                    </button>
                  </div>
                </div>

                {/* Caption - Before Media (LinkedIn/X style) */}
                {post.caption && (
                  <div className="px-3 sm:px-4 pb-2.5 sm:pb-3">
                    <p className={`text-xs sm:text-sm md:text-base leading-relaxed break-words ${isDark ? 'text-white/90' : 'text-gray-900'
                      }`}>
                      {post.caption}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`text-xs sm:text-sm font-medium ${isDark ? 'text-[#00B8A9] hover:text-[#00A89A]' : 'text-[#00B8A9] hover:text-[#00A89A]'
                            } cursor-pointer transition-colors`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media */}
                <div className="relative w-full aspect-square sm:aspect-video bg-black overflow-hidden">
                  {post.type === "reel" ? (
                    <>
                      <video
                        ref={(el) => (videoRefs.current[post.id] = el)}
                        src={post.video}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                      />
                      <button
                        onClick={() => toggleVideoPlay(post.id)}
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${!post.isPlaying ? 'opacity-100 bg-black/30' : 'opacity-0 hover:opacity-100 bg-black/20'
                          }`}
                      >
                        <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110">
                          {!post.isPlaying ? (
                            <FaPlay size={24} className="text-gray-900 ml-1" />
                          ) : (
                            <FaPause size={24} className="text-gray-900" />
                          )}
                        </div>
                      </button>
                      {/* Views Counter */}
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-1.5">
                        <FaChartLine className="text-white" size={12} />
                        <span className="text-white text-xs font-semibold">
                          {formatNumber(post.views)} views
                        </span>
                      </div>
                    </>
                  ) : (
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Engagement Stats - Unique Compact Design */}
                <div className={`px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs border-b ${isDark ? 'border-white/[0.08]' : 'border-gray-200'
                  }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${post.isLiked
                        ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600'
                        : isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {post.isLiked ? (
                        <FaHeart size={11} className="sm:hidden" fill="currentColor" />
                      ) : (
                        <FaRegHeart size={11} className="sm:hidden" />
                      )}
                      {post.isLiked ? (
                        <FaHeart size={12} className="hidden sm:block" fill="currentColor" />
                      ) : (
                        <FaRegHeart size={12} className="hidden sm:block" />
                      )}
                      <span className="font-semibold">{formatNumber(post.likeCount)}</span>
                    </button>
                    <button className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      <FaRegComment size={11} className="sm:hidden" />
                      <FaRegComment size={12} className="hidden sm:block" />
                      <span className="font-semibold">{formatNumber(post.commentCount)}</span>
                    </button>
                    <button className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      <FaShare size={11} className="sm:hidden" />
                      <FaShare size={12} className="hidden sm:block" />
                      <span className="font-semibold">{formatNumber(post.shares)}</span>
                    </button>
                    <button
                      onClick={() => toggleSave(post.id)}
                      className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 ${post.isSaved
                        ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-50 text-amber-600'
                        : isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {post.isSaved ? (
                        <FaBookmark size={11} className="sm:hidden" fill="currentColor" />
                      ) : (
                        <FaRegBookmark size={11} className="sm:hidden" />
                      )}
                      {post.isSaved ? (
                        <FaBookmark size={12} className="hidden sm:block" fill="currentColor" />
                      ) : (
                        <FaRegBookmark size={12} className="hidden sm:block" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Comment Input - Unique Design */}
                <div className="px-3 sm:px-4 py-2.5 sm:py-3.5">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 transition-all flex-shrink-0 ${isDark ? 'ring-white/10 hover:ring-[#00B8A9]/30' : 'ring-gray-200 hover:ring-[#00B8A9]/30'
                      }`}>
                      <img
                        src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.email || 'U')}&background=00B8A9&color=fff`}
                        alt="Your avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 relative group min-w-0">
                      <input
                        type="text"
                        placeholder="Share your thoughts..."
                        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-16 sm:pr-20 rounded-lg sm:rounded-xl text-xs sm:text-sm transition-all duration-300 ${isDark
                          ? 'bg-white/5 text-white placeholder-white/40 border border-white/10 focus:border-[#00B8A9] focus:ring-2 focus:ring-[#00B8A9]/20 focus:bg-white/10'
                          : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#00B8A9] focus:ring-2 focus:ring-[#00B8A9]/20 focus:bg-white'
                          } outline-none`}
                      />
                      <button className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${isDark
                        ? 'bg-[#00B8A9] text-white hover:bg-[#00A89A] opacity-0 group-focus-within:opacity-100 pointer-events-none group-focus-within:pointer-events-auto'
                        : 'bg-[#00B8A9] text-white hover:bg-[#00A89A] opacity-0 group-focus-within:opacity-100 pointer-events-none group-focus-within:pointer-events-auto'
                        }`}>
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>


      {/* ── Upload Pitch Reel Modal ─────────────────────────────────────── */}
      {showUploadModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={closeUploadModal}
          />

          {/* Modal Sheet */}
          <div className={`fixed inset-x-0 bottom-0 z-[70] rounded-t-3xl shadow-2xl max-w-lg mx-auto transition-all duration-300 ${isDark ? 'bg-[#0d0d0d] border-t border-white/10' : 'bg-white border-t border-gray-200'}`}>
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-300'}`} />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Pitch Reel</h2>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Upload a video to appear in Pitch Reels feed</p>
                </div>
                <button onClick={closeUploadModal} className={`w-9 h-9 flex items-center justify-center rounded-full ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Video Picker / Preview */}
              <div
                onClick={() => uploadState !== 'uploading' && fileInputRef.current?.click()}
                className={`relative w-full rounded-2xl overflow-hidden mb-4 cursor-pointer transition-all duration-200 ${uploadPreview ? 'aspect-[9/5]' : 'aspect-[16/7]'} ${!uploadPreview ? (isDark ? 'border-2 border-dashed border-white/20 bg-white/5 hover:border-[#00B8A9]/60 hover:bg-white/8' : 'border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#00B8A9] hover:bg-gray-100') : ''}`}
              >
                {uploadPreview ? (
                  <video
                    src={uploadPreview}
                    className="w-full h-full object-cover"
                    controls={false}
                    muted
                    autoPlay
                    loop
                    playsInline
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                      <FiUploadCloud size={28} className={isDark ? 'text-white/50' : 'text-gray-400'} />
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Tap to select video</p>
                    <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>MP4, MOV, WebM supported</p>
                  </div>
                )}
                {uploadPreview && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-semibold bg-black/60 px-3 py-1.5 rounded-full">Change video</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoFileChange}
              />

              {/* Description */}
              <textarea
                value={uploadDesc}
                onChange={e => setUploadDesc(e.target.value)}
                placeholder="Describe your pitch (optional)"
                rows={2}
                disabled={uploadState === 'uploading'}
                className={`w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all mb-3 ${isDark
                  ? 'bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-[#00B8A9]'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#00B8A9]'}`}
              />

              {/* Hashtags */}
              <input
                value={uploadHashtags}
                onChange={e => setUploadHashtags(e.target.value)}
                placeholder="#fintech #startup #pitch (space or comma separated)"
                disabled={uploadState === 'uploading'}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all mb-4 ${isDark
                  ? 'bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-[#00B8A9]'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-[#00B8A9]'}`}
              />

              {/* Error */}
              {uploadError && (
                <p className="text-xs text-red-400 mb-3 font-medium">{uploadError}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleUploadReel}
                disabled={uploadState === 'uploading' || uploadState === 'success' || !uploadVideo}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 ${uploadState === 'success'
                    ? 'bg-green-500 text-white'
                    : uploadState === 'uploading'
                      ? 'bg-[#00B8A9]/60 text-white cursor-not-allowed'
                      : !uploadVideo
                        ? isDark ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white shadow-lg shadow-[#00B8A9]/30 hover:shadow-[#00B8A9]/50 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {uploadState === 'uploading' && <FaSpinner className="animate-spin" size={16} />}
                {uploadState === 'success' && <FaCheckCircle size={16} />}
                {uploadState === 'uploading' ? 'Uploading…' : uploadState === 'success' ? 'Published! 🎉' : 'Publish Pitch Reel'}
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
