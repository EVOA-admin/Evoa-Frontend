import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHandshake, FaRegComment, FaRegPaperPlane, FaExternalLinkAlt,
  FaBookmark, FaRegBookmark
} from "react-icons/fa";
import { IoVolumeMute, IoVolumeHigh } from "react-icons/io5";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import ensureUrl from "../../utils/ensureUrl";
import reelsService from "../../services/reelsService";
import ReelCommentSheet from "./ReelCommentSheet";

import { goToProfile } from "../../utils/profileNavigation";

export default function PitchCard({ pitch, onLike, onComment, onShare, onSave, onFollow }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [isSupported, setIsSupported] = useState(pitch.liked || false);
  const [likesCount, setLikesCount] = useState(pitch.likes || 0);
  const [isSaved, setIsSaved] = useState(pitch.saved || false);
  const [commentText, setCommentText] = useState('');
  const [commentPosting, setCommentPosting] = useState(false);
  const [commentCount, setCommentCount] = useState(pitch.comments || 0);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Audio / Mute control
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);
  const commentInputRef = useRef(null);

  const profileUserId = pitch.authorId || pitch.founderId || pitch.startupId;

  const handleSupport = () => {
    const newState = !isSupported;
    setIsSupported(newState);
    setLikesCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));
    if (onLike) onLike(pitch.id);
  };

  const handleSave = () => {
    const newState = !isSaved;
    setIsSaved(newState);
    if (onSave) onSave(pitch.id);
  };

  const handlePostComment = async () => {
    const text = commentText.trim();
    if (!text || commentPosting) return;
    setCommentPosting(true);
    setCommentText('');
    setCommentCount(prev => prev + 1);
    try {
      await reelsService.commentOnReel(pitch.id, text);
    } catch (_) {
      setCommentCount(prev => Math.max(0, prev - 1));
    } finally {
      setCommentPosting(false);
    }
  };

  const handleCommentKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); }
  };

  const handleCommentClick = () => {
    setCommentSheetOpen(true);
    if (onComment) onComment(pitch.id);
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/pitch/${pitch.id}`;
    reelsService.shareReel(pitch.id).catch(() => {});
    if (navigator.share) {
      navigator.share({ title: pitch.username || 'Pitch Reel', url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {});
    }
    if (onShare) onShare(pitch.id);
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const websiteUrl = pitch.links?.website || pitch.website;

  return (
    <>
      <div className={`rounded-2xl overflow-hidden transition-all duration-300 mb-4 border ${
        isDark
          ? 'bg-black/60 backdrop-blur-xl border-white/10 shadow-lg shadow-black/40'
          : 'bg-white border-gray-200/80 shadow-sm shadow-gray-200/50'
      }`}>
        {/* Header — Clean Username + Follow button, opens Startup Profile on click */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer flex-shrink-0 border border-white/10"
              onClick={(e) => {
                e.stopPropagation();
                goToProfile(profileUserId, currentUser, navigate);
              }}
            >
              <img
                src={pitch.profilePhoto || 'https://i.pravatar.cc/150?img=1'}
                alt={pitch.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-sm cursor-pointer hover:underline ${isDark ? 'text-white' : 'text-gray-900'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToProfile(profileUserId, currentUser, navigate);
                }}
              >
                {pitch.username}
              </span>
              <button

                onClick={(e) => { e.stopPropagation(); onFollow && onFollow(pitch.startupId); }}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${pitch.isFollowing
                  ? 'bg-transparent border border-current opacity-60'
                  : (isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20')
                  }`}
              >
                {pitch.isFollowing ? 'Following' : '+ Follow'}
              </button>
            </div>
          </div>
        </div>

        {/* Pitch Media with Mute/Unmute overlay */}
        {(pitch.image || pitch.video) && (
          <div className="relative w-full aspect-square bg-gray-900 overflow-hidden group">
            {pitch.image ? (
              <img
                src={pitch.image}
                alt={pitch.caption}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => navigate(`/pitch/${pitch.id}`)}
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={pitch.video}
                  className="w-full h-full object-cover cursor-pointer"
                  controls={false}
                  muted={isMuted}
                  loop
                  playsInline
                  autoPlay
                  onClick={() => navigate(`/pitch/${pitch.id}`)}
                />
                <button
                  onClick={toggleAudio}
                  className="absolute bottom-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all z-10 cursor-pointer shadow-lg active:scale-90"
                  title={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? <IoVolumeMute size={18} /> : <IoVolumeHigh size={18} />}
                </button>
              </>
            )}
          </div>
        )}

        {/* Actions & Content */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              {/* Support (handshake) button - Icon only */}
              <button
                onClick={handleSupport}
                className={`cursor-pointer transition-colors ${isSupported ? 'text-evoa' : isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
                title={isSupported ? "Supported" : "Support"}
              >
                <FaHandshake size={20} />
              </button>

              {/* Comment button - Icon only */}
              <button
                onClick={handleCommentClick}
                className={`cursor-pointer transition-colors ${isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
                title="Comment"
              >
                <FaRegComment size={18} />
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
              onClick={handleSave}
              className={`cursor-pointer transition-colors ${isSaved ? 'text-evoa' : isDark ? 'text-white hover:text-white/80' : 'text-black hover:text-gray-700'}`}
              title={isSaved ? "Saved" : "Save"}
            >
              {isSaved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
            </button>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 mb-2 text-xs font-medium">
            <span className={isDark ? 'text-white/60' : 'text-black/60'}>
              {likesCount} {likesCount === 1 ? 'support' : 'supports'}
            </span>
            <span className={isDark ? 'text-white/60' : 'text-black/60'}>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
            <span className={isDark ? 'text-white/60' : 'text-black/60'}>
              {pitch.views || 0} views
            </span>
            <span className={isDark ? 'text-white/60' : 'text-black/60'}>
              {pitch.clickthroughs || 0} clickthroughs
            </span>
          </div>

          {/* Description & Hashtags — Hashtags moved below description, 1-line truncation with ... more / Show Less */}
          {(() => {
            const description = pitch.caption || "";
            const hashtags = pitch.hashtags || "";
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


          {/* Deal Info — Ask banner */}
          {pitch.dealInfo && (
            <div className={`w-full rounded-xl px-4 py-3 mb-3 flex items-center justify-between gap-2 ${
              isDark
                ? 'bg-gradient-to-r from-evoa to-evoa-dark'
                : 'bg-gradient-to-r from-evoa to-[#007A72]'
            }`}>
              <div>
                <span className="text-[10px] text-white/70 uppercase tracking-widest block mb-0.5">Ask</span>
                <span className="text-white font-bold text-sm">₹{pitch.dealInfo.amount || '0'}</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <span className="text-[10px] text-white/70 uppercase tracking-widest block mb-0.5">Equity</span>
                <span className="text-white font-bold text-sm">{pitch.dealInfo.equity || '0'}%</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div>
                <span className="text-[10px] text-white/70 uppercase tracking-widest block mb-0.5">Revenue</span>
                <span className="text-white font-bold text-sm">₹{pitch.dealInfo.revenue || '0'}</span>
              </div>
            </div>
          )}

          {/* View Pitch Deck — Strictly available to Investors & Admins */}
          {(currentUser?.role === 'investor' || currentUser?.role === 'admin') && pitch.pitchDeck && (
            <button
              onClick={() => window.open(pitch.pitchDeck, '_blank')}
              className={`w-full py-2 rounded-lg text-sm font-semibold mb-2 cursor-pointer transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
            >
              View Pitch Deck PDF
            </button>
          )}

          {/* Investors who commented */}
          {pitch.investors && pitch.investors.length > 0 && (
            <div className="mt-2">
              <p className={`text-xs mb-2 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                Investors' Thoughts:
              </p>
              <div className="flex gap-2">
                {pitch.investors.map((investor, idx) => (
                  <div key={idx} className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={investor.avatar}
                      alt={investor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

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
      <ReelCommentSheet
        isOpen={commentSheetOpen}
        onClose={() => setCommentSheetOpen(false)}
        pitchId={pitch.id}
        pitchTitle={pitch.username}
        onCommentAdded={() => setCommentCount(c => c + 1)}
      />
    </>
  );
}
