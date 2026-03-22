import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaHome, FaSearch, FaPlay, FaBell, FaUser } from "react-icons/fa";
import { getNotifications } from "../../services/notificationsService";

/* ─── EVOA BottomNav ─── */
const NAV_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&display=swap');

.evoa-bnav {
  position: sticky;
  bottom: 0;
  z-index: 40;
  border-top: 1px solid transparent;
  transition: background .3s, border-color .3s;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.evoa-bnav.dark  { background: rgba(6,6,7,.97); border-color: rgba(244,240,232,.06); }
.evoa-bnav.light { background: rgba(250,248,245,.97); border-color: rgba(26,26,26,.08); }

.evoa-bnav-inner { display: flex; align-items: center; justify-content: space-around; padding: 4px 8px; }

.evoa-bnav-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 12px;
  border-radius: 16px;
  border: none;
  background: none;
  cursor: pointer;
  transition: all .2s;
  -webkit-tap-highlight-color: transparent;
}
.evoa-bnav-tab:active { transform: scale(.88); }

/* default (inactive) */
.evoa-bnav.dark  .evoa-bnav-tab { color: rgba(244,240,232,.28); }
.evoa-bnav.light .evoa-bnav-tab { color: rgba(26,26,26,.3); }

/* active */
.evoa-bnav-tab.active { color: #00B8A9 !important; }

.evoa-bnav-label {
  font-family: 'DM Mono', monospace;
  font-size: 8px;
  letter-spacing: .12em;
  text-transform: uppercase;
  line-height: 1;
}

/* Active indicator dot */
.evoa-bnav-dot {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #00B8A9;
}

/* Centre Pitch button */
.evoa-bnav-center {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #00B8A9, #007a73);
  box-shadow: 0 4px 16px rgba(0,184,169,.35);
  color: #fff !important;
  margin-top: -10px;
  gap: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  -webkit-tap-highlight-color: transparent;
}
.evoa-bnav-center:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,184,169,.5); }
.evoa-bnav-center:active { transform: scale(.9); }

/* Badge */
.evoa-bnav-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 15px;
  height: 15px;
  background: #E8341A;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  font-family: 'DM Mono', monospace;
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

  const [unread, setUnread] = useState(0);
  useEffect(() => {
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
    { key:"home",          icon:FaHome,  label:"Home",    path:home },
    { key:"explore",       icon:FaSearch,label:"Explore", path:"/explore" },
    { key:"pitch",         icon:FaPlay,  label:"Pitch",   path:"/pitch/hashtag", center:true },
    { key:"notifications", icon:FaBell,  label:"Alerts",  path:"/notifications", badge:unread },
    { key:"profile",       icon:FaUser,  label:"Profile", path:profile },
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
                <Icon size={17} />
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
              <div style={{ position:"relative" }}>
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
