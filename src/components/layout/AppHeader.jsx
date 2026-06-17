import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.avif";
import { HiSun, HiMoon } from "react-icons/hi";

/* ─── EVOA AppHeader — Apple Glassmorphism Design System ─── */
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
  transition: background .3s, border-color .3s, box-shadow .3s;
  backdrop-filter: blur(32px) saturate(1.6);
  -webkit-backdrop-filter: blur(32px) saturate(1.6);
}

/* Dark: deep glass with teal shimmer top border */
.evoa-header.dark {
  background: rgba(10,10,14,0.72);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  box-shadow:
    0 1px 0 rgba(0,184,169,0.12),
    0 4px 24px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.04);
}

/* Light: frosted white glass */
.evoa-header.light {
  background: rgba(255,255,255,0.78);
  border-bottom: 1px solid rgba(255,255,255,0.9);
  box-shadow:
    0 1px 0 rgba(0,184,169,0.08),
    0 4px 24px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.95);
}

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
  box-shadow: 0 0 12px rgba(0,184,169,0.25);
  transition: box-shadow .3s;
}

.evoa-header-img:hover {
  box-shadow: 0 0 20px rgba(0,184,169,0.45);
}

.evoa-header-wordmark {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: .1em;
  line-height: 1;
}
.evoa-header.dark  .evoa-header-wordmark { color: #F4F0E8; }
.evoa-header.light .evoa-header-wordmark { color: #1a1a1a; }
.evoa-header-wordmark span {
  color: #E8341A;
  text-shadow: 0 0 16px rgba(232,52,26,0.45);
}

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

/* Glass pill action buttons */
.evoa-header-action-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background .2s, color .2s, box-shadow .2s, transform .15s;
}
.evoa-header-action-btn:active { transform: scale(0.88); }

.evoa-header.dark .evoa-header-action-btn { color: rgba(244,240,232,.5); }
.evoa-header.dark .evoa-header-action-btn:hover {
  color: var(--evoa-accent-primary);
  background: rgba(0,184,169,0.12);
  box-shadow: 0 0 12px rgba(0,184,169,0.18), inset 0 1px 0 rgba(255,255,255,0.06);
}

.evoa-header.light .evoa-header-action-btn { color: rgba(26,26,26,.45); }
.evoa-header.light .evoa-header-action-btn:hover {
  color: var(--evoa-accent-primary);
  background: rgba(0,184,169,0.09);
  box-shadow: 0 0 10px rgba(0,184,169,0.12);
}

/* Theme toggle inherits action-btn styles */
.evoa-theme-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background .2s, color .2s, box-shadow .2s, transform .15s;
}
.evoa-theme-btn:active { transform: scale(0.88); }
.evoa-header.dark  .evoa-theme-btn { color: rgba(244,240,232,.4); }
.evoa-header.dark  .evoa-theme-btn:hover {
  color: #E8341A;
  background: rgba(232,52,26,0.10);
  box-shadow: 0 0 12px rgba(232,52,26,0.2);
}
.evoa-header.light .evoa-theme-btn { color: rgba(26,26,26,.4); }
.evoa-header.light .evoa-theme-btn:hover {
  color: #E8341A;
  background: rgba(232,52,26,0.07);
  box-shadow: 0 0 10px rgba(232,52,26,0.12);
}

/* Notification badge on chat button — pulsing glow */
.evoa-header-badge {
  position: absolute;
  top: -1px;
  right: -1px;
  min-width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #E8341A, #c02810);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  font-family: 'DM Mono', monospace;
  box-shadow: 0 0 0 2px rgba(10,10,14,0.7);
  animation: badge-pulse-glow 2s ease-in-out infinite;
}
`;

/**
 * AppHeader — unified top bar for post-auth pages.
 * Shows EVOA logo + wordmark on left, optional action slot on right.
 */
export default function AppHeader({ actions = null, title = null, showThemeToggle = false }) {
  const { theme, toggleTheme, openThemeModal } = useTheme();
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
            onClick={openThemeModal}
            className="evoa-theme-btn"
            title="Theme"
          >
            {isDark ? <HiSun size={18} /> : <HiMoon size={17} />}
          </button>
        )}
      </div>
    </div>
  );
}
