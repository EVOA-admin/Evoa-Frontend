import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaHome, FaSearch, FaPlay, FaBell, FaUser, FaCalendarAlt } from "react-icons/fa";
import { getNotifications } from "../../services/notificationsService";

/* ─── EVOA BottomNav — Apple Glassmorphism Design System ─── */
const NAV_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&display=swap');

.evoa-bnav {
  position: sticky;
  bottom: 0;
  z-index: 40;
  border-top: 1px solid transparent;
  transition: background .3s, border-color .3s, box-shadow .3s;
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Dark: deep frosted glass dock */
.evoa-bnav.dark {
  background: rgba(10,10,16,0.80);
  border-color: rgba(255,255,255,0.07);
  box-shadow:
    0 -1px 0 rgba(0,184,169,0.10),
    0 -8px 32px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.04);
}

/* Light: frosted white glass with subtle shadow */
.evoa-bnav.light {
  background: rgba(255,255,255,0.84);
  border-color: rgba(255,255,255,0.92);
  box-shadow:
    0 -1px 0 rgba(0,184,169,0.07),
    0 -8px 32px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.95);
}

.evoa-bnav-inner { display: flex; align-items: center; justify-content: space-around; padding: 6px 8px 4px; }

.evoa-bnav-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 16px;
  border-radius: 18px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all .25s cubic-bezier(0.22, 1, 0.36, 1);
  -webkit-tap-highlight-color: transparent;
  min-width: 52px;
}
.evoa-bnav-tab:active { transform: scale(0.86); opacity: 0.85; }

/* default (inactive) */
.evoa-bnav.dark  .evoa-bnav-tab { color: rgba(244,240,232,.3); }
.evoa-bnav.light .evoa-bnav-tab { color: rgba(26,26,26,.32); }

/* active — glass pill background + teal */
.evoa-bnav-tab.active {
  color: var(--evoa-accent-primary) !important;
}

/* Active glass pill highlight */
.evoa-bnav-tab.active::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 18px;
  background: rgba(0,184,169,0.12);
  box-shadow:
    inset 0 1px 0 rgba(0,184,169,0.20),
    0 0 14px rgba(0,184,169,0.12);
}

/* Hover states */
.evoa-bnav.dark  .evoa-bnav-tab:not(.active):hover { color: rgba(244,240,232,.6); }
.evoa-bnav.light .evoa-bnav-tab:not(.active):hover { color: rgba(26,26,26,.6); }

.evoa-bnav-label {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  letter-spacing: .12em;
  text-transform: uppercase;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.evoa-bnav-icon {
  position: relative;
  z-index: 1;
}

/* Active indicator dot — glowing teal */
.evoa-bnav-dot {
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--evoa-accent-primary);
  box-shadow: 0 0 6px rgba(0,184,169,0.8), 0 0 12px rgba(0,184,169,0.4);
  animation: nav-dot-expand 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* Centre Pitch button — dramatic gradient with glow ring */
.evoa-bnav-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--evoa-accent-light) 0%, var(--evoa-accent-primary) 50%, var(--evoa-accent-darker) 100%);
  box-shadow:
    0 0 0 1px rgba(0,184,169,0.35),
    0 4px 20px rgba(0,184,169,0.45),
    0 8px 32px rgba(0,184,169,0.2),
    inset 0 1px 0 rgba(255,255,255,0.25);
  color: #fff !important;
  margin-top: -12px;
  gap: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  transition: transform .25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow .25s;
  -webkit-tap-highlight-color: transparent;
}
.evoa-bnav-center:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow:
    0 0 0 1px rgba(0,184,169,0.5),
    0 6px 24px rgba(0,184,169,0.6),
    0 12px 40px rgba(0,184,169,0.25),
    inset 0 1px 0 rgba(255,255,255,0.3);
}
.evoa-bnav-center:active { transform: scale(0.90); }

/* Badge */
.evoa-bnav-badge {
  position: absolute;
  top: 0px;
  right: 4px;
  min-width: 15px;
  height: 15px;
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
  box-shadow:
    0 0 0 1.5px rgba(10,10,16,0.8),
    0 2px 8px rgba(232,52,26,0.5);
  animation: badge-pulse-glow 2s ease-in-out infinite;
}
`;

const ROLE_HOME    = { startup:"/startup",   investor:"/investor",   incubator:"/incubator",   viewer:"/viewer" };
const ROLE_PROFILE = { startup:"/startup/profile", investor:"/investor/profile", incubator:"/incubator/profile", viewer:"/viewer/profile" };

export default function BottomNav() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cls = isDark ? "dark" : "light";
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();
  const role = userRole || user?.role || "viewer";

  const [unread, setUnread] = React.useState(0);
  React.useEffect(() => {
    getNotifications()
      .then(res => {
        const data = res?.data?.data || res?.data || [];
        const list = Array.isArray(data) ? data : [];
        setUnread(list.filter(n => !n.isRead).length);
      })
      .catch(() => {});
  }, [location.pathname]);

  const home    = ROLE_HOME[role]    || "/viewer";
  const profile = ROLE_PROFILE[role] || "/viewer/profile";

  const tabs = [
    { key:"home",          icon:FaHome,        label:"Home",    path:home },
    { key:"explore",       icon:FaSearch,      label:"Explore", path:"/explore" },
    { key:"pitch",         icon:FaPlay,        label:"Pitch",   path:"/pitch/hashtag", center:true },
    { key:"event",         icon:FaCalendarAlt, label:"Event",   path:"/event" },
    { key:"profile",       icon:FaUser,        label:"Profile", path:profile },
  ];

  const isActive = (path) => {
    if (path === home) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`evoa-bnav ${cls}`}>
      <style>{NAV_CSS}</style>
      <div className="evoa-bnav-inner">
        {tabs.map(({ key, icon:Icon, label, path, center, badge }) => {
          const active = isActive(path);
          if (center) {
            return (
              <button key={key} className="evoa-bnav-center" onClick={() => navigate(path)} title={label} aria-label={label}>
                <Icon size={18} />
              </button>
            );
          }
          return (
            <button
              key={key}
              className={`evoa-bnav-tab${active ? " active" : ""}`}
              onClick={() => navigate(path)}
              aria-label={label}
            >
              <div className="evoa-bnav-icon" style={{ position:"relative" }}>
                <Icon size={19} />
                {badge > 0 && (
                  <span className="evoa-bnav-badge">{badge > 9 ? "9+" : badge}</span>
                )}
              </div>
              <span className="evoa-bnav-label">{label}</span>
              {active && <span className="evoa-bnav-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
