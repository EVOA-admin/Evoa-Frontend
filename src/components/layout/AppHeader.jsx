import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.avif";
import { HiSun, HiMoon } from "react-icons/hi";

/* ─── EVOA AppHeader — matches landing page dark design system ─── */
const HEADER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap');

.evoa-header {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 56px;
  transition: background .3s, border-color .3s;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.evoa-header.dark  { background: rgba(6,6,7,.96); border-bottom: 1px solid rgba(244,240,232,.06); }
.evoa-header.light { background: rgba(250,248,245,.96); border-bottom: 1px solid rgba(26,26,26,.08); }

.evoa-header-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: default;
}
.evoa-header-img {
  height: 30px;
  width: 30px;
  object-fit: contain;
  border-radius: 8px;
}
.evoa-header-wordmark {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: .1em;
  line-height: 1;
}
.evoa-header.dark  .evoa-header-wordmark { color: #F4F0E8; }
.evoa-header.light .evoa-header-wordmark { color: #1a1a1a; }
.evoa-header-wordmark span { color: #E8341A; }

.evoa-header-title {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  letter-spacing: .06em;
  font-weight: 400;
}
.evoa-header.dark  .evoa-header-title { color: #F4F0E8; }
.evoa-header.light .evoa-header-title { color: #1a1a1a; }

.evoa-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.evoa-theme-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background .2s, color .2s;
}
.evoa-header.dark  .evoa-theme-btn { color: rgba(244,240,232,.4); }
.evoa-header.dark  .evoa-theme-btn:hover { color: #E8341A; background: rgba(232,52,26,.08); }
.evoa-header.light .evoa-theme-btn { color: rgba(26,26,26,.4); }
.evoa-header.light .evoa-theme-btn:hover { color: #E8341A; background: rgba(232,52,26,.06); }
`;

/**
 * AppHeader — unified top bar for post-auth pages.
 * Shows EVOA logo + wordmark on left, optional action slot on right.
 */
export default function AppHeader({ actions = null, title = null, showThemeToggle = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const cls = isDark ? "dark" : "light";

  return (
    <div className={`evoa-header ${cls}`}>
      <style>{HEADER_CSS}</style>

      {/* Left: logo + wordmark or page title */}
      <div className="evoa-header-logo">
        <img src={logo} alt="EVO-A" className="evoa-header-img" />
        {title ? (
          <span className="evoa-header-title">{title}</span>
        ) : (
          <span className="evoa-header-wordmark">EVO<span>-A</span></span>
        )}
      </div>

      {/* Right: actions + optional theme toggle */}
      <div className="evoa-header-actions">
        {actions}
        {showThemeToggle && (
          <button
            onClick={toggleTheme}
            className="evoa-theme-btn"
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <HiSun size={18} /> : <HiMoon size={17} />}
          </button>
        )}
      </div>
    </div>
  );
}
