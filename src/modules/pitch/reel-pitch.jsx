import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import reelsService from "../../services/reelsService";
import startupsService from "../../services/startupsService";
import {
  FaHandshake, FaRegComment, FaComment, FaRegPaperPlane,
  FaVolumeUp, FaVolumeMute, FaArrowLeft, FaVideo,
  FaRobot, FaTimes, FaPaperPlane, FaSpinner
} from "react-icons/fa";
import { IoChatbubbleOutline, IoPaperPlaneOutline } from "react-icons/io5";
import { FiCalendar, FiVolume2, FiVolumeX } from "react-icons/fi";
import O21Icon from "../../components/shared/O21Icon";

const formatNum = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const formatMoney = (val) => {
  if (!val) return '—';
  const num = parseFloat(val);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  return `₹${num.toLocaleString()}`;
};

const ReelProgressBar = ({ pitchId }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const hideTimeout = useRef(null);
  const containerRef = useRef(null);

  const getVideo = () => document.getElementById(`video-${pitchId}`);

  useEffect(() => {
    const video = getVideo();
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isScrubbing && video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [pitchId, isScrubbing]);

  const showBar = () => {
    setIsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (!isScrubbing) setIsVisible(false);
    }, 2000);
  };

  useEffect(() => {
    const video = getVideo();
    if (!video) return;

    video.addEventListener('play', showBar);
    video.addEventListener('pause', showBar);
    video.addEventListener('click', showBar);
    video.addEventListener('touchstart', showBar);

    return () => {
      video.removeEventListener('play', showBar);
      video.removeEventListener('pause', showBar);
      video.removeEventListener('click', showBar);
      video.removeEventListener('touchstart', showBar);
    };
  }, [pitchId, isScrubbing]);

  const handleScrub = (e) => {
    e.stopPropagation();
    const video = getVideo();
    if (!video || !video.duration) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let newProgress = ((clientX - rect.left) / rect.width) * 100;
    newProgress = Math.max(0, Math.min(newProgress, 100));

    setProgress(newProgress);
    video.currentTime = (newProgress / 100) * video.duration;
    showBar();
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    setIsScrubbing(true);
    handleScrub(e);

    const onMove = (moveEvent) => {
      if (moveEvent.cancelable) moveEvent.preventDefault();
      handleScrub(moveEvent);
    };

    const onUp = (upEvent) => {
      handleScrub(upEvent);
      setIsScrubbing(false);
      showBar();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };

    document.addEventListener('mousemove', onMove, { passive: false });
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-40 pb-0.5 pt-4 flex items-end transition-opacity duration-300 ${isVisible || isScrubbing ? 'opacity-100' : 'opacity-0'}`}
      onMouseEnter={showBar}
      onMouseDown={handleDragStart}
      onTouchStart={handleDragStart}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={containerRef}
        className={`w-full bg-white/20 relative transition-all duration-200 cursor-pointer ${isScrubbing ? 'h-1.5' : 'h-1'}`}
      >
        <div
          className="absolute top-0 left-0 bottom-0 bg-white"
          style={{ width: `${progress}%` }}
        />
        <div
          className={`absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-transform duration-200`}
          style={{ left: `${progress}%`, transform: `translate(-50%, -50%) ${isScrubbing ? 'scale(1)' : 'scale(0)'}` }}
        />
      </div>
    </div>
  );
};

export default function ReelPitch() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { id } = useParams(); // optional: start at a specific reel
  const [searchParams] = useSearchParams();
  const hashtagFilter = searchParams.get('hashtag'); // set from explore page
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const { userRole, user: currentUser } = useAuth();

  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reelStates, setReelStates] = useState({});

  // AI Chat State
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [currentPitchForAI, setCurrentPitchForAI] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Comment sheet state
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [commentPitch, setCommentPitch] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentPosting, setCommentPosting] = useState(false);
  const commentInputRef = useRef(null);

  const canSeeInvestorFeatures = userRole === 'investor' || userRole === 'incubator';

  // ── Fetch reels from API ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        const res = hashtagFilter
          ? await reelsService.getReelsByHashtag(hashtagFilter)
          : await reelsService.getFeed('for_you', null);
        const data = res?.data?.data || res?.data || res;
        const reelsData = data?.reels || data || [];

        const mapped = reelsData.map(reel => ({
          id: reel.id,
          name: reel.startup?.name || 'Unknown Startup',
          username: reel.startup?.username || '',
          profilePhoto: reel.startup?.logoUrl || null,
          video: reel.videoUrl,
          hashtag: reel.hashtags?.map(h => `#${h}`).join(' ') || '',
          category: reel.startup?.industries?.[0] || reel.startup?.industry || '',
          description: reel.description || reel.title || '',
          likes: reel.likeCount || 0,
          comments: reel.commentCount || 0,
          shares: reel.shareCount || 0,
          isLiked: reel.isLiked || false,
          isSaved: reel.isSaved || false,
          isFollowing: reel.isFollowing || false,
          dealInfo: {
            ask: formatMoney(reel.startup?.raisingAmount),
            equity: reel.startup?.equityPercentage ? `${reel.startup.equityPercentage}%` : '—',
            revenue: formatMoney(reel.startup?.revenue),
          },
          startupId: reel.startupId,
          founderId: reel.startup?.founder?.id || reel.startup?.founderId,
        }));

        setPitches(mapped);

        // Init reel states
        const initialState = {};
        mapped.forEach((p) => {
          initialState[p.id] = { isLiked: p.isLiked, isSaved: p.isSaved, isPlaying: false, isMuted: false };
        });
        setReelStates(initialState);

        // If a specific id was passed, scroll to it
        if (id && mapped.length > 0) {
          const idx = mapped.findIndex(p => p.id === id);
          if (idx > 0) setCurrentIndex(idx);
        }
      } catch (err) {
        console.error('Failed to load reels:', err);
        setPitches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, [id, hashtagFilter]);

  // ── Scroll & auto-play logic (IntersectionObserver — each slide fills viewport) ──
  useEffect(() => {
    if (pitches.length === 0) return;

    const observers = [];

    pitches.forEach((pitch, idx) => {
      const el = document.getElementById(`reel-slide-${pitch.id}`);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;

          // Update current index
          setCurrentIndex(idx);

          // Pause all videos, play the visible one
          Object.entries(videoRefs.current).forEach(([rid, v]) => {
            if (!v) return;
            if (rid === pitch.id) {
              v.muted = reelStates[pitch.id]?.isMuted ?? false;
              v.play().catch(() => { });
              setReelStates(prev => ({ ...prev, [pitch.id]: { ...prev[pitch.id], isPlaying: true } }));
            } else {
              v.pause();
              setReelStates(prev => ({ ...prev, [rid]: { ...prev[rid], isPlaying: false } }));
            }
          });


        },
        { threshold: 0.7 }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitches]);

  // Auto-play first video when loaded
  useEffect(() => {
    if (pitches.length === 0) return;
    const firstId = pitches[currentIndex]?.id;
    if (!firstId) return;
    const vid = videoRefs.current[firstId];
    if (vid && reelStates[firstId]) {
      vid.muted = reelStates[firstId].isMuted ?? false;
      vid.play().catch(() => { });
      setReelStates((prev) => ({ ...prev, [firstId]: { ...prev[firstId], isPlaying: true } }));
    }
  }, [pitches]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const togglePlay = (pitchId) => {
    const video = videoRefs.current[pitchId];
    if (!video) return;
    const isPlaying = reelStates[pitchId]?.isPlaying;
    if (isPlaying) { video.pause(); } else { video.play(); }
    setReelStates((prev) => ({ ...prev, [pitchId]: { ...prev[pitchId], isPlaying: !isPlaying } }));
  };

  const toggleMute = (pitchId) => {
    const video = videoRefs.current[pitchId];
    if (!video) return;
    const newMuted = !reelStates[pitchId]?.isMuted;
    video.muted = newMuted;
    setReelStates((prev) => ({ ...prev, [pitchId]: { ...prev[pitchId], isMuted: newMuted } }));
  };

  const handleSupport = async (pitchId) => {
    setReelStates((prev) => ({
      ...prev,
      [pitchId]: {
        ...prev[pitchId],
        isLiked: !prev[pitchId].isLiked,
      },
    }));
    setPitches(prev => prev.map(p =>
      p.id === pitchId
        ? { ...p, likes: p.likes + (reelStates[pitchId]?.isLiked ? -1 : 1) }
        : p
    ));
    try {
      if (reelStates[pitchId]?.isLiked) {
        await reelsService.unlikeReel(pitchId);
      } else {
        await reelsService.likeReel(pitchId);
      }
    } catch (_) { }
  };

  // ── Comment handlers ─────────────────────────────────────────────────────
  const openComments = async (pitch) => {
    setCommentPitch(pitch);
    setCommentSheetOpen(true);
    setComments([]);
    setCommentsLoading(true);
    // pause the video while comments are open
    const vid = videoRefs.current[pitch.id];
    if (vid) vid.pause();
    try {
      const res = await reelsService.getComments(pitch.id);
      const data = res?.data?.data || res?.data || res || [];
      setComments(Array.isArray(data) ? data : []);
    } catch (_) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
      setTimeout(() => commentInputRef.current?.focus(), 200);
    }
  };

  const closeComments = () => {
    setCommentSheetOpen(false);
    setCommentPitch(null);
    setComments([]);
    setCommentText('');
    // resume video
    if (commentPitch) {
      const vid = videoRefs.current[commentPitch.id];
      if (vid) vid.play().catch(() => { });
    }
  };

  const postComment = async () => {
    if (!commentText.trim() || commentPosting || !commentPitch) return;
    const text = commentText.trim();
    setCommentPosting(true);
    // Optimistic UI — use real user data from auth context (backend is source of truth)
    const myName = currentUser?.fullName || currentUser?.email?.split('@')[0] || 'You';
    const myAvatar = currentUser?.avatarUrl || null;
    const optimistic = {
      id: `tmp-${Date.now()}`,
      content: text,
      userId: 'me',
      createdAt: new Date().toISOString(),
      user: { fullName: myName, avatarUrl: myAvatar },
    };
    setComments(prev => [...prev, optimistic]);
    setCommentText('');
    // Update comment count on pitch
    setPitches(prev => prev.map(p =>
      p.id === commentPitch.id ? { ...p, comments: p.comments + 1 } : p
    ));
    try {
      await reelsService.commentOnReel(commentPitch.id, text);
    } catch (_) {
      // rollback
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
      setPitches(prev => prev.map(p =>
        p.id === commentPitch.id ? { ...p, comments: Math.max(0, p.comments - 1) } : p
      ));
    } finally {
      setCommentPosting(false);
    }
  };

  const handleCommentKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postComment(); }
  };

  const handleAIClick = (pitch) => {
    setCurrentPitchForAI(pitch);
    setMessages([{
      id: 1, type: 'ai',
      text: `Hello! I'm your AI Assistant for ${pitch.name}'s ${pitch.category} startup. Ask me anything about their pitch, investment opportunity (${pitch.dealInfo.ask} for ${pitch.dealInfo.equity}), or how to connect!`,
      timestamp: new Date()
    }]);
    setIsAIOpen(true);
  };

  const handleSendMessage = async (overrideMessage) => {
    const textToSubmit = overrideMessage || inputMessage;
    if (!textToSubmit.trim() || isLoading || !currentPitchForAI) return;

    const userMsg = { id: messages.length + 1, type: 'user', text: textToSubmit, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Clear input immediately if not overriding
    if (!overrideMessage) {
      setInputMessage('');
    }

    try {
      const resp = await startupsService.analyzeStartup(currentPitchForAI.startupId, textToSubmit);
      const answer = resp?.data?.answer || "I received an empty response. Let me try again later.";

      setMessages(prev => [...prev, { id: prev.length + 1, type: 'ai', text: answer, timestamp: new Date() }]);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'ai',
        text: "I encountered an error analyzing this startup. Please try a different question or wait a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };

  // ── Render reel ───────────────────────────────────────────────────────────
  const renderReel = (pitch) => {
    const state = reelStates[pitch.id] || { isLiked: false, isSaved: false, isPlaying: false, isMuted: false };
    return (
      <div key={pitch.id} id={`reel-slide-${pitch.id}`} className="w-full h-full relative overflow-hidden bg-black" style={{ minHeight: '100dvh' }}>

        {/* ── Video ── */}
        {pitch.video ? (
          <video
            ref={(el) => (videoRefs.current[pitch.id] = el)}
            id={`video-${pitch.id}`}
            src={pitch.video}
            className="absolute inset-0 w-full h-full object-cover"
            loop playsInline muted={state.isMuted}
            onClick={() => togglePlay(pitch.id)}
            onPlay={() => setReelStates(prev => ({ ...prev, [pitch.id]: { ...prev[pitch.id], isPlaying: true } }))}
            onPause={() => setReelStates(prev => ({ ...prev, [pitch.id]: { ...prev[pitch.id], isPlaying: false } }))}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-white/40 text-sm">Video unavailable</p>
          </div>
        )}

        {/* ── Play/pause overlay ── */}
        {!state.isPlaying && pitch.video && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer z-10" onClick={() => togglePlay(pitch.id)}>
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <div className="w-0 h-0 border-l-[18px] border-l-white border-t-[11px] border-t-transparent border-b-[11px] border-b-transparent ml-2" />
            </div>
          </div>
        )}

        {/* ── Category tag (top-left, below header) ── */}
        {pitch.category && (
          <div className="absolute top-16 left-3 z-20">
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-black/50 backdrop-blur-sm text-white border border-white/20">
              {pitch.category}
            </div>
          </div>
        )}

        {/* ── Bottom gradient overlay ── */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none" />

        {/* ══ RIGHT SIDE BUTTONS (bottom-right, Instagram style) ══ */}
        <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-3">
          <button onClick={() => handleSupport(pitch.id)} className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
            <FaHandshake size={26} className={state.isLiked ? 'text-[#00B8A9] drop-shadow-lg' : 'text-white drop-shadow-lg'} />
            <span className="text-[10px] font-semibold text-white drop-shadow-md">{formatNum(pitch.likes)}</span>
          </button>

          {/* Controls: calendar, bot, mute */}
          <div className="flex flex-col items-center gap-2">
            {canSeeInvestorFeatures && (
              <button
                onClick={(e) => { e.stopPropagation(); window.open('https://meet.new', '_blank'); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white active:scale-90 transition-transform drop-shadow-lg"
              >
                <FiCalendar size={20} strokeWidth={2.5} />
              </button>
            )}

            {canSeeInvestorFeatures && (
              <button
                onClick={(e) => { e.stopPropagation(); handleAIClick(pitch); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition-transform drop-shadow-lg"
              >
                <O21Icon size={24} color="#ffffff" />
              </button>
            )}

            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(pitch.id); }}
              className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition-transform drop-shadow-lg text-white ${state.isMuted ? 'opacity-80' : 'opacity-100'
                }`}
            >
              {state.isMuted ? <FiVolumeX size={22} strokeWidth={2.5} /> : <FiVolume2 size={22} strokeWidth={2.5} />}
            </button>
          </div>

          <button onClick={() => openComments(pitch)} className="flex flex-col items-center gap-0.5 mt-0.5 active:scale-90 transition-transform">
            <IoChatbubbleOutline size={22} className="text-white drop-shadow-lg outline-none" style={{ strokeWidth: "32px", transform: "scaleX(-1)" }} />
            <span className="text-[10px] font-semibold text-white drop-shadow-md">{formatNum(pitch.comments)}</span>
          </button>
          <button
            className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              const url = `${window.location.origin}/pitch?id=${pitch.id}`;
              if (navigator.share) {
                navigator.share({ title: pitch.name || 'Pitch Reel', text: pitch.tagline || '', url }).catch(() => { });
              } else {
                navigator.clipboard?.writeText(url).then(() => { }).catch(() => { });
              }
            }}
          >
            <IoPaperPlaneOutline size={22} className="text-white drop-shadow-lg -ml-1 pr-1" style={{ strokeWidth: "32px" }} />
            <span className="text-[10px] font-semibold text-white drop-shadow-md">{formatNum(pitch.shares)}</span>
          </button>
        </div>

        {/* ══ BOTTOM-LEFT INFO ══ */}
        <div className="absolute bottom-0 left-0 right-20 z-30 px-4 pb-6">

          {/* Startup name + handle */}
          <div
            className="flex items-center gap-2 mb-1.5 cursor-pointer hover:bg-white/10 p-1.5 -ml-1.5 rounded-xl transition-colors active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              if (pitch.founderId) navigate(`/u/${pitch.founderId}`);
            }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#00B8A9] flex-shrink-0">
              {pitch.profilePhoto
                ? <img src={pitch.profilePhoto} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">{pitch.name?.[0]}</div>
              }
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{pitch.name}</h3>
              <p className="text-xs text-white/60 leading-tight">{pitch.hashtag}</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-white/85 leading-relaxed line-clamp-2 mb-2.5">{pitch.description}</p>

          {/* Deal info pills */}
          {(pitch.dealInfo.ask !== '\u2014' || pitch.dealInfo.revenue !== '\u2014') && (
            <div className="flex gap-2 flex-wrap">
              {pitch.dealInfo.ask !== '\u2014' && (
                <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white">
                  <p className="text-[9px] opacity-80">Ask</p>
                  <p className="font-bold text-[11px]">{pitch.dealInfo.ask} · {pitch.dealInfo.equity}</p>
                </div>
              )}
              {pitch.dealInfo.revenue !== '\u2014' && (
                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm text-white border border-white/20">
                  <p className="text-[9px] opacity-80">Revenue</p>
                  <p className="font-bold text-[11px]">{pitch.dealInfo.revenue}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Progress Bar ── */}
        {pitch.video && <ReelProgressBar pitchId={pitch.id} />}
      </div>
    );
  };

  return (
    <>
      {/* Outer gutter wrapper — matches AppShell aesthetic */}
      <div className={`fixed inset-0 z-50 flex justify-center ${isDark ? 'bg-[#0d0d0d]' : 'bg-[#e8e8e8]'}`}>
        <div className="relative w-full h-full overflow-hidden" style={{ maxWidth: '430px' }}>
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 min-h-[56px] bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-95">
              <FaArrowLeft size={18} />
            </button>
            <h1 className="text-lg font-bold text-white">Pitch Reels</h1>
            <div className="w-11" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className="animate-spin text-[#00B8A9]" size={32} />
            </div>
          ) : pitches.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/60 px-8 text-center">
              <FaVideo size={48} className="opacity-30" />
              <p className="text-base font-semibold">No pitch videos yet</p>
              <p className="text-sm opacity-60">Startups that register with a pitch video will appear here.</p>
            </div>
          ) : (
            <div ref={containerRef} className="w-full h-full overflow-y-scroll snap-y snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
              {pitches.map((pitch) => (
                <div key={pitch.id} className="snap-start snap-always">
                  {renderReel(pitch)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Modal */}
      {isAIOpen && currentPitchForAI && canSeeInvestorFeatures && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsAIOpen(false)} />
          <div className={`fixed inset-0 sm:bottom-6 sm:right-6 sm:inset-auto z-[70] w-full sm:w-96 h-full sm:h-[600px] sm:rounded-2xl shadow-2xl flex flex-col ${isDark ? 'bg-[#0a0a0a] border border-white/10' : 'bg-white border border-gray-200'}`}
            onClick={e => e.stopPropagation()}>
            <div className={`flex items-center justify-between px-4 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden">
                  {currentPitchForAI.profilePhoto
                    ? <img src={currentPitchForAI.profilePhoto} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold">{currentPitchForAI.name?.[0]}</div>
                  }
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-black'}`}>AI — {currentPitchForAI.name}</h3>
                  <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{currentPitchForAI.category} Startup</p>
                </div>
              </div>
              <button onClick={() => setIsAIOpen(false)} className={`w-11 h-11 flex items-center justify-center rounded-full ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <FaTimes size={20} className={isDark ? 'text-white' : 'text-black'} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.type === 'user' ? 'bg-[#00B8A9] text-white' : isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-black'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.type === 'user' ? 'text-white/70' : isDark ? 'text-white/50' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex justify-start"><div className={`rounded-2xl px-4 py-3 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}><FaSpinner className="animate-spin text-[#00B8A9]" size={18} /></div></div>}
            </div>
            <div className={`px-4 py-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>

              {/* Pre-fed Prompt Pills */}
              <div className="flex overflow-x-auto gap-2 mb-3 pb-1 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {[
                  "Summarise this startup?",
                  "What is their USP?",
                  "What is their target market?",
                  "Are they solving a real issue?",
                  "How scalable is this model?",
                  "What are the potential risks?"
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(promptText)}
                    disabled={isLoading}
                    className={`whitespace-nowrap flex-shrink-0 snap-start px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border outline-none
                      ${isDark
                        ? 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
                    `}
                  >
                    {promptText}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder="Ask about this startup..."
                  className={`flex-1 px-4 py-3 rounded-xl text-sm outline-none ${isDark ? 'bg-white/5 text-white placeholder-white/50 border border-white/10 focus:border-[#00B8A9]' : 'bg-gray-50 text-black placeholder-gray-400 border border-gray-200 focus:border-[#00B8A9]'}`} />
                <button onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isLoading}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${inputMessage.trim() && !isLoading ? 'bg-[#00B8A9] text-white' : isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-300'}`}>
                  <FaPaperPlane size={18} />
                </button>
              </div>
              <p className={`text-xs mt-2 text-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>AI-powered pitch insights</p>
            </div>
          </div>
        </>
      )}

      {/* ══ COMMENT BOTTOM SHEET ══ */}
      {commentSheetOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={closeComments}
          />
          {/* Sheet */}
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto rounded-t-3xl flex flex-col"
            style={{ maxHeight: '75vh', background: '#0e0e0e' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="text-white font-bold text-base">
                {commentPitch?.name} — Comments
              </h3>
              <button onClick={closeComments} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                <FaTimes size={16} className="text-white/70" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4" style={{ minHeight: 0 }}>
              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-[#00B8A9]" size={24} />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/40 gap-2">
                  <FaRegComment size={36} className="opacity-40" />
                  <p className="text-sm">No comments yet. Be the first!</p>
                </div>
              ) : (
                comments.map((c, i) => (
                  <div key={c.id || i} className="flex gap-3">
                    <button
                      onClick={() => c.userId && c.userId !== 'me' && navigate(`/u/${c.userId}`)}
                      className="flex-shrink-0 focus:outline-none"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                        {c.user?.avatarUrl
                          ? <img src={c.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : (
                            <span>
                              {(c.user?.fullName?.[0] || c.user?.email?.[0] || '?').toUpperCase()}
                            </span>
                          )
                        }
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => c.userId && c.userId !== 'me' && navigate(`/u/${c.userId}`)}
                        className="text-xs font-semibold text-white/80 hover:text-[#00B8A9] transition-colors text-left"
                      >
                        {c.user?.fullName || c.user?.email?.split('@')[0] || 'User'}
                      </button>
                      <p className="text-sm text-white/90 leading-relaxed mt-0.5">{c.content}</p>
                      <p className="text-[10px] text-white/40 mt-1">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input bar */}
            <div className="px-4 py-3 border-t border-white/10 flex items-center gap-3 bg-[#0e0e0e]">
              <input
                ref={commentInputRef}
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={handleCommentKey}
                placeholder="Add a comment..."
                className="flex-1 bg-white/8 border border-white/15 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-[#00B8A9] transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
              <button
                onClick={postComment}
                disabled={!commentText.trim() || commentPosting}
                className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all ${commentText.trim() && !commentPosting
                  ? 'bg-[#00B8A9] text-white active:scale-90'
                  : 'bg-white/10 text-white/30'
                  }`}
              >
                {commentPosting
                  ? <FaSpinner size={14} className="animate-spin" />
                  : <FaPaperPlane size={14} />
                }
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
