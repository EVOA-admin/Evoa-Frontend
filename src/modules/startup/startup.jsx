import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDataCache } from "../../contexts/DataCacheContext";
import { FaRegNewspaper, FaPlus } from "react-icons/fa";
import EmptyState from "../../components/shared/EmptyState";
import AppHeader from "../../components/layout/AppHeader";
import DesktopFeedLayout from "../../components/layout/DesktopFeedLayout";
import PitchCard from "../../components/shared/PitchCard";
import UserPostCard from "../../components/shared/UserPostCard";
import StartupPostCard from "../../components/shared/StartupPostCard";
import RisingStartupsSection from "../../components/shared/RisingStartupsSection";
import RegistrationCompletionPopup from "../../components/shared/RegistrationCompletionPopup";
import postsService from "../../services/postsService";
import reelsService from "../../services/reelsService";
import { getMyStartup, followStartup, unfollowStartup } from "../../services/startupsService";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { getUnreadCount } from "../../services/chatService";

import { buildRandomizedFeed } from "../../utils/feedShuffle";

export default function Startup() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const cache = useDataCache();

  const [pitches, setPitches] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [feedItems, setFeedItems] = useState(() => cache.get('feedItems') || []);
  const [loading, setLoading] = useState(() => !cache.get('feedItems'));
  const [feedError, setFeedError] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myStartup, setMyStartup] = useState(null);
  const [showRisingStartups, setShowRisingStartups] = useState(false);
  const [pinnedUploads, setPinnedUploads] = useState([]);

  const [risingStartups, setRisingStartups] = useState(() => cache.get('risingStartups') || []);
  const risingDebounceRef = useRef(null);
  const feedRetryRef = useRef(0);
  const [risingLoading, setRisingLoading] = useState(!cache.get('risingStartups'));

  useEffect(() => {
    if (authLoading || !user?.id) return;
    loadFeed();
    getUnreadCount().then(r => {
      const d = r?.data?.data || r?.data || {};
      setUnreadCount((d.unreadMessages || 0) + (d.pendingRequests || 0));
    }).catch(() => { });
    getMyStartup().then(r => setMyStartup(r?.data?.data || r?.data)).catch(() => {});
  }, [authLoading, user?.id]);

  useEffect(() => {
    if (authLoading || !user?.id || loading) return;
    fetchRisingStartups();
  }, [authLoading, user?.id, loading]);

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
      if (Array.isArray(data)) {
        setRisingStartups(data);
        cache.set('risingStartups', data);
      }
    } catch (e) {
    } finally {
      setRisingLoading(false);
    }
  };

  // Single combined loader: fetches reels + posts in parallel, builds feed once, no flicker
  const loadFeed = async (isRetry = false) => {
    if (authLoading || !user?.id) return;
    try {
      if (!cache.get('feedItems') && feedItems.length === 0) {
        setLoading(true);
      }

      const [reelsRes, postsRes] = await Promise.allSettled([
        reelsService.getFeed('for_you', cursor),
        postsService.getAllPosts(),
      ]);

      console.log('[FeedFetch] Raw reels response:', reelsRes);
      console.log('[FeedFetch] Raw posts response:', postsRes);

      // --- Map reels ---
      let mappedPitches = [];
      if (reelsRes.status === 'fulfilled') {
        const data = reelsRes.value?.data?.data || reelsRes.value?.data || {};
        const feedData = data?.reels || (Array.isArray(data) ? data : []);
        const nextCursor = data?.nextCursor || null;
        mappedPitches = feedData.map(reel => ({
          id: reel.id,
          startupId: reel.startupId,
          authorId: reel.startup?.founderId || reel.startup?.founder?.id || reel.startupId,
          isFollowing: reel.isFollowing,
          username: reel.startup?.name || 'Unknown',
          profilePhoto: reel.startup?.logoUrl || null,
          summary: reel.title,
          image: reel.thumbnailUrl,
          video: reel.videoUrl,
          caption: reel.description,
          hashtags: reel.hashtags ? reel.hashtags.join(' ') : '',
          likes: reel.likeCount || 0,
          comments: reel.commentCount || 0,
          shares: reel.shareCount || 0,
          views: reel.viewCount || 0,
          clickthroughs: 0,
          liked: reel.isLiked || false,
          saved: reel.isSaved || false,
          dealInfo: reel.startup?.dealInfo || null,
          links: {
            website: reel.startup?.website,
            linkedin: reel.startup?.linkedin,
            instagram: reel.startup?.instagram
          },
          pitchDeck: reel.startup?.pitchDeckUrl,
          investors: []
        }));
        setCursor(nextCursor);
      }

      // --- Map posts ---
      let mappedPosts = [];
      if (postsRes.status === 'fulfilled' && !postsRes.value?.error) {
        const val = postsRes.value;
        const postArray = Array.isArray(val?.data?.data)
          ? val.data.data
          : (Array.isArray(val?.data)
            ? val.data
            : (Array.isArray(val?.data?.posts)
              ? val.data.posts
              : (Array.isArray(val) ? val : [])));

        mappedPosts = postArray.map((p) => {
          const isStartup = !!(p.startupId || p.user?.role === 'startup');
          const timeAgo = p.createdAt
            ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
            : "";
          if (isStartup) {
            return {
              _type: 'startup', id: p.id, authorId: p.userId || p.user?.id,
              startupName: p.startupName || p.user?.fullName || 'Startup',
              startupLogo: p.startupLogo || p.user?.avatarUrl || null,
              tagline: p.tagline || p.caption || '', website: p.website || null,
              sectors: p.sectors || p.hashtags || [], imageUrl: p.imageUrl, imageUrls: p.imageUrls || [], timeAgo,
              pitchViews: p.pitchViews ?? 0, supporters: p.supporters ?? 0,
              clickThrough: p.clickThrough ?? p.clickThroughCount ?? 0,
              investorThoughts: p.investorThoughts || [],
              isLiked: p.isLiked ?? false, isSaved: false,
              likeCount: p.likeCount || 0, commentCount: p.commentCount || 0,
            };
          }
          return {
            _type: 'user', id: p.id, authorId: p.userId || p.user?.id,
            authorName: p.user?.fullName || "User", authorAvatar: p.user?.avatarUrl || null,
            authorRole: p.user?.role || "viewer", timeAgo, imageUrl: p.imageUrl, imageUrls: p.imageUrls || [],
            caption: p.caption, hashtags: p.hashtags || [],
            isLiked: p.isLiked ?? false, isSaved: false,
            likeCount: p.likeCount || 0, commentCount: p.commentCount || 0,
          };
        });
      }

      // Update source arrays
      setPitches(mappedPitches);
      setUserPosts(mappedPosts);

      // Build or update feed atomically preserving card positions to eliminate flickering
      setFeedItems(prevFeed => {
        const updated = buildRandomizedFeed(mappedPitches, mappedPosts, pinnedUploads, prevFeed);
        cache.set('feedItems', updated);
        return updated;
      });

      if (reelsRes.status === 'fulfilled') setFeedError(false);
    } catch (e) {
      if (!isRetry && feedRetryRef.current === 0) {
        feedRetryRef.current = 1;
        setTimeout(() => loadFeed(true), 2000);
      } else {
        setFeedError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (startupId) => {
    setPitches(prev => prev.map(p => p.startupId === startupId ? { ...p, isFollowing: !p.isFollowing } : p));
    const pitch = pitches.find(p => p.startupId === startupId);
    if (!pitch) return;
    try {
      if (pitch.isFollowing) await unfollowStartup(startupId);
      else await followStartup(startupId);
    } catch (_) {
      setPitches(pitches);
    }
  };

  const handlePitchLike = async (pitchId) => {
    const pitch = pitches.find(p => p.id === pitchId);
    if (!pitch) return;
    const isLiked = pitch.liked;
    setPitches(prev => prev.map(p => p.id === pitchId ? { ...p, liked: !isLiked, likes: isLiked ? p.likes - 1 : p.likes + 1 } : p));
    try {
      if (isLiked) await reelsService.unlikeReel(pitchId);
      else await reelsService.likeReel(pitchId);
    } catch (_) {
      setPitches(pitches);
    }
  };

  const handlePitchSave = async (pitchId) => {
    const pitch = pitches.find(p => p.id === pitchId);
    if (!pitch) return;
    const isSaved = pitch.saved;
    setPitches(prev => prev.map(p => p.id === pitchId ? { ...p, saved: !isSaved } : p));
    try {
      if (isSaved) await reelsService.unsaveReel(pitchId);
      else await reelsService.saveReel(pitchId);
    } catch (_) {
      setPitches(pitches);
    }
  };

  const uploadAction = (
    <div className="flex items-center gap-1">
      <RisingStartupsSection
        startups={risingStartups}
        loading={risingLoading}
        onRefresh={fetchRisingStartups}
        triggerOnly
        onOpen={() => setShowRisingStartups(true)}
      />
      <button
        onClick={() => navigate('/choice-role')}
        className={`evoa-header-action-btn ${isDark ? "" : ""}`}
        title="Upload Pitch Reel / Post"
      >
        <FaPlus size={16} />
      </button>
      <button
        onClick={() => navigate("/inbox")}
        className={`evoa-header-action-btn ${isDark ? "" : ""}`}
        title="Messages"
      >
        <IoChatbubbleEllipsesOutline size={22} />
        {unreadCount > 0 && (
          <span className="evoa-header-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );

  useEffect(() => {
    const handlePostCreated = () => {
      cache.invalidate('feedItems');
      loadFeed();
      fetchRisingStartups();
    };
    window.addEventListener('evoa:contentCreated', handlePostCreated);
    return () => window.removeEventListener('evoa:contentCreated', handlePostCreated);
  }, []);

  const hasContent = feedItems.length > 0 || pitches.length > 0 || userPosts.length > 0;

  return (
    <>
      <AppHeader actions={uploadAction} />
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
          <div className="pb-6">
            <div className="pt-1">
              {loading && !hasContent && (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-8 h-8 border-2 border-evoa border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {!loading && feedError && !hasContent && (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center my-4">
                  <p className="text-red-500 font-semibold mb-2 text-sm">Couldn't load feed</p>
                  <p className="text-gray-500 text-xs mb-4">A temporary error occurred. Please try again.</p>
                  <button
                    onClick={() => { setFeedError(false); feedRetryRef.current = 0; loadFeed(); }}
                    className="px-4 py-2 bg-evoa text-white font-semibold rounded-xl text-xs hover:opacity-90 transition-all"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !feedError && !hasContent && (
                <EmptyState
                  icon={FaRegNewspaper}
                  title="No Content Yet"
                  description="Your feed is currently empty. Pitch reels and community posts will appear here."
                  actionLabel="Upload"
                  onAction={() => navigate('/choice-role')}
                />
              )}

              {feedItems.length > 0 && (
                <div className="space-y-2.5 mb-2.5">
                  {feedItems.map((item) => {
                    if (item.itemType === 'pitch') {
                      const pitch = item.data;
                      return (
                        <PitchCard
                          key={item.id}
                          pitch={pitch}
                          onLike={handlePitchLike}
                          onComment={() => {}}
                          onShare={(id) => reelsService.shareReel(id).catch(console.error)}
                          onSave={handlePitchSave}
                          onFollow={handleFollow}
                        />
                      );
                    }

                    const post = item.data;
                    const handleLike = () => {
                      setFeedItems((prev) =>
                        prev.map((it) =>
                          it.id === item.id
                            ? { ...it, data: { ...it.data, isLiked: !it.data.isLiked, likeCount: it.data.isLiked ? it.data.likeCount - 1 : it.data.likeCount + 1 } }
                            : it
                        )
                      );
                      const request = post.isLiked ? postsService.unlikePost(post.id) : postsService.likePost(post.id);
                      request.then(() => fetchRisingStartups(true)).catch(() => { });
                    };

                    const handleSave = () => {
                      setFeedItems((prev) =>
                        prev.map((it) =>
                          it.id === item.id ? { ...it, data: { ...it.data, isSaved: !it.data.isSaved } } : it
                        )
                      );
                      post.isSaved ? postsService.unsavePost(post.id) : postsService.savePost(post.id);
                    };

                    const handleComment = async () => {
                      const text = window.prompt('Add a comment:');
                      if (!text?.trim()) return;
                      try {
                        await postsService.addComment(post.id, text.trim());
                        setFeedItems((prev) =>
                          prev.map((it) =>
                            it.id === item.id ? { ...it, data: { ...it.data, commentCount: (it.data.commentCount || 0) + 1 } } : it
                          )
                        );
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
                      return <StartupPostCard key={item.id} post={post} isDark={isDark}
                        onLike={handleLike} onSave={handleSave} onComment={handleComment} onShare={handleShare} onEngagementChange={fetchRisingStartups} />;
                    }
                    return <UserPostCard key={item.id} post={post} isDark={isDark}
                      onLike={handleLike} onSave={handleSave} onComment={handleComment} onShare={handleShare} onEngagementChange={fetchRisingStartups} />;
                  })}
                </div>
              )}

            </div>
          </div>
        </DesktopFeedLayout>
      </main>

      <RegistrationCompletionPopup
        startup={myStartup}
        isDark={isDark}
        onComplete={() => navigate('/register/startup?mode=complete')}
      />
    </>
  );
}
