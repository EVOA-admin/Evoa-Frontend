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

export default function Viewer() {
  const { theme } = useTheme();
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

  return (
    <AppShell>
      <AppHeader />
      <main>
        <div className="px-0 pb-4">
          <div className="mb-4 px-3">
            <StatusComponent />
          </div>
          <div className="space-y-4 px-3">
            {!loading && pitches.length === 0 && (
              <EmptyState
                icon={FaRegNewspaper}
                title="No Pitches Yet"
                description="Your feed is currently empty. Follow some startups or explore new pitches to see content here."
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
      </main>
    </AppShell>
  );
}
