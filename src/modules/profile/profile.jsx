import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import ensureUrl from "../../utils/ensureUrl";
import {
  FaBell,
  FaSearch,
  FaEdit,
  FaCamera,
  FaMapMarkerAlt,
  FaLink,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaRegComment,
  FaShare,
  FaBookmark,
  FaRegBookmark
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import logo from "../../assets/logo.avif";

import { getCurrentUserProfile } from "../../services/usersService";
import { getStartupDetails } from "../../services/startupsService";
import { useAuth } from "../../contexts/AuthContext";

export default function Profile() {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchProfileData();
  }, [authUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // 1. Get User Profile (if not already in authUser, or to get fresh data)
      const userData = await getCurrentUserProfile(); // Returns { ...user, startups: [...] }

      let profileData = {
        id: userData.data.id,
        username: userData.data.username || userData.data.email.split('@')[0],
        displayName: userData.data.fullName,
        bio: userData.data.bio || 'No bio yet.',
        profilePhoto: userData.data.avatarUrl || 'https://i.pravatar.cc/150?img=1',
        coverPhoto: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200', // Default cover
        isVerified: false,
        role: userData.data.role,
        location: userData.data.location || '',
        website: userData.data.website || '',
        joinedDate: new Date(userData.data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        email: userData.data.email,
        phone: '', // Not in User entity?
        education: '',
        experience: '',
        followers: 0,
        following: 0,
        posts: 0,
        links: {}
      };

      // 2. If user has startup(s), fetch startup details to populate profile
      // For now, if role is 'startup', use the first startup
      if (userData.data.startups && userData.data.startups.length > 0) {
        const startupId = userData.data.startups[0].id;
        const startupData = await getStartupDetails(startupId);
        const startup = startupData.data;

        profileData = {
          ...profileData,
          displayName: startup.name,
          username: startup.username || profileData.username,
          bio: startup.description || startup.tagline || profileData.bio,
          profilePhoto: startup.logoUrl || profileData.profilePhoto,
          isVerified: true, // Startups are verified?
          location: startup.location ? `${startup.location.city}, ${startup.location.country}` : profileData.location,
          website: startup.website || profileData.website,
          followers: startup.followerCount || 0,
          following: 0, // Startup doesn't follow?
          posts: startup.reels ? startup.reels.length : 0,
          links: startup.socialLinks || {},
          // Additional startup fields
          education: '', // Startups don't have education
          experience: '',
        };

        // Map reels to posts
        if (startup.reels) {
          const mappedPosts = startup.reels.map(reel => ({
            id: reel.id,
            image: reel.thumbnailUrl || reel.videoUrl, // Use video as image if no thumb?
            caption: reel.description,
            tags: reel.hashtags || [],
            likes: reel.likeCount,
            comments: reel.commentCount,
            shares: reel.shareCount,
            timeAgo: new Date(reel.createdAt).toLocaleDateString(), // TODO: relative time
            liked: false, // Default
            saved: false
          }));
          setPosts(mappedPosts);
        }
      }

      setUser(profileData);
    } catch (err) {
      console.error("Failed to fetch profile data:", err);
    } finally {
      setLoading(false);
    }
  };


  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const toggleLike = (postId) => {
    console.log('Toggle like:', postId);
  };

  const toggleSave = (postId) => {
    console.log('Toggle save:', postId);
  };

  if (loading) {
    return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>Loading...</div>;
  }

  if (!user) {
    return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>User not found</div>;
  }


  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${isDark ? 'bg-black border-b border-white/10' : 'bg-white border-b border-gray-200'}`}>
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
            >
              <FaArrowLeft size={18} className={isDark ? 'text-white' : 'text-black'} />
            </button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="EVO-A" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
              <span className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>EVO-A</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => navigate('/explore')} className={isDark ? 'text-white' : 'text-black'}>
              <FaSearch size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button onClick={() => navigate('/notifications')} className={isDark ? 'text-white' : 'text-black'}>
              <FaBell size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-12 sm:pt-16">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          {/* Cover Photo */}
          <div className="relative h-48 sm:h-64 md:h-80 rounded-b-2xl overflow-hidden mb-4">
            <img
              src={user.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <button
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${isDark ? 'bg-black/50 text-white hover:bg-black/70' : 'bg-white/50 text-black hover:bg-white/70'
                }`}
            >
              <FaCamera size={16} />
            </button>
          </div>

          {/* Profile Info Section */}
          <div className="px-3 sm:px-6">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-6">
              <div className="relative -mt-16 sm:-mt-20">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-black">
                  <img
                    src={user.profilePhoto}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                  <button
                    className={`absolute bottom-0 right-0 p-1.5 rounded-full backdrop-blur-md transition-all ${isDark ? 'bg-black/50 text-white hover:bg-black/70' : 'bg-white/50 text-black hover:bg-white/70'
                      }`}
                  >
                    <FaCamera size={12} />
                  </button>
                </div>
              </div>

              <div className="flex-1 w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                    {user.displayName}
                  </h1>
                  {user.isVerified && (
                    <MdVerified className="text-[#00B8A9]" size={24} />
                  )}
                  <button
                    className={`ml-auto sm:ml-0 px-4 py-2.5 rounded-xl font-semibold transition-all ${isDark
                      ? 'bg-white/5 text-white hover:bg-white/10'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    <FaEdit size={14} className="inline mr-2" />
                    Edit Profile
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-500 mb-3">
                  <span className="truncate">@{user.username}</span>
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt size={12} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user.website && (
                    <a
                      href={ensureUrl(user.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#00B8A9] hover:underline"
                    >
                      <FaLink size={12} />
                      <span className="truncate max-w-[150px]">{user.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt size={12} />
                    <span>Joined {user.joinedDate}</span>
                  </div>
                </div>
                <p className={`text-sm sm:text-base mb-4 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  {user.bio}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className={`rounded-2xl p-4 sm:p-5 mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'
              }`}>
              <div className="flex items-center justify-around gap-4">
                <div className="text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(user.posts)}
                  </p>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Posts</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(user.followers)}
                  </p>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Followers</p>
                </div>
                <div className="text-center">
                  <p className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatNumber(user.following)}
                  </p>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Following</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {user.education && (
                <div className={`flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer ${isDark
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white'
                    }`}>
                    <FaGraduationCap className={isDark ? 'text-white' : 'text-gray-700'} size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Education</p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.education}</p>
                  </div>
                </div>
              )}
              {user.experience && (
                <div className={`flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer ${isDark
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white'
                    }`}>
                    <FaBriefcase className={isDark ? 'text-white' : 'text-gray-700'} size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Experience</p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.experience}</p>
                  </div>
                </div>
              )}
              {user.email && (
                <div className={`flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer ${isDark
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white'
                    }`}>
                    <FaEnvelope className={isDark ? 'text-white' : 'text-gray-700'} size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Email</p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
                  </div>
                </div>
              )}
              {user.phone && (
                <div className={`flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer ${isDark
                  ? 'bg-white/5 hover:bg-white/10'
                  : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                  <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white'
                    }`}>
                    <FaPhone className={isDark ? 'text-white' : 'text-gray-700'} size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs mb-0.5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Phone</p>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.phone}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {(user.links.linkedin || user.links.twitter || user.links.instagram) && (
              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'
                }`}>
                <div className="flex items-center gap-3">
                  {user.links.linkedin && (
                    <a
                      href={ensureUrl(user.links.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all flex-1 ${isDark
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <FaLinkedin size={18} />
                      <span className="text-sm font-semibold">LinkedIn</span>
                    </a>
                  )}
                  {user.links.twitter && (
                    <a
                      href={ensureUrl(user.links.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all flex-1 ${isDark
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <FaTwitter size={18} />
                      <span className="text-sm font-semibold">Twitter</span>
                    </a>
                  )}
                  {user.links.instagram && (
                    <a
                      href={ensureUrl(user.links.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all flex-1 ${isDark
                        ? 'bg-white/5 text-white hover:bg-white/10'
                        : 'bg-white text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <FaInstagram size={18} />
                      <span className="text-sm font-semibold">Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-white/10 mb-6">
              {['posts', 'saved', 'tagged'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-semibold capitalize transition-all border-b-2 ${activeTab === tab
                    ? isDark
                      ? 'text-white border-[#00B8A9]'
                      : 'text-black border-[#00B8A9]'
                    : isDark
                      ? 'text-white/60 border-transparent hover:text-white'
                      : 'text-gray-500 border-transparent hover:text-black'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-20">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-2xl overflow-hidden transition-all ${isDark ? 'bg-white/5' : 'bg-gray-100'
                    } hover:opacity-90`}
                >
                  <div className="relative aspect-square">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-2">
                          <FaHeart size={18} />
                          <span className="font-semibold">{formatNumber(post.likeCount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaRegComment size={18} />
                          <span className="font-semibold">{formatNumber(post.commentCount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
