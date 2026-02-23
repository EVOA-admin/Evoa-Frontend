import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHandshake, FaRegComment, FaRegPaperPlane, FaExternalLinkAlt
} from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import ensureUrl from "../../utils/ensureUrl";

export default function PitchCard({ pitch, onLike, onComment, onShare, onSave, onFollow }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [isSupported, setIsSupported] = useState(pitch.liked || false);
  const [likesCount, setLikesCount] = useState(pitch.likes || 0);

  const handleSupport = () => {
    const newState = !isSupported;
    setIsSupported(newState);
    setLikesCount(prev => newState ? prev + 1 : Math.max(0, prev - 1));
    if (onLike) onLike(pitch.id);
  };

  const handleComment = () => {
    if (onComment) onComment(pitch.id);
  };

  const handleShare = () => {
    if (onShare) onShare(pitch.id);
  };

  return (
    <div className={`rounded-lg overflow-hidden transition-colors duration-300 mb-4 ${isDark ? 'bg-black border border-white/10' : 'bg-white border border-gray-200'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={pitch.profilePhoto || 'https://i.pravatar.cc/150?img=1'}
              alt={pitch.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-black'}`}>
                {pitch.username}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onFollow && onFollow(pitch.startupId); }}
                className={`text-xs px-2 py-0.5 rounded ${pitch.isFollowing
                  ? 'bg-transparent border border-current opacity-60'
                  : (isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20')
                  }`}
              >
                {pitch.isFollowing ? 'Following' : '+ Follow'}
              </button>
            </div>
            {pitch.summary && (
              <p className={`text-xs ${isDark ? 'text-white/60' : 'text-black/60'}`}>
                {pitch.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pitch Media */}
      {/* Pitch Media */}
      {
        (pitch.image || pitch.video) && (
          <div className="relative w-full aspect-square bg-gray-200">
            {pitch.image ? (
              <img
                src={pitch.image}
                alt={pitch.caption}
                className="w-full h-full object-cover"
                onClick={() => navigate(`/pitch/${pitch.id}`)}
              />
            ) : (
              <video
                src={pitch.video}
                className="w-full h-full object-cover"
                controls={false}
                muted
                loop
                playsInline
                onClick={() => navigate(`/pitch/${pitch.id}`)}
                onMouseOver={e => e.target.play().catch(() => { })}
                onMouseOut={e => e.target.pause()}
              />
            )}
          </div>
        )
      }

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* Support (handshake) button */}
            <button onClick={handleSupport} className={`flex items-center gap-1.5 transition-colors ${isSupported ? 'text-[#00B8A9]' : isDark ? 'text-white' : 'text-black'}`}>
              <FaHandshake size={22} />
              <span className="text-xs font-semibold">{isSupported ? 'Supported' : 'Support'}</span>
            </button>
            <button onClick={handleComment} className={isDark ? 'text-white' : 'text-black'}>
              <FaRegComment size={20} />
            </button>
            <button onClick={handleShare} className={isDark ? 'text-white' : 'text-black'}>
              <FaRegPaperPlane size={20} />
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 mb-2 text-xs">
          <span className={isDark ? 'text-white/60' : 'text-black/60'}>
            {likesCount} {likesCount === 1 ? 'support' : 'supports'}
          </span>
          <span className={isDark ? 'text-white/60' : 'text-black/60'}>
            {pitch.views || 0} views
          </span>
          <span className={isDark ? 'text-white/60' : 'text-black/60'}>
            {pitch.clickthroughs || 0} clickthroughs
          </span>
        </div>

        {/* Hashtags */}
        {pitch.hashtags && (
          <div className="mb-2">
            <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {pitch.hashtags}
            </span>
          </div>
        )}

        {/* Description */}
        {pitch.caption && (
          <p className={`text-sm mb-2 ${isDark ? 'text-white/80' : 'text-black/80'}`}>
            {pitch.caption}
          </p>
        )}

        {/* Deal Info */}
        {pitch.dealInfo && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className={`px-3 py-2 rounded-lg transition-all ${isDark
              ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black'
              : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white'
              }`}>
              <span className="text-xs opacity-90 block mb-1">Raising</span>
              <p className="font-bold text-sm">
                ₹{pitch.dealInfo.amount || '0'}
              </p>
            </div>
            <div className={`px-3 py-2 rounded-lg transition-all ${isDark
              ? 'bg-gradient-to-r from-[#80E5FF] to-[#B0FFFA] text-black'
              : 'bg-gradient-to-r from-[#008C81] to-[#00B8A9] text-white'
              }`}>
              <span className="text-xs opacity-90 block mb-1">Equity</span>
              <p className="font-bold text-sm">
                {pitch.dealInfo.equity || '0'}%
              </p>
            </div>
            <div className={`px-3 py-2 rounded-lg transition-all ${isDark
              ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black'
              : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white'
              }`}>
              <span className="text-xs opacity-90 block mb-1">Revenue</span>
              <p className="font-bold text-sm">
                ₹{pitch.dealInfo.revenue || '0'}
              </p>
            </div>
          </div>
        )}

        {/* Links */}
        {pitch.links && (
          <div className="flex flex-wrap gap-2 mb-2">
            {pitch.links.website && (
              <a
                href={ensureUrl(pitch.links.website)}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
              >
                Website <FaExternalLinkAlt size={10} />
              </a>
            )}
            {pitch.links.linkedin && (
              <a
                href={ensureUrl(pitch.links.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
              >
                LinkedIn <FaExternalLinkAlt size={10} />
              </a>
            )}
            {pitch.links.instagram && (
              <a
                href={ensureUrl(pitch.links.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}
              >
                Instagram <FaExternalLinkAlt size={10} />
              </a>
            )}
          </div>
        )}

        {/* View Pitch Deck */}
        {pitch.pitchDeck && (
          <button
            onClick={() => window.open(pitch.pitchDeck, '_blank')}
            className={`w-full py-2 rounded-lg text-sm font-semibold mb-2 ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'
              }`}
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
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              src="https://i.pravatar.cc/150?img=5"
              alt="Your avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="text"
            placeholder="Add a comment..."
            className={`flex-1 bg-transparent border-none outline-none text-sm py-1 ${isDark ? 'text-white placeholder-white/40' : 'text-black placeholder-gray-400'
              }`}
          />
          <button className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Post
          </button>
        </div>
      </div>
    </div >
  );
}

