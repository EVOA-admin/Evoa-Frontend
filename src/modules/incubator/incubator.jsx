import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import StatusComponent from "../../components/shared/StatusComponent";
import PitchCard from "../../components/shared/PitchCard";
import { FaRegNewspaper } from "react-icons/fa";
import EmptyState from "../../components/shared/EmptyState";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import reelsService from "../../services/reelsService";
import { followStartup, unfollowStartup } from "../../services/startupsService";
import { getNotifications } from "../../services/notificationsService";
import CreateContentModal from "../../components/shared/CreateContentModal";
import UserPostCard from "../../components/shared/UserPostCard";
import StartupPostCard from "../../components/shared/StartupPostCard";
import postsService from "../../services/postsService";
import { FaPlus } from "react-icons/fa";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { getUnreadCount } from "../../services/chatService";

export default function Incubator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    fetchFeed();
    fetchUnreadCount();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
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
            _type: 'startup', id: p.id, authorId: p.userId || p.user?.id,
            startupName: p.startupName || p.user?.fullName || 'Startup',
            startupLogo: p.startupLogo || p.user?.avatarUrl || null,
            tagline: p.tagline || p.caption || '', website: p.website || null,
            sectors: p.sectors || p.hashtags || [], imageUrl: p.imageUrl, timeAgo,
            pitchViews: p.pitchViews ?? 0, supporters: p.supporters ?? 0,
            clickThrough: p.clickThrough ?? p.clickThroughCount ?? 0,
            investorThoughts: p.investorThoughts || [],
            isLiked: p.isLiked ?? false, isSaved: false,
            likeCount: p.likeCount || 0, commentCount: p.commentCount || 0,
          };
        }
        return {
          _type: 'user', id: p.id, authorId: p.userId || p.user?.id,
          authorName: p.user?.fullName || 'User', authorAvatar: p.user?.avatarUrl || null,
          authorRole: p.user?.role || 'viewer', timeAgo, imageUrl: p.imageUrl,
          caption: p.caption, hashtags: p.hashtags || [],
          isLiked: p.isLiked ?? false, isSaved: false,
          likeCount: p.likeCount || 0, commentCount: p.commentCount || 0,
        };
      }) : []);
    } catch (_) { }
  };

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
      const res = await getUnreadCount();
      const d = res?.data?.data || res?.data || {};
      setUnreadCount((d.unreadMessages || 0) + (d.pendingRequests || 0));
    } catch (err) {
      // Non-critical
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

  const plusAction = (
    <div className="flex items-center gap-1">
      <button
        onClick={() => navigate("/inbox")}
        className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 ${isDark ? "text-white/70 hover:text-[#00B8A9] hover:bg-white/8" : "text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100"}`}
        title="Messages"
      >
        <IoChatbubbleEllipsesOutline size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#00B8A9] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      <button
        onClick={() => setShowModal(true)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#00B8A9] to-[#007a73] text-white shadow-md active:scale-90 transition-all"
        title="Create Post"
      >
        <FaPlus size={14} />
      </button>
    </div>
  );

  return (
    <AppShell>
      <AppHeader actions={plusAction} />
      <main>
        <div className="px-0 pb-4">
          <StatusComponent />
          <div className="space-y-4 px-3">
            {!loading && pitches.length === 0 && userPosts.length === 0 && (
              <EmptyState
                icon={FaRegNewspaper}
                title="No Pitches Yet"
                description="Your feed is currently empty. Explore startups to see content here."
                actionLabel="Explore Startups"
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
        {/* ── User Posts Feed ── */}
        {userPosts.length > 0 && (
          <div className="px-3 mt-4 space-y-4 pb-4">
            {userPosts.map(post => {
              const handleLike = () => {
                setUserPosts(prev => prev.map(p =>
                  p.id === post.id
                    ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
                    : p
                ));
                post.isLiked ? postsService.unlikePost(post.id) : postsService.likePost(post.id);
              };
              if (post._type === 'startup') {
                return <StartupPostCard key={post.id} post={post} isDark={isDark} onLike={handleLike} />;
              }
              return <UserPostCard key={post.id} post={post} isDark={isDark} onLike={handleLike} />;
            })}
          </div>
        )}
      </main>
      <CreateContentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        canUploadReel={false}
        onCreated={() => { }}
      />
    </AppShell>
  );
}
