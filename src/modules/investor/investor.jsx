import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDataCache } from "../../contexts/DataCacheContext";
import PitchCard from "../../components/shared/PitchCard";
import { FaRegNewspaper } from "react-icons/fa";
import EmptyState from "../../components/shared/EmptyState";
import DesktopFeedLayout from "../../components/layout/DesktopFeedLayout";
import AppHeader from "../../components/layout/AppHeader";
import reelsService from "../../services/reelsService";
import { getStartupDetails, followStartup, unfollowStartup } from "../../services/startupsService";
import UserPostCard from "../../components/shared/UserPostCard";
import StartupPostCard from "../../components/shared/StartupPostCard";
import RisingStartupsSection from "../../components/shared/RisingStartupsSection";
import postsService from "../../services/postsService";
import { FaPlus } from "react-icons/fa";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { getUnreadCount } from "../../services/chatService";

export default function Investor() {
  const { theme } = useTheme();
  const { loading: authLoading, user } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const cache = useDataCache();

  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
    const [showRisingStartups, setShowRisingStartups] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [feedError, setFeedError] = useState(false);
  const [risingStartups, setRisingStartups] = useState(() => cache.get('risingStartups') || []);
  const [risingLoading, setRisingLoading] = useState(!cache.get('risingStartups'));
  const risingDebounceRef = useRef(null);
  const feedRetryRef = useRef(0);
  const showPitchFeed = loading || pitches.length > 0 || (!loading && userPosts.length === 0 && !feedError);

  useEffect(() => {
    if (authLoading || !user?.id) return;
    fetchFeed();
    fetchUnreadCount();
    fetchPosts();
    fetchRisingStartups();
  }, [authLoading, user?.id]);

  const fetchRisingStartups = (debounce = false) => {
    if (authLoading || !user?.id) return;
    if (debounce) {
      if (risingDebounceRef.current) clearTimeout(risingDebounceRef.current);
      risingDebounceRef.current = setTimeout(() => _doFetchRising(), 600);
    } else {
      _doFetchRising();
    }
  };

  const _doFetchRising = async () => {
    const cached = cache.get('risingStartups');
    if (cached) { setRisingStartups(cached); setRisingLoading(false); return; }
    try {
      setRisingLoading(true);
      const res = await postsService.getRisingStartups();
      const data = res?.data?.data || res?.data || [];
      if (Array.isArray(data)) { setRisingStartups(data); cache.set('risingStartups', data); }
    } catch (_) {
      // Keep stale data on error
    } finally {
      setRisingLoading(false);
    }
  };

  const fetchPosts = async (isRetry = false) => {
    try {
      const res = await postsService.getAllPosts();
      const data = res?.data?.data || res?.data || [];
      setUserPosts(Array.isArray(data) ? data.map(p => {
        const isStartup = !!(p.startupId || p.user?.role === 'startup');
        const timeAgo = p.createdAt
          ? new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : '';

        if (isStartup) {
          return {
            _type: 'startup',
            id: p.id,
            authorId: p.userId || p.user?.id,
            startupName: p.startupName || p.user?.fullName || 'Startup',
            startupLogo: p.startupLogo || p.user?.avatarUrl || null,
            tagline: p.tagline || p.caption || '',
            website: p.website || null,
            sectors: p.sectors || p.hashtags || [],
            imageUrl: p.imageUrl,
            imageUrls: p.imageUrls || [],
            timeAgo,
            pitchViews: p.pitchViews ?? 0,
            supporters: p.supporters ?? 0,
            clickThrough: p.clickThrough ?? p.clickThroughCount ?? 0,
            investorThoughts: p.investorThoughts || [],
            isLiked: p.isLiked ?? false,
            isSaved: false,
            likeCount: p.likeCount || 0,
            commentCount: p.commentCount || 0,
          };
        }

        return {
          _type: 'user',
          id: p.id,
          authorId: p.userId || p.user?.id,
          authorName: p.user?.fullName || 'User',
          authorAvatar: p.user?.avatarUrl || null,
          authorRole: p.user?.role || 'viewer',
          timeAgo,
          imageUrl: p.imageUrl,
          imageUrls: p.imageUrls || [],
          caption: p.caption,
          hashtags: p.hashtags || [],
          isLiked: p.isLiked ?? false,
          isSaved: false,
          likeCount: p.likeCount || 0,
          commentCount: p.commentCount || 0,
        };
      }) : []);
      setFeedError(false);
    } catch (e) {
      if (!isRetry && feedRetryRef.current === 0) {
        feedRetryRef.current = 1;
        setTimeout(() => fetchPosts(true), 2000);
      } else {
        setFeedError(true);
      }
      window.__evoaDebug = e.message;
    }
  };

  const fetchFeed = async (isRetry = false) => {
    if (authLoading || !user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await reelsService.getFeed('for_you', cursor);
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
        comments: reel.commentCount || 0,
        shares: reel.shareCount || 0,
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
        setPitches(prev => cursor ? [...prev, ...mappedPitches] : mappedPitches);
      }
      setHasMore(data?.hasMore ?? false);
      setCursor(nextCursor);
      setFeedError(false);
      feedRetryRef.current = 0;
    } catch (e) {
      if (!isRetry && feedRetryRef.current === 0) {
        feedRetryRef.current = 1;
        setTimeout(() => fetchFeed(true), 2000);
      } else {
        setFeedError(true);
      }
      window.__evoaDebug = (window.__evoaDebug || '') + ' | FeedError: ' + e.message;
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      const d = res?.data?.data || res?.data || {};
      setUnreadCount((d.unreadMessages || 0) + (d.pendingRequests || 0));
    } catch (err) {
      // Non-critical
    }
  };

  const handleFollow = async (startupId) => {
    const newPitches = pitches.map(p => {
      if (p.startupId === startupId) {
        return { ...p, isFollowing: !p.isFollowing };
      }
      return p;
    });
    setPitches(newPitches);

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
      setPitches(pitches);
    }
  };

  const handleLike = async (pitchId) => {
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
      setPitches(pitches);
    }
  };

  const handleSave = async (pitchId) => {
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
    navigate(`/reels/${pitchId}/comments`);
  };

  const handleShare = (pitchId) => {
    reelsService.shareReel(pitchId).catch(console.error);
  };

  const plusAction = (
    <div className="flex items-center gap-1">
      <RisingStartupsSection
        startups={risingStartups}
        loading={risingLoading}
        onRefresh={fetchRisingStartups}
        triggerOnly
        onOpen={() => setShowRisingStartups(true)}
      />
      <button
        onClick={() => setShowModal(true)}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 ${isDark ? "text-white/70 hover:text-evoa hover:bg-white/8" : "text-gray-600 hover:text-evoa hover:bg-gray-100"}`}
        title="Create Post"
      >
        <FaPlus size={16} />
      </button>
      <button
        onClick={() => navigate("/inbox")}
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 ${isDark ? "text-white/70 hover:text-evoa hover:bg-white/8" : "text-gray-600 hover:text-evoa hover:bg-gray-100"}`}
        title="Messages"
      >
        <IoChatbubbleEllipsesOutline size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-evoa text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );

  // Global post creation listener
  useEffect(() => {
    const handlePostCreated = () => {
      fetchPosts();
      fetchRisingStartups();
    };
    window.addEventListener('evoa:contentCreated', handlePostCreated);
    return () => window.removeEventListener('evoa:contentCreated', handlePostCreated);
  }, []);

  return (
    <>
      <AppHeader actions={plusAction} />
      <main>
        <RisingStartupsSection
          startups={risingStartups}
          loading={risingLoading}
          onRefresh={fetchRisingStartups}
          panelOnly
          isOpen={showRisingStartups}
          onClose={() => setShowRisingStartups(false)}
        />
        <DesktopFeedLayout>
          {showPitchFeed && (
            <div className="px-0 pt-0 pb-4">
              <div className="mt-2">
                {!loading && pitches.length === 0 && userPosts.length === 0 && !feedError && (
                  <EmptyState
                    icon={FaRegNewspaper}
                    title="No Pitches Yet"
                    description="Your feed is currently empty. Follow some startups to see their pitches here."
                    actionLabel="Find Startups"
                    onAction={() => navigate('/explore')}
                  />
                )}
                {!loading && feedError && pitches.length === 0 && userPosts.length === 0 && (
                  <div style={{
                    background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12,
                    padding:'24px 20px', textAlign:'center', margin:'16px 0'
                  }}>
                    <p style={{color:'#DC2626', fontWeight:600, marginBottom:8}}>Couldn't load feed</p>
                    <p style={{color:'#6B7280', fontSize:13, marginBottom:16}}>A temporary error occurred. Please try again.</p>
                    <button
                      onClick={() => { setFeedError(false); feedRetryRef.current = 0; fetchFeed(); fetchPosts(); }}
                      style={{
                        background:'#1565C0', color:'#fff', border:'none', borderRadius:8,
                        padding:'10px 24px', fontWeight:600, cursor:'pointer', fontSize:14
                      }}
                    >Retry</button>
                  </div>
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
          )}
          {userPosts.length > 0 && (
            <div className={`${pitches.length > 0 ? "mt-4" : ""} pb-4`}>
              {userPosts.map(post => {
                const handleLike = () => {
                  setUserPosts(prev => prev.map(p =>
                    p.id === post.id
                      ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
                      : p
                  ));
                  const request = post.isLiked ? postsService.unlikePost(post.id) : postsService.likePost(post.id);
                  request.then(() => fetchRisingStartups(true)).catch(() => {});
                };

                const handleSave = () => {
                  setUserPosts(prev => prev.map(p =>
                    p.id === post.id ? { ...p, isSaved: !p.isSaved } : p
                  ));
                  post.isSaved ? postsService.unsavePost(post.id) : postsService.savePost(post.id);
                };

                const handleComment = async () => {
                  const text = window.prompt('Add a comment:');
                  if (!text?.trim()) return;
                  try {
                    await postsService.addComment(post.id, text.trim());
                    setUserPosts(prev => prev.map(p =>
                      p.id === post.id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
                    ));
                  } catch (e) { /* silent */ }
                };

                const handleShare = () => {
                  const url = `${window.location.origin}/post/${post.id}`;
                  if (navigator.share) {
                    navigator.share({ title: post.startupName || post.authorName || 'Post', url });
                  } else {
                    navigator.clipboard?.writeText(url);
                    alert('Link copied to clipboard!');
                  }
                };

                if (post._type === 'startup') {
                  return <StartupPostCard key={post.id} post={post} isDark={isDark}
                    onLike={handleLike} onSave={handleSave} onComment={handleComment} onShare={handleShare} onEngagementChange={fetchRisingStartups} />;
                }
                return <UserPostCard key={post.id} post={post} isDark={isDark}
                  onLike={handleLike} onSave={handleSave} onComment={handleComment} onShare={handleShare} onEngagementChange={fetchRisingStartups} />;
              })}
            </div>
          )}
        </DesktopFeedLayout>
      </main>
    </>
  );
}
