import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import BottomNav from "./BottomNav";

/* ─── EVOA AppShell — matches landing page dark design system ─── */
const SHELL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400&family=DM+Mono:wght@300;400&display=swap');

.evoa-shell-root {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  transition: background .3s;
}
.evoa-shell-root.dark  { background: #0d0d0f; }
.evoa-shell-root.light { background: #f0ede8; }

/* ── LEFT GUTTER (desktop branding) ── */
.evoa-shell-gutter {
  display: none;
}
@media(min-width:1024px){
  .evoa-shell-gutter {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    padding-right: 32px;
    flex: 1;
    max-width: 280px;
    position: sticky;
    top: 0;
    height: 100vh;
  }
}
.evoa-shell-brand {
  text-align: right;
}
.evoa-shell-brand-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  letter-spacing: .1em;
  margin-bottom: 8px;
  line-height: 1;
}
.evoa-shell-root.dark  .evoa-shell-brand-name { color: #F4F0E8; }
.evoa-shell-root.light .evoa-shell-brand-name { color: #1a1a1a; }
.evoa-shell-brand-name span { color: #E8341A; }

.evoa-shell-brand-tag {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .18em;
  text-transform: uppercase;
  max-width: 140px;
  text-align: right;
}
.evoa-shell-root.dark  .evoa-shell-brand-tag { color: rgba(244,240,232,.25); }
.evoa-shell-root.light .evoa-shell-brand-tag { color: rgba(26,26,26,.3); }

/* ── PHONE COLUMN ── */
.evoa-shell-column {
  position: relative;
  width: 100%;
  max-width: 430px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.evoa-shell-col-border-l,
.evoa-shell-col-border-r {
  position: absolute;
  top: 0; bottom: 0;
  width: 1px;
  display: none;
}
@media(min-width:640px){
  .evoa-shell-col-border-l,
  .evoa-shell-col-border-r { display: block; }
}
.evoa-shell-col-border-l { left: 0; }
.evoa-shell-col-border-r { right: 0; }
.evoa-shell-root.dark  .evoa-shell-col-border-l,
.evoa-shell-root.dark  .evoa-shell-col-border-r { background: rgba(232,52,26,.06); }
.evoa-shell-root.light .evoa-shell-col-border-l,
.evoa-shell-root.light .evoa-shell-col-border-r { background: rgba(26,26,26,.08); }

.evoa-shell-content {
  flex: 1;
}
.evoa-shell-root.dark  .evoa-shell-content { background: #060607; }
.evoa-shell-root.light .evoa-shell-content { background: #faf8f5; }
`;

export default function AppShell({ children }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cls = isDark ? "dark" : "light";

  return (
    <div className={`evoa-shell-root ${cls}`}>
      <style>{SHELL_CSS}</style>

      {/* Desktop left gutter */}
      <div className="evoa-shell-gutter">
        <div className="evoa-shell-brand">
          <div className="evoa-shell-brand-name">EVO<span>-A</span></div>
          <div className="evoa-shell-brand-tag">Startup discovery &amp; pitch platform</div>
        </div>
      </div>

      {/* Phone column */}
      <div className="evoa-shell-column">
        <div className="evoa-shell-col-border-l" />
        <div className="evoa-shell-col-border-r" />
        <div className="evoa-shell-content">
          {children}
        </div>
        <BottomNav />
      </div>

      {/* Right balance */}
      <div className="hidden lg:flex flex-1 max-w-xs" />
    </div>
  );
}
