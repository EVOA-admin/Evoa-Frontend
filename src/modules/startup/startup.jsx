import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDataCache } from "../../contexts/DataCacheContext";
import { FaRegNewspaper, FaPlus } from "react-icons/fa";
import EmptyState from "../../components/shared/EmptyState";
import AppHeader from "../../components/layout/AppHeader";
import DesktopFeedLayout from "../../components/layout/DesktopFeedLayout";
import UserPostCard from "../../components/shared/UserPostCard";
import StartupPostCard from "../../components/shared/StartupPostCard";
import RisingStartupsSection from "../../components/shared/RisingStartupsSection";
import RegistrationCompletionPopup from "../../components/shared/RegistrationCompletionPopup";
import postsService from "../../services/postsService";
import { getMyStartup } from "../../services/startupsService";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { getUnreadCount } from "../../services/chatService";

export default function Startup() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const cache = useDataCache();

  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRisingStartups, setShowRisingStartups] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [myStartup, setMyStartup] = useState(null);

  // Seed state from cache immediately to avoid a blank loading flash on re-visit
  const [risingStartups, setRisingStartups] = useState(() => cache.get('risingStartups') || []);
  const risingDebounceRef = useRef(null);
  const [risingLoading, setRisingLoading] = useState(!cache.get('risingStartups'));

  useEffect(() => {
    if (authLoading || !user?.id) return;
    fetchPosts();
    getUnreadCount().then(r => {
      const d = r?.data?.data || r?.data || {};
      setUnreadCount((d.unreadMessages || 0) + (d.pendingRequests || 0));
    }).catch(() => { });
    // Fetch own startup profile for the completion popup
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
    // Serve from cache if fresh — skip the API call entirely
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
      // Keep stale data on error — don't blank the list
    } finally {
      setRisingLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await postsService.getAllPosts();
      const data = res?.data?.data || res?.data || [];
      setUserPosts(
        Array.isArray(data)
          ? data.map((p) => {
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
          })
          : []
      );
    } catch (_) {
    } finally {
      setLoading(false);
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
        onClick={() => setShowUploadModal(true)}
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
              {!loading && userPosts.length === 0 && (
                <EmptyState
                  icon={FaRegNewspaper}
                  title="No Posts Yet"
                  description="Your feed is currently empty. Upload your first pitch reel to get started."
                  actionLabel="Upload"
                  onAction={() => setShowUploadModal(true)}
                />
              )}
              {userPosts.map((post) => {
                const handleLike = () => {
                  setUserPosts((prev) =>
                    prev.map((p) =>
                      p.id === post.id
                        ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
                        : p
                    )
                  );
                  const request = post.isLiked ? postsService.unlikePost(post.id) : postsService.likePost(post.id);
                  request.then(() => fetchRisingStartups(true)).catch(() => { });
                };

                const handleSave = () => {
                  setUserPosts((prev) =>
                    prev.map((p) =>
                      p.id === post.id ? { ...p, isSaved: !p.isSaved } : p
                    )
                  );
                  post.isSaved ? postsService.unsavePost(post.id) : postsService.savePost(post.id);
                };

                const handleComment = async () => {
                  const text = window.prompt('Add a comment:');
                  if (!text?.trim()) return;
                  try {
                    await postsService.addComment(post.id, text.trim());
                    setUserPosts((prev) =>
                      prev.map((p) =>
                        p.id === post.id ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
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
                  return <StartupPostCard key={post.id} post={post} isDark={isDark}
                    onLike={handleLike} onSave={handleSave} onComment={handleComment} onShare={handleShare} onEngagementChange={fetchRisingStartups} />;
                }
                return <UserPostCard key={post.id} post={post} isDark={isDark}
                  onLike={handleLike} onSave={handleSave} onComment={handleComment} onShare={handleShare} onEngagementChange={fetchRisingStartups} />;
              })}
            </div>
          </div>
        </DesktopFeedLayout>
      </main>

      {/* Registration completion popup — shows until all registration steps are done */}
      <RegistrationCompletionPopup
        startup={myStartup}
        isDark={isDark}
        onComplete={() => navigate('/register/startup?mode=complete')}
      />
    </>
  );
}
