import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/* ─── NAV CSS (scoped to .evoa-nav-root so it never leaks) ─── */
const NAV_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

.evoa-nav-root {
  --black:#060607;--white:#F4F0E8;--red:#E8341A;--gold:#C9A84C;
  --muted:rgba(244,240,232,0.35);--muted2:rgba(244,240,232,0.55);
}

/* ── Bar (logo left, buttons right) ── */
.evoa-nav-root .ln-nav {
  position:fixed;top:0;left:0;right:0;z-index:1000;
  padding:0 40px;height:72px;display:flex;align-items:center;
  justify-content:space-between;
  transition:background .4s,border-color .4s,backdrop-filter .4s;
  border-bottom:1px solid rgba(244,240,232,.04);
  background:rgba(6,6,7,.82);backdrop-filter:blur(16px);
  pointer-events:all;
}
.evoa-nav-root .ln-nav.sticky {
  background:rgba(6,6,7,.96);backdrop-filter:blur(28px);
  border-color:rgba(244,240,232,.07);
  box-shadow:0 2px 24px rgba(0,0,0,.6);
}

/* ── Links — independently fixed at exact viewport centre ── */
.evoa-nav-links-center {
  position:fixed;
  top:0;
  left:0;
  right:0;
  height:72px;
  z-index:1001;
  display:flex;
  align-items:center;
  justify-content:center;
  pointer-events:none;        /* let clicks pass through to nav bar */
}
.evoa-nav-links-center ul {
  display:flex;gap:28px;list-style:none;margin:0;padding:0;
  font-family:'DM Mono',monospace;
  font-size:11px;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(244,240,232,0.55);
  align-items:center;
  pointer-events:all;         /* re-enable clicks on the list itself */
}
.evoa-nav-links-center ul a {
  color:inherit;text-decoration:none;transition:color .2s;position:relative;
}
.evoa-nav-links-center ul a::after {
  content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;
  background:#E8341A;transform:scaleX(0);transition:transform .25s;
}
.evoa-nav-links-center ul a:hover { color:#F4F0E8; }
.evoa-nav-links-center ul a:hover::after { transform:scaleX(1); }

.evoa-nav-root .ln-logo {
  font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.12em;
  color:#F4F0E8;text-decoration:none;
}
.evoa-nav-root .ln-logo span { color:#E8341A; }
.evoa-nav-root .ln-right { display:flex;align-items:center;gap:14px; }
.evoa-nav-root .ln-signin {
  font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.14em;
  text-transform:uppercase;padding:9px 20px;border-radius:40px;
  background:rgba(244,240,232,.08);border:1px solid rgba(244,240,232,.12);
  color:#F4F0E8;text-decoration:none;transition:all .25s;
}
.evoa-nav-root .ln-signin:hover { background:rgba(244,240,232,.15); }
.evoa-nav-root .ln-cta {
  font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.14em;
  text-transform:uppercase;padding:10px 24px;border:1px solid #E8341A;
  color:#E8341A;text-decoration:none;transition:all .25s;
  clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
}
.evoa-nav-root .ln-cta:hover { background:#E8341A!important;color:#060607!important; }

/* hamburger */
.evoa-nav-root .ln-hbg {
  display:none;flex-direction:column;gap:5px;cursor:pointer;
  background:none;border:none;padding:4px;z-index:1001;
}
.evoa-nav-root .ln-hbg span {
  display:block;width:24px;height:1.5px;background:#F4F0E8;
  transition:all .3s;transform-origin:center;
}
.evoa-nav-root .ln-hbg.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
.evoa-nav-root .ln-hbg.open span:nth-child(2) { opacity:0;transform:scaleX(0); }
.evoa-nav-root .ln-hbg.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }

/* mobile drawer */
.evoa-nav-root .ln-drawer {
  position:fixed;inset:0;z-index:999;background:rgba(6,6,7,.98);
  backdrop-filter:blur(24px);display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:28px;
  opacity:0;pointer-events:none;transition:opacity .35s;
}
.evoa-nav-root .ln-drawer.open { opacity:1;pointer-events:all; }
.evoa-nav-root .ln-drawer a {
  font-family:'Bebas Neue',sans-serif;font-size:clamp(36px,10vw,52px);
  letter-spacing:.04em;color:rgba(244,240,232,0.55);text-decoration:none;
  transition:color .2s,transform .2s;display:block;text-align:center;
}
.evoa-nav-root .ln-drawer a:hover { color:#F4F0E8;transform:translateX(8px); }
.evoa-nav-root .ln-divider { width:40px;height:1px;background:rgba(244,240,232,.1); }
.evoa-nav-root .ln-mbtns { display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:8px; }
.evoa-nav-root .ln-msignin {
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;padding:11px 28px;border-radius:40px;
  background:rgba(244,240,232,.08);border:1px solid rgba(244,240,232,.15);
  color:#F4F0E8;text-decoration:none;
}
.evoa-nav-root .ln-mcta {
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;padding:12px 32px;background:#E8341A;
  color:#060607;text-decoration:none;
  clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
}

/* push page content below fixed nav */
.evoa-nav-spacer { height:72px; }

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

      {/* ── Bar: logo (left) + Sign In / Launch (right) ── */}
      <nav className={`ln-nav${sticky ? " sticky" : ""}`}>
        <Link to="/" className="ln-logo">EVO<span>A</span></Link>
        <div className="ln-right">
          <Link to="/login" className="ln-signin">Sign In</Link>
          <Link to="/register" className="ln-cta">Launch 26.03</Link>
          <button
            className={`ln-hbg${open ? " open" : ""}`}
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Links: independently fixed, centred on full viewport width ── */}
      <div className="evoa-nav-links-center">
        <ul>
          {LINKS.map(([l, h]) => <li key={l}><Link to={h}>{l}</Link></li>)}
        </ul>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`ln-drawer${open ? " open" : ""}`}>
        <div className="ln-divider" />
        {LINKS.map(([l, h]) => <Link key={l} to={h} onClick={close}>{l}</Link>)}
        <div className="ln-divider" />
        <div className="ln-mbtns">
          <Link to="/login" className="ln-msignin" onClick={close}>Sign In</Link>
          <Link to="/register" className="ln-mcta" onClick={close}>Launch 26.03</Link>
        </div>
      </div>

      {/* Spacer so page content doesn't hide under fixed nav */}
      <div className="evoa-nav-spacer" />
    </div>
  );
}
