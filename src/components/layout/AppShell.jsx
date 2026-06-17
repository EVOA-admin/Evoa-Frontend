import React, { useState } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import CreateContentModal from "../shared/CreateContentModal";

/* ─── EVOA AppShell — Apple Glassmorphism + Instagram Desktop Layout ─── */
const SHELL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400&family=DM+Mono:wght@300;400&display=swap');

.evoa-shell-root {
  height: 100vh;
  height: 100dvh;
  display: flex;
  justify-content: center;
  transition: background .5s ease;
  position: relative;
  overflow: hidden;
}

/* Dark: deep space with ambient teal glow + warm ember accent */
.evoa-shell-root.dark {
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,184,169,0.09) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(232,52,26,0.06) 0%, transparent 55%),
    #0a0a0e;
}

/* Light: luminous frosted white */
.evoa-shell-root.light {
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,184,169,0.05) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(232,52,26,0.03) 0%, transparent 55%),
    #f2efe9;
}

/* ── MOBILE PHONE COLUMN (default) ── */
.evoa-shell-column {
  position: relative;
  width: 100%;
  max-width: 430px;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Column gradient border lines (tablet) */
.evoa-shell-col-border-l,
.evoa-shell-col-border-r {
  position: absolute;
  top: 0; bottom: 0;
  width: 1px;
  display: none;
  z-index: 1;
}
@media(min-width:640px){
  .evoa-shell-col-border-l,
  .evoa-shell-col-border-r { display: block; }
}
.evoa-shell-col-border-l { left: 0; }
.evoa-shell-col-border-r { right: 0; }

.evoa-shell-root.dark .evoa-shell-col-border-l,
.evoa-shell-root.dark .evoa-shell-col-border-r {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,184,169,0.12) 20%,
    rgba(232,52,26,0.06) 80%,
    transparent 100%
  );
}
.evoa-shell-root.light .evoa-shell-col-border-l,
.evoa-shell-root.light .evoa-shell-col-border-r {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,184,169,0.10) 20%,
    rgba(26,26,26,0.06) 80%,
    transparent 100%
  );
}

/* Scrollable content area */
.evoa-shell-content {
  flex: 1;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.evoa-shell-content::-webkit-scrollbar { display: none; }

.evoa-shell-root.dark  .evoa-shell-content { background: transparent; }
.evoa-shell-root.light .evoa-shell-content { background: transparent; }

/* ──────────────────────────────────────────────────────────────
   DESKTOP OVERRIDES (≥ 1024px)
   - Sidebar takes 72px (lg) or 240px (xl)
   - Column fills remaining width, no max-width cap
   - BottomNav and AppHeader hidden (sidebar is the nav)
────────────────────────────────────────────────────────────── */
@media (min-width: 1024px) {
  .evoa-shell-root {
    justify-content: flex-start;
  }

  .evoa-shell-column {
    max-width: none;
    width: calc(100% - 104px);
    margin-left: 104px;
    /* Remove decorative column borders on desktop */
  }

  .evoa-shell-col-border-l,
  .evoa-shell-col-border-r {
    display: none !important;
  }

  /* Hide mobile BottomNav — sidebar replaces it */
  .evoa-bnav {
    display: none !important;
  }

  /* Hide mobile AppHeader — sidebar replaces top nav */
  .evoa-header {
    display: none !important;
  }
}

@media (min-width: 1280px) {
  .evoa-shell-column {
    width: calc(100% - 272px);
    margin-left: 272px;
  }
}
`;

/**
 * AppShell — root layout shell.
 *
 * Mobile/tablet: Narrow phone column with AppHeader + BottomNav.
 * Desktop (≥1024px): Full-width column with fixed DesktopSidebar replacing
 * AppHeader and BottomNav.
 *
 * Props:
 *   children     — page content
 *   onCreatePost — optional callback to open CreateContentModal from sidebar
 */
export default function AppShell({ children }) {
  const { theme } = useTheme();
  const { userRole } = useAuth();
  const isDark = theme === "dark";
  const cls = isDark ? "dark" : "light";

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handlePostCreated = (type) => {
    setCreateModalOpen(false);
    window.dispatchEvent(new CustomEvent('evoa:contentCreated', { detail: { type } }));
  };

  return (
    <div className={`evoa-shell-root ${cls}`}>
      <style>{SHELL_CSS}</style>

      {/* Desktop sidebar — CSS-hidden below 1024px */}
      <DesktopSidebar onCreatePost={() => setCreateModalOpen(true)} />

      {/* Main content column */}
      <div className="evoa-shell-column">
        <div className="evoa-shell-col-border-l" />
        <div className="evoa-shell-col-border-r" />
        <div className="evoa-shell-content">
          {children}
        </div>
        {/* BottomNav — CSS-hidden on desktop (≥1024px) */}
        <BottomNav />
      </div>

      <CreateContentModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        canUploadReel={userRole === 'startup'}
        onCreated={handlePostCreated}
      />
    </div>
  );
}
