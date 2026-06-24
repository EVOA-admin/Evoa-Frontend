import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { HiSun, HiMoon } from "react-icons/hi";
import { FaHome, FaSearch, FaPlay, FaBell, FaUser, FaPlus, FaInbox } from "react-icons/fa";
import logo from "../../assets/logo.avif";
import { getUnreadCount } from "../../services/chatService";
import { getNotifications } from "../../services/notificationsService";

/* ─── Styles ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap');

/* Sidebar is ONLY visible on desktop (lg+) */
.ds-sidebar {
  display: none;
}

@media (min-width: 1024px) {
  .ds-sidebar {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 16px;
    top: 16px;
    height: calc(100vh - 32px);
    height: calc(100dvh - 32px);
    width: 72px;
    z-index: 55;
    transition: width .25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow .25s;
    overflow: hidden;
    border-radius: 28px;
  }

  /* Expand to full width at xl */
  @media (min-width: 1280px) {
    .ds-sidebar { width: 240px; }
  }
}

/* Glass backgrounds */
.ds-sidebar.dark {
  background: rgba(10,10,16,0.85);
  backdrop-filter: blur(32px) saturate(1.6);
  -webkit-backdrop-filter: blur(32px) saturate(1.6);
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.4);
}
.ds-sidebar.light {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(32px) saturate(1.6);
  -webkit-backdrop-filter: blur(32px) saturate(1.6);
  border: 1px solid rgba(255,255,255,1);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.08);
}

/* ── Logo area ── */
.ds-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 12px;
  flex-shrink: 0;
  overflow: hidden;
  min-height: 64px;
}
.ds-logo-img {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  object-fit: contain;
  flex-shrink: 0;
  box-shadow: 0 0 12px rgba(0,184,169,0.3);
}
.ds-logo-word {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: .12em;
  white-space: nowrap;
  overflow: hidden;
  opacity: 0;
  width: 0;
  transition: opacity .2s .05s, width .25s;
}
@media (min-width: 1280px) {
  .ds-logo-word { opacity: 1; width: auto; }
}
.ds-sidebar.dark  .ds-logo-word { color: #F4F0E8; }
.ds-sidebar.light .ds-logo-word { color: #1a1a1a; }
.ds-logo-word span { color: #E8341A; text-shadow: 0 0 16px rgba(232,52,26,0.45); }

/* Divider */
.ds-divider {
  height: 1px;
  margin: 4px 12px;
  flex-shrink: 0;
}
.ds-sidebar.dark  .ds-divider { background: rgba(255,255,255,0.07); }
.ds-sidebar.light .ds-divider { background: rgba(0,0,0,0.08); }

/* ── Nav ── */
.ds-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 8px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}
.ds-nav::-webkit-scrollbar { display: none; }

/* Nav items */
.ds-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all .2s cubic-bezier(0.22, 1, 0.36, 1);
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
  min-height: 46px;
  white-space: nowrap;
}
.ds-nav-item:active { transform: scale(0.96); }

/* Inactive */
.ds-sidebar.dark  .ds-nav-item { color: rgba(244,240,232,0.4); }
.ds-sidebar.light .ds-nav-item { color: rgba(26,26,26,0.45); }

/* Hover */
.ds-sidebar.dark  .ds-nav-item:not(.active):hover {
  background: rgba(255,255,255,0.06);
  color: rgba(244,240,232,0.8);
}
.ds-sidebar.light .ds-nav-item:not(.active):hover {
  background: rgba(0,0,0,0.05);
  color: rgba(26,26,26,0.85);
}

/* Active */
.ds-nav-item.active {
  color: var(--evoa-accent-primary) !important;
  background: rgba(0,184,169,0.12);
  box-shadow:
    inset 0 1px 0 rgba(0,184,169,0.2),
    0 0 14px rgba(0,184,169,0.1);
}

/* Nav label */
.ds-nav-label {
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity .2s .05s, width .25s;
  letter-spacing: -0.01em;
}
@media (min-width: 1280px) {
  .ds-nav-label { opacity: 1; width: auto; }
}

/* Icon wrapper */
.ds-nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  flex-shrink: 0;
  position: relative;
}

/* Badge */
.ds-nav-badge {
  position: absolute;
  top: -4px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #E8341A, #c02810);
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  font-family: 'DM Mono', monospace;
  box-shadow: 0 0 0 1.5px rgba(10,10,16,0.8), 0 2px 8px rgba(232,52,26,0.5);
  animation: badge-pulse-glow 2s ease-in-out infinite;
}

/* ── Create Post button ── */
.ds-create-btn {
  margin: 8px 8px 4px;
  padding: 11px 12px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  background: linear-gradient(135deg, var(--evoa-accent-light) 0%, var(--evoa-accent-primary) 50%, var(--evoa-accent-darker) 100%);
  color: #fff;
  box-shadow:
    0 4px 20px rgba(0,184,169,0.4),
    0 0 0 1px rgba(0,184,169,0.3),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transition: transform .2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow .2s;
  white-space: nowrap;
  overflow: hidden;
  flex-shrink: 0;
}
.ds-create-btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 6px 28px rgba(0,184,169,0.55),
    0 0 0 1px rgba(0,184,169,0.4),
    inset 0 1px 0 rgba(255,255,255,0.25);
}
.ds-create-btn:active { transform: scale(0.97); }

.ds-create-icon { flex-shrink: 0; }
.ds-create-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity .2s .05s, width .25s;
}
@media (min-width: 1280px) {
  .ds-create-label { opacity: 1; width: auto; }
}

/* ── Bottom controls ── */
.ds-bottom {
  padding: 8px 8px 12px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ds-theme-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all .2s;
  overflow: hidden;
  white-space: nowrap;
  min-height: 46px;
}
.ds-sidebar.dark  .ds-theme-btn { color: rgba(244,240,232,0.4); }
.ds-sidebar.dark  .ds-theme-btn:hover {
  color: #E8341A;
  background: rgba(232,52,26,0.08);
}
.ds-sidebar.light .ds-theme-btn { color: rgba(26,26,26,0.4); }
.ds-sidebar.light .ds-theme-btn:hover {
  color: #E8341A;
  background: rgba(232,52,26,0.06);
}
.ds-theme-label {
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity .2s .05s, width .25s;
}
@media (min-width: 1280px) {
  .ds-theme-label { opacity: 1; width: auto; }
}

/* ── User chip ── */
.ds-user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 16px;
  cursor: pointer;
  overflow: hidden;
  min-height: 52px;
  border: none;
  background: transparent;
  transition: background .2s;
  flex-shrink: 0;
}
.ds-sidebar.dark  .ds-user-chip:hover { background: rgba(255,255,255,0.06); }
.ds-sidebar.light .ds-user-chip:hover { background: rgba(0,0,0,0.05); }

.ds-user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid rgba(0,184,169,0.4);
  box-shadow: 0 0 8px rgba(0,184,169,0.2);
  flex-shrink: 0;
}

.ds-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  opacity: 0;
  width: 0;
  overflow: hidden;
  transition: opacity .2s .05s, width .25s;
}
@media (min-width: 1280px) {
  .ds-user-info { opacity: 1; width: auto; }
}
.ds-user-name {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.01em;
  white-space: nowrap;
}
.ds-sidebar.dark  .ds-user-name { color: #F4F0E8; }
.ds-sidebar.light .ds-user-name { color: #1a1a1a; }
.ds-user-role {
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}
.ds-sidebar.dark  .ds-user-role { color: rgba(244,240,232,0.4); }
.ds-sidebar.light .ds-user-role { color: rgba(26,26,26,0.45); }
`;

const ROLE_HOME = {
  startup: "/startup",
  investor: "/investor",
  incubator: "/incubator",
  viewer: "/viewer",
};

const ROLE_PROFILE = {
  startup: "/startup/profile",
  investor: "/investor/profile",
  incubator: "/incubator/profile",
  viewer: "/viewer/profile",
};

/**
 * DesktopSidebar — fixed glass left sidebar for desktop (≥1024px).
 * Hidden on mobile/tablet via CSS (display:none below lg breakpoint).
 *
 * Props:
 *   onCreatePost — callback to open CreateContentModal
 */
export default function DesktopSidebar({ onCreatePost }) {
  const { theme, toggleTheme, openThemeModal } = useTheme();
  const { user, userRole } = useAuth();
  const isDark = theme === "dark";
  const cls = isDark ? "dark" : "light";
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadChat, setUnreadChat] = useState(0);
  const [unreadNotif, setUnreadNotif] = useState(0);

  const role = userRole || user?.role || "viewer";
  const home = ROLE_HOME[role] || "/viewer";
  const profile = ROLE_PROFILE[role] || "/viewer/profile";

  // Fetch badge counts
  useEffect(() => {
    getUnreadCount()
      .then(r => {
        const d = r?.data?.data || r?.data || {};
        setUnreadChat((d.unreadMessages || 0) + (d.pendingRequests || 0));
      }).catch(() => { });

    getNotifications()
      .then(r => {
        const data = r?.data?.data || r?.data || [];
        const list = Array.isArray(data) ? data : [];
        setUnreadNotif(list.filter(n => !n.isRead).length);
      }).catch(() => { });
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === home) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { key: "home", icon: FaHome, label: "Home", path: home },
    { key: "explore", icon: FaSearch, label: "Explore", path: "/explore" },
    { key: "pitch", icon: FaPlay, label: "Pitch Reels", path: "/pitch/hashtag" },
    { key: "alerts", icon: FaBell, label: "Alerts", path: "/notifications", badge: unreadNotif },
    { key: "profile", icon: FaUser, label: "Profile", path: profile },
    { key: "inbox", icon: FaInbox, label: "Messages", path: "/inbox", badge: unreadChat },
  ];

  const avatarSrc = user?.avatarUrl
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=00B8A9&color=fff&size=68`;

  return (
    <aside className={`ds-sidebar ${cls}`} aria-label="Main navigation">
      <style>{CSS}</style>

      {/* Logo */}
      <div className="ds-logo">
        <img src={logo} alt="EVO-A" className="ds-logo-img" />
        <span className="ds-logo-word">EVO<span>-A</span></span>
      </div>

      <div className="ds-divider" />

      {/* Create Post */}
      <button
        className="ds-create-btn"
        onClick={onCreatePost}
        title="Create Post"
        aria-label="Create Post"
      >
        <FaPlus size={16} className="ds-create-icon" />
        <span className="ds-create-label">Create Post</span>
      </button>

      {/* Nav items */}
      <nav className="ds-nav">
        {navItems.map(({ key, icon: Icon, label, path, badge }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className={`ds-nav-item${isActive(path) ? " active" : ""}`}
            aria-label={label}
            aria-current={isActive(path) ? "page" : undefined}
          >
            <span className="ds-nav-icon">
              <Icon size={20} />
              {badge > 0 && (
                <span className="ds-nav-badge">{badge > 9 ? "9+" : badge}</span>
              )}
            </span>
            <span className="ds-nav-label">{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="ds-divider" />
      <div className="ds-bottom">
        {/* User chip */}
        <button className="ds-user-chip" onClick={() => navigate(profile)} aria-label="Your profile">
          <div className="ds-user-avatar">
            <img src={avatarSrc} alt={user?.fullName || "Profile"} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=U&background=00B8A9&color=fff&size=68`; }} />
          </div>
          <div className="ds-user-info">
            <span className="ds-user-name truncate">{user?.fullName || user?.email?.split("@")[0] || "Profile"}</span>
            <span className="ds-user-role">{role}</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
