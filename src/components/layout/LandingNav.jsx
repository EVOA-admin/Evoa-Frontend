import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

/* ─── Nav CSS — Light mode default, Dark navy override ─── */
const NAV_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@300;400&display=swap');

/* ─── Public Page Design Tokens (scoped to LandingNav context) ─── */
[data-theme="light"] {
  --bg:          #FFFFFF;
  --bg-alt:      #F8FAFC;
  --bg-card:     #FFFFFF;
  --bg-deep:     #F1F5F9;
  --text:        #0F172A;
  --text-sub:    #334155;
  --text-mute:   #64748B;
  --blue:        #1565C0;
  --blue-mid:    #1976D2;
  --blue-bright: #2196F3;
  --blue-pale:   #EEF5FF;
  --blue-brd:    rgba(21,101,192,0.22);
  --border:      #E2E8F0;
  --border-soft: #F1F5F9;
  --shadow-sm:   0 1px 3px rgba(15,23,42,.06),0 2px 8px rgba(15,23,42,.04);
  --shadow-md:   0 4px 20px rgba(15,23,42,.08),0 1px 4px rgba(15,23,42,.05);
  --shadow-lg:   0 12px 48px rgba(15,23,42,.10),0 4px 12px rgba(15,23,42,.06);
  --shadow-blue: 0 8px 32px rgba(21,101,192,.22);
}
[data-theme="dark"] {
  --bg:          #0D1B2A;
  --bg-alt:      #1E2D3D;
  --bg-card:     #162032;
  --bg-deep:     #243447;
  --text:        #E2E8F0;
  --text-sub:    #94A3B8;
  --text-mute:   #64748B;
  --blue:        #3B82F6;
  --blue-mid:    #60A5FA;
  --blue-bright: #93C5FD;
  --blue-pale:   rgba(59,130,246,0.12);
  --blue-brd:    rgba(59,130,246,0.25);
  --border:      rgba(255,255,255,0.08);
  --border-soft: rgba(255,255,255,0.04);
  --shadow-sm:   0 1px 4px rgba(0,0,0,.3);
  --shadow-md:   0 4px 20px rgba(0,0,0,.4);
  --shadow-lg:   0 12px 48px rgba(0,0,0,.5);
  --shadow-blue: 0 8px 32px rgba(59,130,246,.22);
}

/* ── Light mode (default) ── */
.evoa-nav-root .ln-nav {
  position:fixed;top:0;left:0;right:0;z-index:1000;
  padding:0 40px;height:68px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(255,255,255,.90);
  border-bottom:1px solid #E2E8F0;
  backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  transition:background .3s,box-shadow .3s,border-color .3s;
}
.evoa-nav-root .ln-nav.sticky {
  background:rgba(255,255,255,.98);
  box-shadow:0 2px 16px rgba(15,23,42,.07);
  border-color:#DDE3ED;
}

/* ── Dark mode (navy) ── */
[data-theme="dark"] .evoa-nav-root .ln-nav {
  background:rgba(13,27,42,.90);
  border-bottom-color:rgba(255,255,255,.07);
}
[data-theme="dark"] .evoa-nav-root .ln-nav.sticky {
  background:rgba(13,27,42,.98);
  box-shadow:0 2px 16px rgba(0,0,0,.4);
  border-color:rgba(255,255,255,.09);
}

/* ── Logo ── */
.evoa-nav-root .ln-logo {
  font-family:'Inter',sans-serif;font-size:22px;font-weight:800;
  letter-spacing:-.02em;color:#0F172A;text-decoration:none;
}
.evoa-nav-root .ln-logo span { color:#1565C0; }
[data-theme="dark"] .evoa-nav-root .ln-logo { color:#E2E8F0; }
[data-theme="dark"] .evoa-nav-root .ln-logo span { color:#3B82F6; }

/* ── Startup India badge (beside logo) ── */
.evoa-nav-root .ln-left { display:flex;align-items:center;gap:0; }
.evoa-nav-root .ln-si-badge {
  display:inline-flex;align-items:center;gap:6px;
  margin-left:14px;
}
.evoa-nav-root .ln-si-label {
  font-family:'DM Mono',monospace;font-size:9px;font-weight:400;
  letter-spacing:.10em;text-transform:uppercase;
  color:rgba(15,23,42,.45);white-space:nowrap;
}
.evoa-nav-root .ln-si-text {
  font-family:'Inter',sans-serif;font-size:11px;font-weight:700;
  letter-spacing:.02em;line-height:1;
}
/* removed dark mode badge bg/border */
[data-theme="dark"] .evoa-nav-root .ln-si-label { color:rgba(226,232,240,.4); }
@media(max-width:900px){ .evoa-nav-root .ln-si-badge { display:none; } }

/* ── Center links ── */
.evoa-nav-links-center {
  position:fixed;top:0;left:0;right:0;height:68px;
  z-index:1001;display:flex;align-items:center;justify-content:center;
  pointer-events:none;
}
.evoa-nav-links-center ul {
  display:flex;gap:4px;list-style:none;margin:0;padding:0;
  font-family:'Inter',sans-serif;font-size:13px;font-weight:500;
  color:rgba(51,65,85,.70);align-items:center;pointer-events:all;
}
.evoa-nav-links-center ul a {
  color:inherit;text-decoration:none;padding:6px 12px;border-radius:6px;
  transition:color .2s,background .2s;
}
.evoa-nav-links-center ul a:hover { color:#1565C0;background:rgba(21,101,192,.06); }
[data-theme="dark"] .evoa-nav-links-center ul { color:rgba(148,163,184,.80); }
[data-theme="dark"] .evoa-nav-links-center ul a:hover { color:#60A5FA;background:rgba(59,130,246,.10); }

/* ── Right side ── */
.evoa-nav-root .ln-right { display:flex;align-items:center;gap:10px; }
.evoa-nav-root .ln-signin {
  font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
  padding:8px 18px;border-radius:8px;
  background:transparent;border:1.5px solid #DDE3ED;
  color:#334155;text-decoration:none;transition:all .2s;
}
.evoa-nav-root .ln-signin:hover { border-color:#1565C0;color:#1565C0;background:rgba(21,101,192,.05); }
[data-theme="dark"] .evoa-nav-root .ln-signin {
  border-color:rgba(255,255,255,.12);color:#94A3B8;
}
[data-theme="dark"] .evoa-nav-root .ln-signin:hover {
  border-color:rgba(59,130,246,.40);color:#60A5FA;background:rgba(59,130,246,.08);
}
.evoa-nav-root .ln-cta {
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  padding:9px 20px;border-radius:8px;
  background:#1565C0;color:#FFF;text-decoration:none;
  border:none;transition:all .2s;
  box-shadow:0 2px 10px rgba(21,101,192,.28);
}
.evoa-nav-root .ln-cta:hover { background:#1976D2;transform:translateY(-1px);box-shadow:0 4px 16px rgba(21,101,192,.36); }
[data-theme="dark"] .evoa-nav-root .ln-cta { background:#3B82F6;box-shadow:0 2px 10px rgba(59,130,246,.28); }
[data-theme="dark"] .evoa-nav-root .ln-cta:hover { background:#60A5FA;box-shadow:0 4px 16px rgba(59,130,246,.40); }

/* ── Theme toggle ── */
.ln-theme-btn {
  width:36px;height:36px;border-radius:8px;
  display:flex;align-items:center;justify-content:center;
  background:rgba(51,65,85,.07);border:1.5px solid #DDE3ED;
  cursor:pointer;transition:all .25s;color:#64748B;flex-shrink:0;
  overflow:hidden;position:relative;
}
.ln-theme-btn:hover { background:rgba(21,101,192,.07);border-color:rgba(21,101,192,.22);color:#1565C0; }
[data-theme="dark"] .ln-theme-btn { background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.10);color:#64748B; }
[data-theme="dark"] .ln-theme-btn:hover { background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.28);color:#3B82F6; }
.ln-theme-btn svg {
  transition:transform .4s cubic-bezier(.23,1,.32,1),opacity .32s;
  position:absolute;
}
.ln-theme-btn .icon-sun  { transform:rotate(0deg) scale(1);opacity:1; }
.ln-theme-btn .icon-moon { transform:rotate(-90deg) scale(.6);opacity:0; }
.ln-theme-btn.dark .icon-sun  { transform:rotate(0deg) scale(1);opacity:1; }
.ln-theme-btn.dark .icon-moon { transform:rotate(-90deg) scale(.6);opacity:0; }
.ln-theme-btn.light .icon-sun  { transform:rotate(90deg) scale(.6);opacity:0; }
.ln-theme-btn.light .icon-moon { transform:rotate(0deg) scale(1);opacity:1; }

/* ── Hamburger ── */
.evoa-nav-root .ln-hbg {
  display:none;flex-direction:column;gap:5px;cursor:pointer;
  background:none;border:none;padding:6px;z-index:1001;border-radius:6px;
}
.evoa-nav-root .ln-hbg span {
  display:block;width:22px;height:1.5px;background:#334155;
  transition:all .3s;transform-origin:center;
}
[data-theme="dark"] .evoa-nav-root .ln-hbg span { background:#94A3B8; }
.evoa-nav-root .ln-hbg.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
.evoa-nav-root .ln-hbg.open span:nth-child(2) { opacity:0;transform:scaleX(0); }
.evoa-nav-root .ln-hbg.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }

/* ── Mobile drawer ── */
.evoa-nav-root .ln-drawer {
  position:fixed;inset:0;z-index:999;
  background:rgba(255,255,255,.98);
  backdrop-filter:blur(24px);display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:6px;
  opacity:0;pointer-events:none;transition:opacity .3s;
}
[data-theme="dark"] .evoa-nav-root .ln-drawer { background:rgba(13,27,42,.98); }
.evoa-nav-root .ln-drawer.open { opacity:1;pointer-events:all; }
.evoa-nav-root .ln-drawer a {
  font-family:'Inter',sans-serif;font-size:clamp(28px,9vw,44px);font-weight:800;
  letter-spacing:-.02em;color:rgba(51,65,85,.55);text-decoration:none;
  transition:color .2s,transform .2s;display:block;text-align:center;
}
.evoa-nav-root .ln-drawer a:hover { color:#1565C0;transform:translateX(8px); }
[data-theme="dark"] .evoa-nav-root .ln-drawer a { color:rgba(148,163,184,.65); }
[data-theme="dark"] .evoa-nav-root .ln-drawer a:hover { color:#3B82F6; }
.evoa-nav-root .ln-divider { width:36px;height:1px;background:#E2E8F0;margin:8px 0; }
[data-theme="dark"] .evoa-nav-root .ln-divider { background:rgba(255,255,255,.08); }
.evoa-nav-root .ln-mbtns { display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:10px; }
.evoa-nav-root .ln-msignin {
  font-family:'Inter',sans-serif;font-size:13px;font-weight:600;
  padding:10px 26px;border-radius:8px;border:1.5px solid #DDE3ED;
  color:#334155;text-decoration:none;
}
[data-theme="dark"] .evoa-nav-root .ln-msignin { border-color:rgba(255,255,255,.12);color:#94A3B8; }
.evoa-nav-root .ln-mcta {
  font-family:'Inter',sans-serif;font-size:13px;font-weight:700;
  padding:11px 30px;border-radius:8px;
  background:#1565C0;color:#FFF;text-decoration:none;
}
[data-theme="dark"] .evoa-nav-root .ln-mcta { background:#3B82F6; }

/* ── Spacer ── */
.evoa-nav-spacer { height:68px; }

/* ── Responsive ── */
@media(max-width:1024px){
  .evoa-nav-links-center { display:none; }
  .evoa-nav-root .ln-hbg { display:flex; }
  .evoa-nav-root .ln-signin,.evoa-nav-root .ln-cta { display:none; }
}
@media(max-width:768px){
  .evoa-nav-root .ln-nav { padding:0 20px;height:60px; }
  .evoa-nav-spacer { height:60px; }
}
`;

const LINKS = [["Home", "/"], ["Blog", "/blog"], ["Pricing", "/pricing"], ["About", "/about"], ["Contact", "/contact"]];

export default function LandingNav() {
  const [sticky, setSticky] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const h = () => setSticky(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="evoa-nav-root">
      <style>{NAV_CSS}</style>

      {/* Bar */}
      <nav className={`ln-nav${sticky ? " sticky" : ""}`}>
        <div className="ln-left">
          <Link to="/" className="ln-logo">EVO<span>A</span></Link>
          <div className="ln-si-badge">
            <span className="ln-si-label">Recognised By</span>
            <span className="ln-si-text">
              <span style={{ color: '#E8341A' }}>#startupindia</span>
            </span>
          </div>
        </div>
        <div className="ln-right">
          <button
            className={`ln-theme-btn ${theme}`}
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {/* Sun */}
            <svg className="icon-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            {/* Moon */}
            <svg className="icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
          <Link to="/login" className="ln-signin">Sign In</Link>
          <Link to="/register" className="ln-cta">Get Started</Link>
          <button
            className={`ln-hbg${open ? " open" : ""}`}
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Center links */}
      <div className="evoa-nav-links-center">
        <ul>
          {LINKS.map(([l, h]) => <li key={l}><Link to={h}>{l}</Link></li>)}
        </ul>
      </div>

      {/* Mobile drawer */}
      <div className={`ln-drawer${open ? " open" : ""}`}>
        <div className="ln-divider" />
        {LINKS.map(([l, h]) => <Link key={l} to={h} onClick={close}>{l}</Link>)}
        <div className="ln-divider" />
        <div className="ln-mbtns">
          <Link to="/login" className="ln-msignin" onClick={close}>Sign In</Link>
          <Link to="/register" className="ln-mcta" onClick={close}>Get Started</Link>
        </div>
      </div>

      {/* Spacer */}
      <div className="evoa-nav-spacer" />
    </div>
  );
}
