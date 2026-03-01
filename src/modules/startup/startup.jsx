import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaRegNewspaper, FaPlus } from "react-icons/fa";
import EmptyState from "../../components/shared/EmptyState";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import reelsService from "../../services/reelsService";
import { getNotifications } from "../../services/notificationsService";
import CreateContentModal from "../../components/shared/CreateContentModal";
import UserPostCard from "../../components/shared/UserPostCard";
import StartupPostCard from "../../components/shared/StartupPostCard";
import postsService from "../../services/postsService";
import StatusComponent from "../../components/shared/StatusComponent";

export default function Startup() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

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
              authorName: p.user?.fullName || "User", authorAvatar: p.user?.avatarUrl || null,
              authorRole: p.user?.role || "viewer", timeAgo, imageUrl: p.imageUrl,
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
    <button
      onClick={() => setShowUploadModal(true)}
      className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#00B8A9] to-[#007a73] text-white shadow-md active:scale-90 transition-all"
      title="Upload Pitch Reel / Post"
    >
      <FaPlus size={15} />
    </button>
  );

  return (
    <AppShell>
      <AppHeader actions={uploadAction} />
      <main>
        <div className="px-0 pb-4">
          <StatusComponent />
          <div className="space-y-4 px-3">
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
                post.isLiked ? postsService.unlikePost(post.id) : postsService.likePost(post.id);
              };
              if (post._type === 'startup') {
                return <StartupPostCard key={post.id} post={post} isDark={isDark} onLike={handleLike} />;
              }
              return <UserPostCard key={post.id} post={post} isDark={isDark} onLike={handleLike} />;
            })}
          </div>
        </div>
      </main>

      <CreateContentModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        canUploadReel={true}
        onCreated={() => fetchPosts()}
      />
    </AppShell>
  );
}
