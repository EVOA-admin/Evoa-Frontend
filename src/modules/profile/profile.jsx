import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import ensureUrl from "../../utils/ensureUrl";
import {
  FaEdit, FaCamera, FaMapMarkerAlt, FaLink,
  FaCalendarAlt, FaEnvelope, FaPhone,
  FaLinkedin, FaTwitter, FaInstagram,
  FaHeart, FaRegComment,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { getCurrentUserProfile } from "../../services/usersService";
import { getStartupDetails } from "../../services/startupsService";
import { useAuth } from "../../contexts/AuthContext";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";

// Lazy-load ambassador dashboard — only loaded when user opens it
const AmbassadorDashboard = lazy(() =>
  import("../ambassador/AmbassadorDashboard")
);

/* ─── 3-dot Menu CSS ─── */
const MENU_CSS = `
.profile-dot-btn {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
  background: none; border: 1px solid transparent;
  cursor: pointer; font-size: 18px; font-weight: 700;
  line-height: 1; transition: all .2s;
  letter-spacing: .04em;
}
.profile-dot-btn:hover {
  border-color: rgba(0,184,169,.35);
  background: rgba(0,184,169,.07);
}
.profile-dot-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 172px;
  border-radius: 12px;
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 12px 40px rgba(0,0,0,.45);
  animation: menu-in .15s cubic-bezier(.23,1,.32,1);
}
@keyframes menu-in {
  from { opacity:0; transform:translateY(-6px) scale(.97) }
  to   { opacity:1; transform:translateY(0)    scale(1)   }
}
.profile-dot-menu-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 11px 16px;
  background: none; border: none; cursor: pointer;
  font-size: 13px; font-weight: 500; text-align: left;
  transition: background .15s;
}
`;

export default function Profile() {
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const isDark = theme === "dark";

  const [user, setUser]         = useState(null);
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab]         = useState("posts");
  const [activeSection, setActiveSection] = useState("main"); // 'main' | 'ambassador'
  const [menuOpen, setMenuOpen]           = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => { fetchProfileData(); }, [authUser]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUserProfile();

      let profileData = {
        id: userData.data.id,
        username: userData.data.username || userData.data.email.split("@")[0],
        displayName: userData.data.fullName,
        bio: userData.data.bio || "No bio yet.",
        profilePhoto: userData.data.avatarUrl || "https://i.pravatar.cc/150?img=1",
        coverPhoto: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1200",
        isVerified: false,
        role: userData.data.role,
        location: userData.data.location || "",
        website: userData.data.website || "",
        joinedDate: new Date(userData.data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
        email: userData.data.email,
        phone: "",
        education: "",
        experience: "",
        followers: 0,
        following: 0,
        posts: 0,
        links: {},
      };

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
          isVerified: true,
          location: startup.location
            ? `${startup.location.city}, ${startup.location.country}`
            : profileData.location,
          website: startup.website || profileData.website,
          followers: startup.followerCount || 0,
          following: 0,
          posts: startup.reels ? startup.reels.length : 0,
          links: startup.socialLinks || {},
        };

        if (startup.reels) {
          setPosts(
            startup.reels.map((reel) => ({
              id: reel.id,
              image: reel.thumbnailUrl || reel.videoUrl,
              caption: reel.description,
              tags: reel.hashtags || [],
              likes: reel.likeCount,
              comments: reel.commentCount,
              shares: reel.shareCount,
              timeAgo: new Date(reel.createdAt).toLocaleDateString(),
              liked: false,
              saved: false,
            }))
          );
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
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // ── Colors ──
  const cl = (d, l) => (isDark ? d : l);
  const btnBg    = cl("rgba(255,255,255,.07)", "rgba(0,0,0,.06)");
  const btnColor = cl("rgba(244,240,232,.8)", "rgba(26,26,26,.8)");
  const menuBg   = cl("#1a1a1c", "#ffffff");
  const menuBdr  = cl("rgba(255,255,255,.1)", "rgba(0,0,0,.1)");
  const menuHov  = cl("rgba(0,184,169,.08)", "rgba(0,184,169,.06)");
  const menuTxt  = cl("#F4F0E8", "#111111");

  if (loading) {
    return (
      <AppShell>
        <AppHeader title="Profile" showThemeToggle={true} />
        <div className={`flex items-center justify-center h-40 ${isDark ? "text-white" : "text-black"}`}>
          Loading...
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <AppHeader title="Profile" showThemeToggle={true} />
        <div className={`flex items-center justify-center h-40 ${isDark ? "text-white" : "text-black"}`}>
          User not found
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <style>{MENU_CSS}</style>
      <AppHeader title="Profile" showThemeToggle={true} />

      <main className="pb-4">
        {/* Cover Photo */}
        <div className="relative h-36 overflow-hidden">
          <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
          <button className="absolute top-3 right-3 p-2 rounded-full backdrop-blur-md bg-black/50 text-white">
            <FaCamera size={14} />
          </button>
        </div>

        <div className="px-4">
          {/* Profile Header */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-3 ring-black border-2 border-[#00B8A9]">
                <img src={user.profilePhoto} alt={user.displayName} className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 p-1 rounded-full bg-black/70 text-white">
                <FaCamera size={10} />
              </button>
            </div>

            {/* Edit Profile + 3-dot Menu */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isDark
                  ? "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
              >
                <FaEdit size={12} />
                Edit Profile
              </button>

              {/* ⋮ 3-dot button */}
              <div style={{ position: "relative" }} ref={menuRef}>
                <button
                  id="profile-menu-btn"
                  className="profile-dot-btn"
                  style={{ color: btnColor, background: btnBg }}
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="More options"
                  aria-expanded={menuOpen}
                >
                  ⋮
                </button>

                {menuOpen && (
                  <div
                    className="profile-dot-menu"
                    style={{ background: menuBg, border: `1px solid ${menuBdr}` }}
                    role="menu"
                  >
                    {/* Edit Profile */}
                    <button
                      className="profile-dot-menu-item"
                      style={{ color: menuTxt }}
                      onMouseEnter={e => e.currentTarget.style.background = menuHov}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit Profile
                    </button>

                    {/* Divider */}
                    <div style={{ height: 1, background: menuBdr, margin: "2px 0" }} />

                    {/* Ambassador Program */}
                    <button
                      id="open-ambassador-btn"
                      className="profile-dot-menu-item"
                      style={{ color: "#C9A84C" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => { setActiveSection("ambassador"); setMenuOpen(false); }}
                      role="menuitem"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Ambassador Program
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── AMBASSADOR SECTION ── */}
          {activeSection === "ambassador" ? (
            <Suspense fallback={
              <div style={{ padding: "32px 0", textAlign: "center" }}>
                <div style={{ width: 32, height: 32, border: "3px solid rgba(201,168,76,.2)", borderTopColor: "#C9A84C", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              </div>
            }>
              <AmbassadorDashboard onBack={() => setActiveSection("main")} />
            </Suspense>
          ) : (
            <>
              {/* Name + handle */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className={`text-lg font-bold ${isDark ? "text-white" : "text-black"}`}>{user.displayName}</h1>
                  {user.isVerified && <MdVerified className="text-[#00B8A9]" size={18} />}
                </div>
                <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>@{user.username}</p>
                {user.bio && (
                  <p className={`text-sm mt-2 leading-relaxed ${isDark ? "text-white/80" : "text-gray-700"}`}>{user.bio}</p>
                )}
              </div>

              {/* Meta info */}
              <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs mb-4 ${isDark ? "text-white/50" : "text-gray-500"}`}>
                {user.location && <span className="flex items-center gap-1"><FaMapMarkerAlt size={11} />{user.location}</span>}
                {user.website && (
                  <a href={ensureUrl(user.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#00B8A9]">
                    <FaLink size={11} />{user.website.replace(/^https?:\/\//, "").slice(0, 28)}
                  </a>
                )}
                <span className="flex items-center gap-1"><FaCalendarAlt size={11} />Joined {user.joinedDate}</span>
              </div>

              {/* Stats */}
              <div className={`flex gap-6 py-3 border-y mb-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                {[{ label: "Posts", value: user.posts }, { label: "Followers", value: user.followers }, { label: "Following", value: user.following }].map(s => (
                  <div key={s.label}>
                    <p className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{formatNumber(s.value)}</p>
                    <p className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Contact info */}
              {(user.email || user.phone) && (
                <div className={`rounded-xl p-3.5 mb-4 space-y-2.5 ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <FaEnvelope size={13} className="text-[#00B8A9]" />
                      <p className={`text-sm truncate ${isDark ? "text-white/80" : "text-gray-700"}`}>{user.email}</p>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <FaPhone size={13} className="text-[#00B8A9]" />
                      <p className={`text-sm ${isDark ? "text-white/80" : "text-gray-700"}`}>{user.phone}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Social links */}
              {(user.links.linkedin || user.links.twitter || user.links.instagram) && (
                <div className="flex gap-2 mb-4">
                  {user.links.linkedin && (
                    <a href={ensureUrl(user.links.linkedin)} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium flex-1 justify-center ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"}`}>
                      <FaLinkedin size={15} /> LinkedIn
                    </a>
                  )}
                  {user.links.twitter && (
                    <a href={ensureUrl(user.links.twitter)} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium flex-1 justify-center ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"}`}>
                      <FaTwitter size={15} /> Twitter
                    </a>
                  )}
                  {user.links.instagram && (
                    <a href={ensureUrl(user.links.instagram)} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium flex-1 justify-center ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"}`}>
                      <FaInstagram size={15} /> Instagram
                    </a>
                  )}
                </div>
              )}

              {/* Tabs */}
              <div className={`flex border-b mb-4 ${isDark ? "border-white/10" : "border-gray-200"}`}>
                {["posts", "saved"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-all ${activeTab === tab
                      ? "border-[#00B8A9] text-[#00B8A9]"
                      : isDark ? "border-transparent text-white/50 hover:text-white" : "border-transparent text-gray-400 hover:text-black"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Posts grid */}
              <div className="grid grid-cols-3 gap-1 pb-4">
                {posts.map((post) => (
                  <div key={post.id} className="aspect-square rounded-lg overflow-hidden relative cursor-pointer group">
                    <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-3 text-white text-xs font-semibold">
                        <span className="flex items-center gap-1"><FaHeart size={13} />{formatNumber(post.likes)}</span>
                        <span className="flex items-center gap-1"><FaRegComment size={13} />{formatNumber(post.comments)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className={`col-span-3 py-12 text-center text-sm ${isDark ? "text-white/40" : "text-gray-400"}`}>
                    No posts yet
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </AppShell>
  );
}
