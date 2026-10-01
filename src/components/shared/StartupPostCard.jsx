import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaHandshake, FaRegComment, FaRegPaperPlane, FaExternalLinkAlt,
  FaBookmark, FaRegBookmark, FaEdit, FaTrash, FaLink, FaShare
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { HiDotsHorizontal } from "react-icons/hi";
import ensureUrl from "../../utils/ensureUrl";
import { goToProfile } from "../../utils/profileNavigation";
import postsService from "../../services/postsService";
import PostCommentSheet from "./PostCommentSheet";
import PostCarousel from "./PostCarousel";

export default function StartupPostCard({
  post,
  onLike,
  onSave,
  onShare,
  isDark: isDarkProp,
  onDeleted,
  onEngagementChange,
}) {
  const { theme } = useTheme();
  const isDark = isDarkProp ?? theme === "dark";
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [isSupported, setIsSupported] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likeCount || post.supporters || 0);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [commentText, setCommentText] = useState("");
  const [commentPosting, setCommentPosting] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);


  const menuRef = useRef(null);
  const commentInputRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const isOwner = currentUser?.id && currentUser.id === post.authorId;

  const handleSupport = () => {
    const newState = !isSupported;
    setIsSupported(newState);
    setLikesCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));
    if (newState) {
      postsService.likePost(post.id).then(() => onEngagementChange?.()).catch(() => {});
    } else {
      postsService.unlikePost(post.id).then(() => onEngagementChange?.()).catch(() => {});
    }
    if (onLike) onLike(post.id);
  };

  const handleSaveToggle = () => {
    const newState = !isSaved;
    setIsSaved(newState);
    if (newState) {
      postsService.savePost(post.id).catch(() => {});
    } else {
      postsService.unsavePost(post.id).catch(() => {});
    }
    if (onSave) onSave(post.id);
  };

  const handlePostComment = async () => {
    const text = commentText.trim();
    if (!text || commentPosting) return;
    setCommentPosting(true);
    setCommentText("");
    setCommentCount(prev => prev + 1);
    try {
      await postsService.addComment(post.id, text);
      onEngagementChange?.();
    } catch (_) {
      setCommentCount(prev => Math.max(0, prev - 1));
    } finally {
      setCommentPosting(false);
    }
  };

  const handleCommentKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePostComment(); }
  };

  const handleCommentClick = () => {
    setCommentSheetOpen(true);
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    postsService.sharePost(post.id).then(() => onEngagementChange?.()).catch(() => {});
    if (navigator.share) {
      navigator.share({ title: post.startupName || "Post", url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl).then(() => {
        alert("Link copied to clipboard!");
      }).catch(() => {});
    }
    if (onShare) onShare(post.id);
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!window.confirm("Delete this post?")) return;
    try {
      await postsService.deletePost?.(post.id);
      onDeleted?.(post.id);
    } catch (_) {
      alert("Failed to delete post.");
    }
  };

  const logoFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.startupName || "S")}&background=00B8A9&color=fff&size=72`;

  const images = post.imageUrls?.length
    ? post.imageUrls
    : post.imageUrl ? [post.imageUrl] : [];

  const websiteUrl = post.website;

  return (
    <>
      <div className={`rounded-2xl overflow-hidden transition-all duration-300 mb-2.5 border ${
        isDark
          ? 'bg-black/60 backdrop-blur-xl border-white/10 shadow-lg shadow-black/40'
          : 'bg-white border-gray-200/80 shadow-sm shadow-gray-200/50'
      }`}>
        {/* Header — Visually identical to PitchCard */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex-shrink-0 border border-white/10"
              onClick={() => goToProfile(post.authorId, currentUser, navigate)}
            >
              <img
                src={post.startupLogo || logoFallback}
                alt={post.startupName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = logoFallback; }}
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-sm cursor-pointer hover:underline ${isDark ? "text-white" : "text-gray-900"}`}
                onClick={() => goToProfile(post.authorId, currentUser, navigate)}
              >
                {post.startupName}
              </span>
              <MdVerified size={14} className="text-evoa flex-shrink-0" />
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                Startup
              </span>
            </div>
          </div>

          {/* Three-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? "hover:bg-white/10 text-white/60" : "hover:bg-black/5 text-gray-500"}`}
            >
              <HiDotsHorizontal size={18} />
            </button>

            {menuOpen && (
              <div className={`absolute right-0 top-10 z-50 w-48 rounded-xl overflow-hidden border shadow-xl ${
                isDark ? "bg-[#121212] border-white/10 text-white" : "bg-white border-gray-200 text-gray-800"
              }`}>
                {isOwner && (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); navigate(`/edit-post/${post.id}`); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-white/10 transition-colors"
                    >
                      <FaEdit size={13} /> Edit post
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <FaTrash size={13} /> Delete post
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setMenuOpen(false); navigator.clipboard?.writeText(`${window.location.origin}/post/${post.id}`); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-white/10 transition-colors"
                >
                  <FaLink size={13} /> Copy link
                </button>
                <button
                  onClick={() => { setMenuOpen(false); handleShareClick(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs hover:bg-white/10 transition-colors"
                >
                  <FaShare size={13} /> Share post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media Container — Edge-to-edge matching PitchCard */}
        {images.length > 0 && (
          <div className="relative w-full aspect-square bg-black overflow-hidden group flex items-center justify-center">
            {images.length === 1 ? (
              <img
                src={images[0]}
                alt={post.startupName}
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <PostCarousel images={images} aspectRatio="1/1" imageFit="contain" isDark={isDark} />
            )}
          </div>
        )}

        {/* Actions & Content */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              {/* Support (handshake) button */}
              <button
                onClick={handleSupport}
                className={`flex items-center gap-1.5 cursor-pointer transition-colors ${isSupported ? 'text-evoa' : isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
                title={isSupported ? "Supported" : "Support"}
              >
                <FaHandshake size={20} />
                <span className="text-xs font-semibold">{likesCount}</span>
              </button>

              {/* Comment button */}
              <button
                onClick={handleCommentClick}
                className={`flex items-center gap-1.5 cursor-pointer transition-colors ${isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
                title="Comment"
              >
                <FaRegComment size={18} />
                <span className="text-xs font-semibold">{commentCount}</span>
              </button>

              {/* Share button - Icon only */}
              <button
                onClick={handleShareClick}
                className={`cursor-pointer transition-colors ${isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
                title="Share"
              >
                <FaRegPaperPlane size={17} />
              </button>

              {/* Website button - Icon only (directly to the right of Share) */}
              {websiteUrl && (
                <a
                  href={ensureUrl(websiteUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`cursor-pointer transition-colors ${isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
                  title="Visit Website"
                >
                  <FaExternalLinkAlt size={15} />
                </a>
              )}
            </div>

            {/* Save / Bookmark button */}
            <button
              onClick={handleSaveToggle}
              className={`cursor-pointer transition-colors ${isSaved ? 'text-evoa' : isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
              title={isSaved ? "Saved" : "Save"}
            >
              {isSaved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
            </button>
          </div>

          {/* Description & Hashtags — Hashtags moved below description, 1-line truncation with ... more / Show Less */}
          {(() => {
            const description = post.caption || post.tagline || "";
            const hashtags = post.sectors?.length > 0 ? post.sectors.map(s => `#${s}`).join(" ") : "";
            if (!description && !hashtags) return null;

            const ONE_LINE_LIMIT = 85;
            const isLong = description.length > ONE_LINE_LIMIT;

            return (
              <div className="mb-2">
                {/* Description */}
                {description && (
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                    {descriptionExpanded || !isLong ? (
                      description
                    ) : (
                      <>
                        {description.slice(0, ONE_LINE_LIMIT).trim()}...{" "}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDescriptionExpanded(true); }}
                          className={`font-semibold cursor-pointer border-none bg-transparent p-0 text-xs ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                        >
                          more
                        </button>
                      </>
                    )}
                  </p>
                )}

                {/* Hashtags below description */}
                {(descriptionExpanded || !isLong) && hashtags && (
                  <div className="mt-1">
                    <span className={`text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                      {hashtags}
                    </span>
                  </div>
                )}

                {/* Show Less button when expanded */}
                {descriptionExpanded && isLong && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDescriptionExpanded(false); }}
                    className={`mt-1 font-semibold cursor-pointer border-none bg-transparent p-0 text-xs text-left block ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-black'}`}
                  >
                    Show Less
                  </button>
                )}
              </div>
            );
          })()}


          {/* Comment Input */}
          <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center">
              {currentUser?.avatarUrl
                ? <img
                  src={currentUser.avatarUrl}
                  alt="You"
                  className="w-full h-full object-cover"
                />
                : <span className="text-white text-xs font-bold">
                  {(currentUser?.fullName?.[0] || currentUser?.email?.[0] || '?').toUpperCase()}
                </span>
              }
            </div>
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={handleCommentKey}
              placeholder="Add a comment..."
              className={`flex-1 bg-transparent border-none outline-none text-sm py-1 ${isDark ? 'text-white placeholder-white/40' : 'text-black placeholder-gray-400'}`}
            />
            <button
              onClick={handlePostComment}
              disabled={!commentText.trim() || commentPosting}
              className={`text-sm font-semibold transition-opacity cursor-pointer ${commentText.trim() && !commentPosting
                ? 'text-evoa'
                : 'opacity-30 cursor-not-allowed'
                }`}
            >
              {commentPosting ? '...' : 'Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Comment Bottom Sheet */}
      <PostCommentSheet
        isOpen={commentSheetOpen}
        onClose={() => setCommentSheetOpen(false)}
        postId={post.id}
        postTitle={post.startupName}
        onCommentAdded={() => {
          setCommentCount(c => c + 1);
          onEngagementChange?.();
        }}
      />
    </>
  );
}
