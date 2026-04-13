import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LandingNav from "../../components/layout/LandingNav";

/* ─────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

:root{
  --black:#060607;--white:#F4F0E8;--red:#E8341A;--gold:#C9A84C;
  --grey:#1A1A1C;--greyL:#2C2C2F;
  --muted:rgba(244,240,232,0.35);--muted2:rgba(244,240,232,0.55);--muted3:rgba(244,240,232,0.80);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{cursor:none;overflow-x:hidden;}

.evoa-root{
  background:var(--black);color:var(--white);
  font-family:'Cormorant Garamond',Georgia,serif;
  position:relative;min-height:100vh;
}
.evoa-root::before{
  content:'';position:fixed;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events:none;z-index:9997;opacity:.6;
}

/* ── KEYFRAMES ── */
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes orbPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes orbRing{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes floatStat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes ambassadorMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes ambassadorGlow{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes scrollAnim{0%{opacity:1;transform:scaleY(0);transform-origin:top}50%{opacity:1;transform:scaleY(1)}100%{opacity:0;transform:scaleY(1);transform-origin:bottom}}
@keyframes floatUp{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes spineDraw{from{stroke-dashoffset:2000}to{stroke-dashoffset:0}}
@keyframes glitchR{0%,90%,100%{clip-path:inset(0 0 100% 0);transform:translateX(0)}92%{clip-path:inset(10% 0 60% 0);transform:translateX(4px)}94%{clip-path:inset(40% 0 30% 0);transform:translateX(-4px)}96%{clip-path:inset(70% 0 5% 0);transform:translateX(3px)}98%{clip-path:inset(0 0 0 0)}}
@keyframes glitchB{0%,90%,100%{clip-path:inset(0 0 100% 0)}92%{clip-path:inset(10% 0 60% 0);transform:translateX(-3px)}94%{clip-path:inset(50% 0 20% 0);transform:translateX(3px)}96%{clip-path:inset(80% 0 0%)}98%{clip-path:inset(0 0 0 0)}}
@keyframes scanSweep{0%{transform:translateY(-100%);opacity:0}5%{opacity:1}95%{opacity:1}100%{transform:translateY(20000px);opacity:0}}
@keyframes textStretch{0%,100%{letter-spacing:.025em}50%{letter-spacing:.055em}}
@keyframes featInR{from{opacity:0;transform:translateX(60px) skewX(-2deg)}to{opacity:1;transform:translateX(0) skewX(0)}}
@keyframes featInL{from{opacity:0;transform:translateX(-60px) skewX(2deg)}to{opacity:1;transform:translateX(0) skewX(0)}}
@keyframes segReveal{from{opacity:0;transform:translateY(40px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}

/* ── UTILITY ── */
.fu1{opacity:0;animation:fadeUp 1s ease forwards .3s}
.fu2{opacity:0;animation:fadeUp 1s ease forwards .5s}
.fu3{opacity:0;animation:fadeUp 1s ease forwards .7s}
.fu4{opacity:0;animation:fadeUp 1s ease forwards .9s}
.fu5{opacity:0;animation:fadeIn 1.4s ease forwards .6s}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s ease}
.reveal.vis{opacity:1;transform:translateY(0)}
.pstat{opacity:0;transform:translateX(30px);transition:opacity .7s ease,transform .7s ease}
.pstat.vis{opacity:1;transform:translateX(0)}
.pillar{opacity:0;transform:translateY(40px);transition:opacity .5s,transform .4s cubic-bezier(.23,1,.32,1),background .3s,border-color .3s}
.pillar.vis{opacity:1;transform:translateY(0)}
.pillar:hover{background:var(--greyL)!important;transform:translateY(-8px)!important;border-color:rgba(232,52,26,.2)!important}
.pillar:hover .pbar{transform:scaleX(1)!important}
.pillar:hover .ptag{opacity:1!important}
.pillar:hover .picon{filter:saturate(1) brightness(1)!important}
.how-card{opacity:0;transform:translateY(32px);transition:opacity .7s ease,transform .7s ease}
.how-card.vis{opacity:1;transform:translateY(0)}
.how-card.vis.hf0{animation:floatUp 5s ease-in-out infinite}
.how-card.vis.hf1{animation:floatUp 5.5s ease-in-out infinite .6s}
.how-card.vis.hf2{animation:floatUp 4.8s ease-in-out infinite 1.1s}
.how-card.vis.hf3{animation:floatUp 5.3s ease-in-out infinite .4s}
.how-inner{transition:transform .5s cubic-bezier(.23,1,.32,1),border-color .3s}
.how-inner:hover{transform:translateY(-14px)!important}
.how-inner:hover .hacc{width:56px!important}
.feat-row{opacity:0}
.feat-row.onR{animation:featInR .8s cubic-bezier(.23,1,.32,1) forwards}
.feat-row.onL{animation:featInL .8s cubic-bezier(.23,1,.32,1) forwards}
.fspine{stroke-dasharray:2000;stroke-dashoffset:2000}
.fspine.drawn{animation:spineDraw 2.2s cubic-bezier(.4,0,.2,1) forwards .2s}
.gr{animation:glitchR 5s ease-in-out infinite 1s;position:absolute;inset:0;pointer-events:none;font-family:'Bebas Neue',sans-serif;font-size:clamp(64px,8.5vw,116px);line-height:.88;white-space:nowrap;color:var(--red)}
.gb{animation:glitchB 5s ease-in-out infinite 1.2s;position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;font-family:'Bebas Neue',sans-serif;font-size:clamp(64px,8.5vw,116px);line-height:.88;white-space:nowrap;color:#4466ff}
.fts{animation:textStretch 8s ease-in-out infinite}
.fscan{position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(232,52,26,.4) 20%,rgba(201,168,76,.6) 50%,rgba(232,52,26,.4) 80%,transparent);pointer-events:none;z-index:3;animation:scanSweep 6s ease-in-out infinite}
.seg-wrap{opacity:0}
.seg-wrap.on{animation:segReveal .8s cubic-bezier(.23,1,.32,1) forwards}
.ticker-t{animation:ticker 28s linear infinite;display:flex;white-space:nowrap}
.orb{animation:orbPulse 6s ease-in-out infinite}
.or1{animation:orbRing 8s linear infinite}
.or2{animation:orbRing 12s linear infinite reverse}
.or3{animation:orbRing 20s linear infinite}
.fs0{animation:floatStat 4s ease-in-out infinite 0s}
.fs1{animation:floatStat 4s ease-in-out infinite 1s}
.fs2{animation:floatStat 4s ease-in-out infinite 2s}
.fs3{animation:floatStat 4s ease-in-out infinite 1.5s}
.sline{animation:scrollAnim 1.6s ease-in-out infinite}
.tcursor{display:inline-block;width:8px;height:14px;background:var(--red);margin-left:2px;animation:blink 1s step-end infinite;vertical-align:text-bottom}
.ghost{position:absolute;font-family:'Bebas Neue',sans-serif;font-size:320px;color:rgba(244,240,232,.02);right:-20px;top:-40px;line-height:1;pointer-events:none;user-select:none;z-index:0}
.stag{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:var(--red);display:flex;align-items:center;gap:10px;margin-bottom:18px}
.stag::before{content:'';width:22px;height:1px;background:var(--red);flex-shrink:0;display:inline-block}
.bfire{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;padding:16px 36px;background:var(--red);color:var(--black);text-decoration:none;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));display:inline-block;transition:all .3s;border:none;cursor:pointer}
.bfire:hover{background:var(--gold);transform:translateY(-2px)}

/* ── PITCH SHOWCASE ── */
.pitch-showcase{padding:60px 0 80px;background:var(--grey);position:relative;overflow:hidden;}
.pitch-showcase-hdr{padding:0 48px;margin-bottom:40px;}
.pitch-scroll{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:0 48px 24px;scrollbar-width:none;cursor:grab;}
.pitch-scroll::-webkit-scrollbar{display:none;}
.pitch-card{flex:0 0 auto;width:200px;transition:transform .35s cubic-bezier(.23,1,.32,1),box-shadow .35s ease;scroll-snap-align:start;}
.pitch-card:hover{transform:scale(1.04);}
.pitch-card:hover .pitch-card-img{box-shadow:0 12px 40px rgba(232,52,26,.18),0 0 0 1px rgba(232,52,26,.2);border-color:rgba(232,52,26,.25);}
.pitch-card-name{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted2);margin-bottom:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.pitch-card-img{width:100%;aspect-ratio:9/16;object-fit:cover;border:1px solid rgba(244,240,232,.08);display:block;transition:box-shadow .35s ease,border-color .35s ease;background:var(--greyL);}
@media(max-width:768px){.pitch-showcase-hdr{padding:0 20px;}.pitch-scroll{padding:0 20px 16px;gap:12px;}.pitch-card{width:150px;}}



/* ── CURSOR ── */
.evoa-cur{width:10px;height:10px;background:var(--red);border-radius:50%;position:fixed;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);transition:width .2s,height .2s,background .2s;mix-blend-mode:difference}
.evoa-cur-r{width:36px;height:36px;border:1px solid rgba(232,52,26,.5);border-radius:50%;position:fixed;pointer-events:none;z-index:9998;transform:translate(-50%,-50%)}

/* ── RESPONSIVE ── */
@media(max-width:1024px){
  .ghost{font-size:180px}
  .nlinks{display:none}
  .hamburger{display:flex}
  .nsignin,.ncta{display:none}
}
@media(max-width:768px){
  body{cursor:auto}
  .evoa-cur,.evoa-cur-r{display:none}
  .nav{padding:0 20px;height:60px}
  .hero-grid{grid-template-columns:1fr!important;padding:90px 20px 60px!important;min-height:auto!important}
  .hero-orb{display:none!important}
  .hero-div{display:none!important}
  .hero-h1{font-size:clamp(52px,13vw,72px)!important}
  .problem-grid{grid-template-columns:1fr!important;gap:40px!important;padding:72px 20px!important}
  .pstat-n{font-size:52px!important;min-width:100px!important}
  .pillars-sec{padding:72px 20px 60px!important}
  .pillars-grid{grid-template-columns:1fr 1fr!important}
  .ai-sec{padding:72px 20px!important}
  .ai-hdr{grid-template-columns:1fr!important;gap:28px!important}
  .ai-app{padding:0!important}
  .ai-cols{grid-template-columns:1fr!important;height:auto!important}
  .ai-sb,.ai-adv{display:none!important}
  .ai-chat{height:380px!important}
  .how-sec{padding:72px 20px 80px!important}
  .how-svg{display:none!important}
  .how-grid{grid-template-columns:1fr 1fr!important;gap:10px!important}
  .seg-sec{padding:72px 20px 80px!important}
  .seg-grid{grid-template-columns:1fr 1fr!important}
  .feat-sec{padding:72px 0 80px!important}
  .feat-hdr{padding:0 20px 52px!important}
  .feat-row{display:block!important;opacity:1!important;animation:none!important}
  .feat-mid{display:none!important}
  .feat-slot{padding:0 20px 8px!important;opacity:1!important;display:block!important}
  .mission-sec{padding:72px 20px!important}
  .launch-sec{flex-direction:column!important;gap:28px!important;padding:60px 20px!important;text-align:center!important}
  .launch-r{text-align:center!important}
  .launch-d{font-size:clamp(48px,14vw,80px)!important}
  .footer-grid{grid-template-columns:1fr!important;gap:36px!important}
  .footer-sec{padding:48px 24px 28px!important}
}
@media(max-width:480px){
  .pillars-grid{grid-template-columns:1fr!important}
  .how-grid{grid-template-columns:1fr!important}
  .seg-grid{grid-template-columns:1fr!important}
}
@media(hover:none){
  .pillar:hover{transform:none!important;background:var(--black)!important;border-color:rgba(244,240,232,.04)!important}
  .how-inner:hover{transform:none!important}
}
`;

/* ─── HOOKS ─── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal,.pstat").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useCounter(target, duration = 2000, delay = 600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const step = target / (duration / 16);
      let cur = 0;
      const id = setInterval(() => {
        cur = Math.min(cur + step, target);
        setVal(Math.floor(cur));
        if (cur >= target) clearInterval(id);
      }, 16);
    }, delay);
    return () => clearTimeout(t);
  }, []);
  return val;
}

/* ─── CURSOR ─── */
function Cursor() {
  const dot = useRef(null), ring = useRef(null);
  const pos = useRef({ mx: 0, my: 0, rx: 0, ry: 0 });
  useEffect(() => {
    const mv = e => { pos.current.mx = e.clientX; pos.current.my = e.clientY; };
    document.addEventListener("mousemove", mv);
    const tick = () => {
      const p = pos.current;
      p.rx += (p.mx - p.rx) * .12; p.ry += (p.my - p.ry) * .12;
      if (dot.current) { dot.current.style.left = p.mx + "px"; dot.current.style.top = p.my + "px"; }
      if (ring.current) { ring.current.style.left = p.rx + "px"; ring.current.style.top = p.ry + "px"; }
      requestAnimationFrame(tick);
    };
    tick();
    const grow = () => { if (dot.current) { dot.current.style.width = "20px"; dot.current.style.height = "20px"; dot.current.style.background = "var(--gold)"; } if (ring.current) { ring.current.style.width = "52px"; ring.current.style.height = "52px"; } };
    const shrink = () => { if (dot.current) { dot.current.style.width = "10px"; dot.current.style.height = "10px"; dot.current.style.background = "var(--red)"; } if (ring.current) { ring.current.style.width = "36px"; ring.current.style.height = "36px"; } };
    document.querySelectorAll("a,button").forEach(el => { el.addEventListener("mouseenter", grow); el.addEventListener("mouseleave", shrink); });
    return () => document.removeEventListener("mousemove", mv);
  }, []);
  return (<>
    <div ref={dot} className="evoa-cur" />
    <div ref={ring} className="evoa-cur-r" />
  </>);
}



/* ─── PARTICLE CANVAS ─── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const rsz = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    rsz(); window.addEventListener("resize", rsz);
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      r: Math.random() * 1.5 + .3, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      a: Math.random() * .5 + .1, c: Math.random() > .6 ? "#E8341A" : "#C9A84C"
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = cv.width; if (p.x > cv.width) p.x = 0;
        if (p.y < 0) p.y = cv.height; if (p.y > cv.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1;
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 100) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = "#E8341A"; ctx.globalAlpha = (1 - d / 100) * .07; ctx.lineWidth = .5; ctx.stroke(); ctx.globalAlpha = 1; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", rsz); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", width: "100%", height: "100%" }} />;
}

/* ─── HERO ─── */
function Hero() {
  const cnt = useCounter(40);
  return (
    <section id="hero" className="hero-grid" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", padding: "10px 48px 60px", position: "relative", overflow: "hidden" }}>
      <ParticleCanvas />
      <div className="hero-div" style={{ position: "absolute", top: 0, right: "50%", bottom: 0, width: 1, background: "linear-gradient(to bottom,transparent,rgba(232,52,26,.2) 30%,rgba(201,168,76,.15) 70%,transparent)", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="fu1" style={{ marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 6, padding: "8px 16px" }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 300, color: "rgba(244,240,232,.6)", letterSpacing: ".04em" }}>Recognised By</span>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: ".04em" }}>
            <span style={{ color: "#E8341A" }}>#start </span>
            <span style={{ color: "#138808" }}>up </span>
            <span style={{ color: "#FF9933" }}>india</span>
          </span>
        </div>
        <div className="fu1" style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--red)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 32, height: 1, background: "var(--red)", display: "inline-block" }} />Global Startup Ecosystem · Est. 2025
        </div>
        <h1 className="fu2 hero-h1" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(72px,8vw,116px)", lineHeight: .92, letterSpacing: ".02em", marginBottom: 32 }}>
          <span style={{ display: "block" }}>Pitch</span>
          <span style={{ display: "block", color: "var(--red)" }}>your startup</span>
          <span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(40px,5.5vw,78px)", color: "var(--gold)", lineHeight: 1.1 }}>here.</span>
        </h1>
        <p className="fu3" style={{ fontSize: "clamp(15px,2vw,20px)", fontWeight: 300, lineHeight: 1.7, color: "var(--muted2)", maxWidth: 420, marginBottom: 48 }}>
          Find the best startup pitches, connect with top investors & incubators — all in one place. EVOA.
        </p>
        <div className="fu4" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <Link to="/register" className="bfire">Create Your Account</Link>
          <a href="https://021.evoa.co.in" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted2)", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            Meet 021 AI <span style={{ width: 24, height: 1, background: "currentColor", display: "inline-block" }} />
          </a>
        </div>
      </div>
      <div className="hero-orb fu5" style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: 460, height: 460 }}>
          <div className="orb" style={{ position: "absolute", inset: 60, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%,rgba(232,52,26,.7),rgba(201,168,76,.3) 40%,rgba(6,6,7,.9) 70%)", filter: "blur(2px)" }} />
          <div className="or1" style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(232,52,26,.15)" }} />
          <div className="or2" style={{ position: "absolute", inset: 20, borderRadius: "50%", border: "1px solid rgba(201,168,76,.1)" }} />
          <div className="or3" style={{ position: "absolute", inset: 40, borderRadius: "50%", border: "1px solid rgba(232,52,26,.08)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 64, lineHeight: 1, color: "var(--white)", letterSpacing: ".04em" }}>{cnt.toLocaleString()}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--muted)", marginTop: 4 }}>Startups on Platform</div>
          </div>
          {[{ v: "40+", l: "Startups Live", c: "fs0", s: { top: "8%", right: "5%" } }, { v: "11", l: "Countries", c: "fs1", s: { top: "38%", right: "-2%" } }, { v: "100", l: "Free Early Access", c: "fs2", s: { bottom: "18%", right: "8%" } }, { v: "021", l: "AI Co-Founder", c: "fs3", s: { bottom: "30%", left: "2%" } }].map((st, i) => (
            <div key={i} className={st.c} style={{ position: "absolute", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--muted2)", whiteSpace: "nowrap", ...st.s }}>
              <strong style={{ color: "var(--gold)", fontWeight: 400, display: "block", fontSize: 18, fontFamily: "'Bebas Neue',sans-serif" }}>{st.v}</strong>{st.l}
            </div>
          ))}
        </div>
      </div>
      <div className="fu5" style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", zIndex: 10 }}>
        <div className="sline" style={{ width: 1, height: 40, background: "linear-gradient(to bottom,var(--red),transparent)" }} />Scroll
      </div>
    </section>
  );
}

/* ─── TICKER ─── */
const TICKS = [
  { t: "Free Early Access", h: "For first 100 startups" },
  { t: "Investor AI launched", h: "Get startup's real time report" },
  { t: "021 AI co-founder activated", h: "get your own CXO's" },
  // { t: "Trade Arena product test", h: "847 responses in 2 hours" },
  // { t: "New investor joined", h: "Dragon's Den alumni · London" },
];
function Ticker() {
  const items = [...TICKS, ...TICKS];
  return (
    <div style={{ overflow: "hidden", background: "var(--grey)", borderTop: "1px solid rgba(244,240,232,.06)", borderBottom: "1px solid rgba(244,240,232,.06)", padding: "14px 0" }}>
      <div className="ticker-t">
        {items.map((t, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "0 36px", fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--muted)" }}>
            <span style={{ width: 4, height: 4, background: "var(--red)", borderRadius: "50%", flexShrink: 0, display: "inline-block" }} />
            {t.t} · <span style={{ color: "var(--gold)" }}>{t.h}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── PITCH SHOWCASE ─── */
const PITCH_IMAGES = [
  { name: 'Freshily', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/Freshily_19.png' },
  { name: 'Curve Electric', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/curve_electric.png' },
  { name: 'Decentra Classes', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/decentra_classes.png' },
  { name: 'Dream Provider', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/dream_provider.png' },
  { name: 'KCloud', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/kcloud.jpeg' },
  { name: 'Mahua Choco Chips', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/mahua_choco_chips.jpeg' },
  { name: 'Rentilium', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/rentilium.png' },
  { name: 'Titlam Handicrafts', url: 'https://uocfornrjfikdajrhzog.supabase.co/storage/v1/object/public/root-page-pitch-images/titlam_handicrafts.jpeg' },
];

function PitchShowcase() {
  const scrollRef = useRef(null);
  // Enable click-drag scrolling
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false, sx = 0, sl = 0;
    const down = e => { isDown = true; sx = e.pageX - el.offsetLeft; sl = el.scrollLeft; el.style.cursor = 'grabbing'; };
    const up = () => { isDown = false; el.style.cursor = 'grab'; };
    const move = e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - el.offsetLeft; el.scrollLeft = sl - (x - sx); };
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseleave', up);
    el.addEventListener('mouseup', up);
    el.addEventListener('mousemove', move);
    return () => { el.removeEventListener('mousedown', down); el.removeEventListener('mouseleave', up); el.removeEventListener('mouseup', up); el.removeEventListener('mousemove', move); };
  }, []);

  return (
    <section className="pitch-showcase">
      <div className="ghost" style={{ fontSize: 220, top: -20, right: -10 }}>03</div>
      <div className="pitch-showcase-hdr reveal">
        <div className="stag">Live on EVOA</div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(36px,4.5vw,62px)', lineHeight: .94, letterSpacing: '.02em', marginBottom: 12 }}>Startups pitching now.</h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(14px,1.6vw,17px)', fontWeight: 300, color: 'var(--muted2)', maxWidth: 440 }}>Real founders. Real pitches. Discover the next big idea.</p>
      </div>
      <div className="pitch-scroll" ref={scrollRef}>
        {PITCH_IMAGES.map((p, i) => (
          <div key={i} className="pitch-card">
            <div className="pitch-card-name">{p.name}</div>
            <img
              className="pitch-card-img"
              src={p.url}
              alt={`${p.name} startup pitch thumbnail`}
              loading={i < 3 ? 'eager' : 'lazy'}
              decoding="async"
              width="200"
              height="356"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── PROBLEM ─── */
function Problem() {
  return (
    <section style={{ background: "var(--black)", position: "relative", overflow: "hidden" }}>
      <div className="problem-grid" style={{ padding: "140px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
        <div className="ghost">01</div>
        <div className="reveal" style={{ position: "relative", zIndex: 1 }}>
          <div className="stag">The Reality</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,5.5vw,80px)", lineHeight: .94, letterSpacing: ".02em", marginBottom: 28 }}>
            The system was never <em style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 300, color: "var(--gold)" }}>built for you.</em>
          </h2>
          <p style={{ fontSize: "clamp(15px,2vw,18px)", fontWeight: 300, lineHeight: 1.8, color: "var(--muted2)", maxWidth: 480 }}>
            94% of startups fail. Not because the ideas are bad — but because founders without the right network, city, or connections never get a real shot. EVOA exists to break that.
          </p>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          {[["94%", "of startups fail — most before reaching the right investor or customer"], ["1%", "of founders have access to tier-1 VC networks. The rest have to fight."], ["90s", "is all it takes on EVOA. Pitch your startup in a reel. Get discovered globally."]].map(([n, t], i) => (
            <div key={i} className="pstat" style={{ padding: "32px 0", borderBottom: "1px solid rgba(244,240,232,.07)", display: "flex", alignItems: "baseline", gap: 20, transitionDelay: `${i * .15}s` }}>
              <div className="pstat-n" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, color: "var(--red)", lineHeight: 1, minWidth: 160, letterSpacing: ".02em" }}>{n}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, lineHeight: 1.6, color: "var(--muted2)" }}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PILLARS ─── */
const PILLARS = [
  { n: "01", icon: "🎬", name: "Pitch Reel", desc: "90-second video pitch. Seen by real investors. No warm intros. No gatekeepers.", tag: "Go Live →", locked: false, to: "/login" },
  { n: "02", icon: "💎", name: "Investor AI", desc: "AI-powered investor matchmaking. Right investor, right stage, right moment.", tag: "Raise Capital →", locked: false, to: "/login" },
  { n: "03", icon: "🤖", name: "021 AI", desc: "Your virtual C-suite. CEO · CMO · CTO · CFO — all running in parallel, 24/7.", tag: "Meet 021 →", locked: false, href: "https://021.evoa.co.in" },
  { n: "04", icon: "⚡", name: "EVOA Hire", desc: "Hire humans and deploy AI agents simultaneously.", tag: "Coming Soon", locked: true },
  { n: "05", icon: "🏹", name: "Trade Arena", desc: "Test your product with real users before you build.", tag: "Coming Soon", locked: true },
  { n: "06", icon: "⚔️", name: "Battleground", desc: "Compete. Win. Get noticed.", tag: "Coming Soon", locked: true },
];
function Pillars() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) document.querySelectorAll(".pillar").forEach((el, i) => setTimeout(() => el.classList.add("vis"), i * 100));
    }, { threshold: .08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section id="pillars" ref={ref} className="pillars-sec" style={{ padding: "140px 48px 100px", background: "var(--grey)", position: "relative", overflow: "hidden" }}>
      <div className="ghost">02</div>
      <div className="reveal" style={{ maxWidth: 640, marginBottom: 80, position: "relative", zIndex: 1 }}>
        <div className="stag">The Platform</div>
        <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,5vw,72px)", lineHeight: .94, letterSpacing: ".02em", marginBottom: 20 }}>Six weapons.<br />One arena.</h2>
        <p style={{ fontSize: "clamp(14px,1.8vw,17px)", fontWeight: 300, lineHeight: 1.7, color: "var(--muted2)" }}>Every tool a startup needs to go from idea to funded — in a single ecosystem designed for the relentless.</p>
      </div>
      <div className="pillars-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 2, position: "relative", zIndex: 1 }}>
        {PILLARS.map((p, i) => (
          <div key={i} className="pillar" style={{ background: "var(--black)", padding: "32px 22px 28px", position: "relative", overflow: "hidden", border: "1px solid rgba(244,240,232,.04)", transitionDelay: `${i * .08}s`, ...(p.locked && { filter: "blur(2px)", pointerEvents: "none" }) }}>
            <div className="pbar" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,var(--red),var(--gold))", transform: "scaleX(0)", transformOrigin: "left", transition: "transform .4s" }} />
            {p.locked && (
              <div style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 4, background: "rgba(201,168,76,.12)", border: "1px solid rgba(201,168,76,.25)", padding: "3px 8px", borderRadius: 2 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--gold)" }}>Locked</span>
              </div>
            )}
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: p.locked ? "var(--muted)" : "var(--red)", letterSpacing: ".1em", marginBottom: 28 }}>{p.n}</div>
            <span className="picon" style={{ fontSize: 28, marginBottom: 16, display: "block", filter: p.locked ? "saturate(0) brightness(.4)" : "saturate(0) brightness(1.5)", transition: "filter .3s" }}>{p.icon}</span>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: ".04em", marginBottom: 10, color: p.locked ? "var(--muted)" : "var(--white)" }}>{p.name}</div>
            <p style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.7, color: "var(--muted)" }}>{p.desc}</p>
            {p.to ? (
              <Link to={p.to} className="ptag" style={{ display: "inline-block", marginTop: 18, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--red)", padding: "4px 10px", border: "1px solid rgba(232,52,26,.3)", opacity: 0, transition: "opacity .3s", textDecoration: "none", cursor: "pointer" }}>{p.tag}</Link>
            ) : p.href ? (
              <a href={p.href} target="_blank" rel="noopener noreferrer" className="ptag" style={{ display: "inline-block", marginTop: 18, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--red)", padding: "4px 10px", border: "1px solid rgba(232,52,26,.3)", opacity: 0, transition: "opacity .3s", textDecoration: "none", cursor: "pointer" }}>{p.tag}</a>
            ) : (
              <span className="ptag" style={{ display: "inline-block", marginTop: 18, fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: p.locked ? "var(--muted)" : "var(--red)", padding: "4px 10px", border: `1px solid ${p.locked ? "rgba(244,240,232,.1)" : "rgba(232,52,26,.3)"}`, opacity: 0, transition: "opacity .3s" }}>{p.tag}</span>
            )}
          </div>
        ))}
      </div>
      <div className="reveal" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 60, position: "relative", zIndex: 1, flexWrap: "wrap" }}>
        <Link to="/register" className="bfire" style={{ padding: "16px 40px" }}>Create Account — Free</Link>
        <Link to="/register" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", padding: "15px 40px", color: "var(--white)", textDecoration: "none", border: "1px solid rgba(244,240,232,.2)", display: "inline-block", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))" }}>Start Pitching →</Link>
      </div>
    </section>
  );
}

/* ─── AI SECTION ─── */
function AISection() {
  const [msgs, setMsgs] = useState([
    { from: "user", text: "How do I improve my startup's unit economics before Series A?" },
    { from: "ai", text: "Your LTV:CAC ratio is 15.3x — strong. Focus on reducing churn below 2% and expanding ACV by 20% through upsell motions. Target payback period under 6 months." },
  ]);
  const [inp, setInp] = useState("");
  const [typing, setTyping] = useState(false);
  const bottom = useRef(null);
  const chatContainer = useRef(null);
  useEffect(() => {
    if (chatContainer.current) {
      chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
    }
  }, [msgs]);
  const send = () => {
    if (!inp.trim()) return;
    setMsgs(m => [...m, { from: "user", text: inp.trim() }]);
    setInp(""); setTyping(true);
    setTimeout(() => {
      setMsgs(m => [...m, { from: "ai", text: "The 021 AI C-suite is analysing your query across all four executive lenses — strategy, growth, tech, and finance. Your comprehensive answer is ready." }]);
      setTyping(false);
    }, 1800);
  };
  return (
    <section id="ai" className="ai-sec" style={{ padding: "120px 48px 140px", background: "var(--black)", position: "relative", overflow: "hidden" }}>
      <div className="ghost">03</div>
      <div className="ai-hdr reveal" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "flex-end", marginBottom: 60, position: "relative", zIndex: 1 }}>
        <div>
          <div className="stag">021 AI System</div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,6vw,88px)", lineHeight: .94, letterSpacing: ".02em" }}>
            Your <span style={{ color: "var(--red)" }}>AI</span> Co-Founder
            <em style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontWeight: 300, color: "var(--gold)", display: "block", fontSize: ".72em", lineHeight: 1.2 }}>is already waiting.</em>
          </h2>
        </div>
        <div>
          <p style={{ fontSize: "clamp(15px,2vw,18px)", fontWeight: 300, lineHeight: 1.8, color: "var(--muted2)", marginBottom: 32 }}>The 021 AI system isn't a chatbot. It's a full executive team — CEO, CMO, CTO, CFO — operating in parallel, 24/7.</p>
          <Link to="/register" className="bfire">Click to Turn Your Idea Into Reality →</Link>
        </div>
      </div>
      <div className="ai-app reveal" style={{ position: "relative", zIndex: 1, transitionDelay: ".2s" }}>
        <div style={{ background: "#0a0a0f", border: "1px solid rgba(244,240,232,.08)", borderRadius: 4, overflow: "hidden", boxShadow: "0 40px 120px rgba(0,0,0,.8)" }}>
          <div style={{ background: "#060609", padding: "10px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(244,240,232,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "var(--white)", letterSpacing: ".12em" }}>021 AI</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "var(--muted)" }}>CO-FOUNDER INTERFACE</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>{["#ff5f57", "#ffbd2e", "#28c840"].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}</div>
          </div>
          <div className="ai-cols" style={{ display: "grid", gridTemplateColumns: "190px 1fr 170px", height: 480 }}>
            {/* Sidebar */}
            <div className="ai-sb" style={{ background: "#08080d", borderRight: "1px solid rgba(244,240,232,.05)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: 12 }}><div style={{ background: "rgba(232,52,26,.1)", border: "1px solid rgba(232,52,26,.2)", borderRadius: 3, padding: "8px 12px", fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--muted2)", cursor: "pointer" }}>+ New Chat</div></div>
              <div style={{ flex: 1, padding: "0 8px" }}>
                {["New Chat", "Online Milk Shop", "E-commerce Solut...", "Pitchroom"].map((item, i) => (
                  <div key={i} style={{ padding: "8px 10px", fontFamily: "'DM Mono',monospace", fontSize: 9, color: i === 0 ? "var(--muted2)" : "var(--muted)", background: i === 0 ? "rgba(244,240,232,.05)" : "transparent", marginBottom: 2, borderRadius: 3, cursor: "pointer" }}>💬 {item}</div>
                ))}
              </div>
              <div style={{ padding: 10 }}><div style={{ background: "linear-gradient(135deg,#6B3FA0,#3A1F6B)", borderRadius: 4, padding: 9, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "#fff", textAlign: "center", cursor: "pointer" }}>Switch to Pro</div></div>
              <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(244,240,232,.05)", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#2a1a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>👤</div>
                <div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "var(--muted2)" }}>adityanarayan...</div><div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, color: "var(--muted)" }}>Free tier</div></div>
              </div>
            </div>
            {/* Chat */}
            <div className="ai-chat" style={{ display: "flex", flexDirection: "column", background: "#0a0a0f", height: 480 }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(244,240,232,.05)" }}><span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: "var(--white)" }}>👤 CFO</span></div>
              <div ref={chatContainer} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {msgs.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: 8 }}>
                    {m.from === "ai" && <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1a1108", border: "1px solid rgba(232,168,52,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>💰</div>}
                    <div style={{ maxWidth: "76%", padding: "10px 14px", background: m.from === "user" ? "rgba(232,52,26,.12)" : "rgba(244,240,232,.04)", border: `1px solid ${m.from === "user" ? "rgba(232,52,26,.2)" : "rgba(244,240,232,.07)"}`, borderRadius: 3 }}>
                      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: m.from === "user" ? "var(--muted3)" : "var(--muted2)" }}>{m.text}</p>
                    </div>
                  </div>
                ))}
                {typing && <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1a1108", border: "1px solid rgba(232,168,52,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>💰</div><div style={{ padding: "10px 14px", background: "rgba(244,240,232,.04)", border: "1px solid rgba(244,240,232,.07)", borderRadius: 3, display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)", animation: `blink 1.2s ease-in-out infinite ${i * .2}s` }} />)}</div></div>}

              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid rgba(244,240,232,.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(244,240,232,.04)", border: "1px solid rgba(244,240,232,.08)", borderRadius: 3, padding: "8px 12px" }}>
                  <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Type your message here..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 300, color: "var(--muted2)" }} />
                  <button onClick={send} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted2)", fontSize: 16 }}>➤</button>
                </div>
              </div>
            </div>
            {/* Advisors */}
            <div className="ai-adv" style={{ background: "#06060a", borderLeft: "1px solid rgba(244,240,232,.05)", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: 12, borderBottom: "1px solid rgba(244,240,232,.05)" }}><div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)" }}>C-Suite Advisors →</div></div>
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
                {[{ role: "CEO", c: "#E8341A", bg: "#1a0a08", s: "ready" }, { role: "CMO", c: "#4EC896", bg: "#081a10", s: "active" }, { role: "CTO", c: "#9B8FE8", bg: "#0e0818", s: "ready" }, { role: "CFO", c: "#E8A834", bg: "#1a1108", s: "ready" }].map((a, i) => (
                  <div key={i} style={{ border: `1px solid ${a.c}33`, borderRadius: 3, background: a.bg }}>
                    <div style={{ padding: "5px 9px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, color: a.s === "active" ? a.c : "#888" }}>● {a.s}</span>
                      {a.s === "active" && <span style={{ width: 5, height: 5, background: a.c, borderRadius: "50%", display: "inline-block" }} />}
                    </div>
                    <div style={{ padding: "6px 9px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 46, height: 46, borderRadius: "50%", background: a.bg, border: `2px solid ${a.c}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤖</div>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 14, color: a.c, letterSpacing: ".06em" }}>{a.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: -40, left: "20%", right: "20%", height: 80, background: "radial-gradient(ellipse,rgba(232,52,26,.15),transparent 70%)", pointerEvents: "none", filter: "blur(20px)" }} />
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
const HOW = [
  { n: 1, acc: "var(--red)", cls: "hf0", title: "Create Your Account", desc: "Sign up with email or phone, choose your role — Startup, Investor, Incubator, or Viewer." },
  { n: 2, acc: "var(--gold)", cls: "hf1", title: "Complete Your Profile", desc: "Startups: founder details, verification & pitch. Investors: ticket size, sector focus. Incubators: programs & documents." },
  { n: 3, acc: "var(--red)", cls: "hf2", title: "Discover & Pitch", desc: "Discover pitches from Home feed, Explore page, and Battleground. Watch pitch reels, like, comment, share, and support." },
  { n: 4, acc: "var(--gold)", cls: "hf3", title: "Connect & Close Deals", desc: "Comments, messages, offers, battlegrounds — all lead you to real conversations and deals." },
];
function HowItWorks() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true);
        document.querySelectorAll(".how-card").forEach((el, i) => setTimeout(() => { el.classList.add("vis"); el.style.opacity = "1"; el.style.transform = "translateY(0)"; }, 150 + i * 180));
      }
    }, { threshold: .05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section id="how" ref={ref} className="how-sec" style={{ padding: "140px 48px 160px", background: "var(--black)", position: "relative", overflow: "hidden" }}>
      <div className="ghost" style={{ right: "auto", left: -10 }}>03</div>
      <div style={{ position: "absolute", top: -120, left: -120, width: 500, height: 500, background: "radial-gradient(circle,rgba(232,52,26,.07),transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, right: -60, width: 440, height: 440, background: "radial-gradient(circle,rgba(201,168,76,.07),transparent 65%)", pointerEvents: "none" }} />
      <div style={{ textAlign: "center", position: "relative", zIndex: 2, marginBottom: 80 }}>
        <div className={`reveal${vis ? " vis" : ""}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".26em", textTransform: "uppercase", color: "var(--red)", marginBottom: 22 }}>
          <span style={{ width: 28, height: 1, background: "var(--red)", display: "inline-block" }} />Simple Process<span style={{ width: 28, height: 1, background: "var(--red)", display: "inline-block" }} />
        </div>
        <h2 className={`reveal${vis ? " vis" : ""}`} style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(56px,8.5vw,120px)", lineHeight: .88, letterSpacing: ".025em", marginBottom: 24, transitionDelay: ".1s" }}>
          How It <span style={{ WebkitTextStroke: "1px var(--gold)", WebkitTextFillColor: "transparent" }}>Works</span>
        </h2>
        <p className={`reveal${vis ? " vis" : ""}`} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(16px,2vw,20px)", fontWeight: 300, fontStyle: "italic", color: "var(--muted2)", transitionDelay: ".2s" }}>Get started in four simple steps</p>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--red) 30%,var(--gold) 70%,transparent)", width: vis ? 280 : 0, transition: "width 1.4s cubic-bezier(.4,0,.2,1) .3s" }} />
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto" }}>
        <svg className="how-svg" style={{ position: "absolute", top: 52, left: "6%", width: "88%", height: 10, overflow: "visible", pointerEvents: "none", zIndex: 1 }} viewBox="0 0 1200 10">
          <defs><linearGradient id="hlg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#E8341A" stopOpacity="0" /><stop offset="20%" stopColor="#E8341A" stopOpacity="1" /><stop offset="50%" stopColor="#C9A84C" stopOpacity="1" /><stop offset="80%" stopColor="#E8341A" stopOpacity="1" /><stop offset="100%" stopColor="#E8341A" stopOpacity="0" /></linearGradient></defs>
          <path d="M 0 5 L 1200 5" fill="none" stroke="url(#hlg)" strokeWidth="1" />
          {[0, 400, 800, 1200].map((x, i) => <g key={i}><circle cx={x} cy="5" r="5" fill="var(--black)" stroke={i % 2 === 0 ? "#E8341A" : "#C9A84C"} strokeWidth="1.5" /></g>)}
        </svg>
        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {HOW.map((s, i) => (
            <div key={i} className={`how-card ${s.cls}`} style={{ transitionDelay: `${i * .15}s` }}>
              <div className="how-inner" style={{ position: "relative", padding: "44px 28px 36px", background: "rgba(244,240,232,.02)", border: "1px solid rgba(244,240,232,.07)", overflow: "hidden", height: "100%" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 0, height: 0, borderStyle: "solid", borderWidth: "0 24px 24px 0", borderColor: `transparent ${s.n % 2 === 0 ? "rgba(201,168,76,.2)" : "rgba(232,52,26,.2)"} transparent transparent` }} />
                <div style={{ display: "flex", alignItems: "baseline", marginBottom: 18 }}>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 80, lineHeight: 1, color: "var(--white)", opacity: .3 }}>0</span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 80, lineHeight: 1, color: s.acc }}>{s.n}</span>
                </div>
                <div className="hacc" style={{ width: 32, height: 2, background: `linear-gradient(90deg,${s.acc},transparent)`, marginBottom: 16, transition: "width .5s ease .3s" }} />
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: ".04em", color: "var(--white)", marginBottom: 12, lineHeight: 1.1 }}>{s.title}</div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 300, lineHeight: 1.85, color: "var(--muted)" }}>{s.desc}</p>
                <div style={{ position: "absolute", bottom: 16, right: 20, fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(244,240,232,.15)" }}>{s.n} / 4</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`reveal${vis ? " vis" : ""}`} style={{ textAlign: "center", marginTop: 72, position: "relative", zIndex: 2, transitionDelay: ".6s" }}>
        <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom,transparent,var(--gold))", margin: "0 auto 28px" }} />
        <Link to="/register" className="bfire" style={{ padding: "18px 52px" }}>Create Your Account — Free</Link>
        <p style={{ marginTop: 16, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontStyle: "italic", fontWeight: 300, color: "var(--muted)" }}>No gatekeepers. No warm intros. Just your idea.</p>
      </div>
    </section>
  );
}

/* ─── SEGMENTS ─── */
const SEGS = [
  { n: "01", tag: "Founders", t1: "Build", t2: "Empires.", c: "var(--red)", bg: "#0E0504", glow: "rgba(232,52,26,.1)", icon: "🚀", items: ["Pitch to 1000+ investors", "021 AI co-founder", "Product validation tools", "Hire talent & AI agents", "Compete in Battleground"] },
  { n: "02", tag: "Investors", t1: "Fund", t2: "Futures.", c: "var(--gold)", bg: "#0E0B02", glow: "rgba(201,168,76,.1)", icon: "💎", items: ["AI-matched deal flow", "90s pitch reels", "Traction dashboards", "Direct founder access", "Portfolio analytics"] },
  { n: "03", tag: "Visionaries", t1: "Dream", t2: "Big.", c: "#9B8FE8", bg: "#080510", glow: "rgba(155,143,232,.1)", icon: "🔭", items: ["Explore pitch feed daily", "Connect with incubators", "Discover co-founders", "Track emerging sectors", "Learn from live deals"] },
  { n: "04", tag: "Incubators", t1: "Nurture", t2: "Unicorns.", c: "#4EC896", bg: "#02100A", glow: "rgba(78,200,150,.1)", icon: "🏛️", items: ["Verified portfolio page", "Cohort investor access", "Startup showcase tools", "Program management", "Impact analytics"] },
];
function Segments() {
  const ref = useRef(null);
  const [active, setActive] = useState(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) document.querySelectorAll(".seg-wrap").forEach((el, i) => setTimeout(() => el.classList.add("on"), i * 150));
    }, { threshold: .05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section id="segments" ref={ref} className="seg-sec" style={{ padding: "140px 48px 160px", background: "var(--grey)", position: "relative", overflow: "hidden" }}>
      <div className="ghost">04</div>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,var(--red) 30%,var(--gold) 70%,transparent)", opacity: .4, zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2, marginBottom: 72 }}>
        <div className="reveal"><div className="stag">Built For</div></div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <h2 className="reveal" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(52px,6.5vw,96px)", lineHeight: .88, letterSpacing: ".025em", transitionDelay: ".1s" }}>
            Four worlds.<br /><span style={{ WebkitTextStroke: "1px var(--gold)", WebkitTextFillColor: "transparent" }}>One platform.</span>
          </h2>
          <p className="reveal" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(14px,1.8vw,18px)", fontWeight: 300, lineHeight: 1.7, color: "var(--muted2)", maxWidth: 380, transitionDelay: ".2s", paddingBottom: 8 }}>Every person in the startup universe has a seat at the EVOA table — no matter where they are in their journey.</p>
        </div>
      </div>
      <div className="seg-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 3, position: "relative", zIndex: 2 }}>
        {SEGS.map((s, i) => (
          <div key={i} className="seg-wrap" style={{ animationDelay: `${i * .15}s` }}>
            <div onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              style={{ position: "relative", height: "100%", background: s.bg, border: `1px solid ${active === i ? "rgba(244,240,232,.12)" : "rgba(244,240,232,.05)"}`, padding: "44px 28px 40px", overflow: "hidden", transition: "all .4s cubic-bezier(.23,1,.32,1)", transform: active === i ? "translateY(-10px)" : "none" }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 100% 80% at 50% -10%,${s.glow},transparent 65%)`, opacity: active === i ? 1 : .3, transition: "opacity .5s", pointerEvents: "none" }} />
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom,transparent,${s.c} 30%,${s.c} 70%,transparent)`, opacity: active === i ? 1 : .2, transition: "opacity .4s" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, position: "relative", zIndex: 1 }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".2em", color: s.c, opacity: .7 }}>{s.n} / {s.tag.toUpperCase()}</span>
                <span style={{ fontSize: 24, lineHeight: 1, filter: active === i ? "none" : "saturate(0) brightness(.6)", transition: "filter .4s" }}>{s.icon}</span>
              </div>
              <div style={{ position: "relative", zIndex: 1, marginBottom: 20 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,4.5vw,56px)", lineHeight: .9, color: active === i ? s.c : "var(--white)", transition: "color .4s" }}>{s.t1}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,4.5vw,56px)", lineHeight: .9, color: active === i ? s.c : "var(--white)", transition: "color .4s" }}>{s.t2}</div>
              </div>
              <div style={{ width: active === i ? 52 : 28, height: 1.5, background: `linear-gradient(90deg,${s.c},transparent)`, marginBottom: 18, transition: "width .4s", position: "relative", zIndex: 1 }} />
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontWeight: 300, lineHeight: 1.8, color: active === i ? "var(--muted2)" : "var(--muted)", marginBottom: 24, position: "relative", zIndex: 1, transition: "color .3s" }}>
                {s.tag === "Founders" ? "From first idea to Series A. EVOA gives you the tools, AI co-founder, and global stage." : s.tag === "Investors" ? "AI-curated deal flow from verified startups. Watch 90-second pitch reels, track traction live." : s.tag === "Visionaries" ? "You have the vision. Explore the ecosystem, discover startups worth building, connect with incubators." : "Build a verified portfolio. Connect your cohort to global investors."}
              </p>
              <ul style={{ listStyle: "none", position: "relative", zIndex: 1 }}>
                {s.items.map((item, j) => (
                  <li key={j} style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".1em", textTransform: "uppercase", color: active === i ? "var(--muted2)" : "var(--muted)", padding: "6px 0", borderBottom: "1px solid rgba(244,240,232,.04)", display: "flex", alignItems: "center", gap: 8, transition: "color .2s" }}>
                    <span style={{ color: s.c, fontSize: 7 }}>▸</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── FEATURES ─── */
const FEATS = [
  { id: "01", title: "Instant AI-Powered Matching", desc: "AI-powered connections match startups with the right investors effortlessly. No cold outreach. Just signal.", side: "right", acc: "#E8341A" },
  { id: "02", title: "Secure Enterprise-Grade Platform", desc: "Robust security and verification. CIN · GST · SEBI · PAN — all verified. Bank-level encryption at every scale.", side: "left", acc: "#C9A84C" },
  { id: "03", title: "Instant & Reliable Pitch Creation", desc: "Generate high-quality pitch videos and decks instantly. Pitch reel, deck, deal terms — one clear investor view.", side: "right", acc: "#E8341A" },
  { id: "04", title: "Smart Discovery & Search", desc: "Find hundreds of quality startups, investors, and opportunities. Intelligent filters. Zero noise. Maximum signal.", side: "left", acc: "#C9A84C" },
  { id: "05", title: "Real-Time Notifications & Updates", desc: "Instant alerts for offers, messages, battlegrounds, and trending updates. Never miss the moment.", side: "right", acc: "#E8341A" },
  { id: "06", title: "Analytics & Performance Insights", desc: "Detailed engagement insights with easy-to-track performance metrics. Know your numbers. Own your growth.", side: "left", acc: "#C9A84C" },
];
function FeatCard({ f, active }) {
  return (
    <div style={{ padding: "40px 52px", background: "rgba(244,240,232,.02)", border: "1px solid rgba(244,240,232,.07)", position: "relative", overflow: "hidden", transition: "transform .15s" }}>
      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: ".24em", textTransform: "uppercase", color: f.acc, marginBottom: 14, opacity: .8, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 16, height: 1, background: f.acc, display: "inline-block" }} />Feature {f.id}
      </div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(22px,2.4vw,34px)", letterSpacing: active ? ".06em" : ".025em", lineHeight: 1, color: active ? f.acc : "var(--white)", marginBottom: 16, transition: "color .35s,letter-spacing .4s" }}>{f.title}</div>
      <div style={{ width: active ? 64 : 28, height: 2, background: `linear-gradient(90deg,${f.acc},transparent)`, marginBottom: 16, transition: "width .5s cubic-bezier(.23,1,.32,1)" }} />
      <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 300, lineHeight: 1.85, color: active ? "var(--muted3)" : "var(--muted2)", maxWidth: 400, transition: "color .35s" }}>{f.desc}</p>
    </div>
  );
}
function Features() {
  const ref = useRef(null), spineRef = useRef(null);
  const [active, setActive] = useState(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVis(true);
        if (spineRef.current) spineRef.current.classList.add("drawn");
        document.querySelectorAll(".feat-row").forEach((el, i) => setTimeout(() => { el.classList.add(el.dataset.side === "right" ? "onR" : "onL"); el.style.opacity = "1"; }, i * 140));
      }
    }, { threshold: .04 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section id="features" ref={ref} className="feat-sec" style={{ padding: "140px 0 180px", background: "var(--black)", position: "relative", overflow: "hidden" }}>
      <div className="fscan" />
      <div className="ghost" style={{ right: "auto", left: -10 }}>05</div>
      <div style={{ position: "absolute", top: "10%", left: "-8%", width: 600, height: 600, background: "radial-gradient(circle,rgba(232,52,26,.06),transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "-8%", width: 500, height: 500, background: "radial-gradient(circle,rgba(201,168,76,.06),transparent 65%)", pointerEvents: "none" }} />
      <div className="feat-hdr" style={{ textAlign: "center", padding: "0 48px 100px", position: "relative", zIndex: 2 }}>
        <div className={`reveal${vis ? " vis" : ""}`} style={{ marginBottom: 28 }}><div className="stag" style={{ justifyContent: "center" }}>Powerful Features</div></div>
        <div className={`reveal${vis ? " vis" : ""}`} style={{ position: "relative", display: "inline-block", transitionDelay: ".1s" }}>
          <h2 className="fts" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px,8.5vw,116px)", lineHeight: .88, letterSpacing: ".025em", position: "relative", zIndex: 1 }}>
            One Platform. <span style={{ WebkitTextStroke: "1.5px var(--red)", WebkitTextFillColor: "transparent" }}>Zero Noise.</span>
          </h2>
          <div className="gr">One Platform. Zero Noise.</div>
          <div className="gb">One Platform. Zero Noise.</div>
        </div>
        <p className={`reveal${vis ? " vis" : ""}`} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(16px,2vw,20px)", fontWeight: 300, fontStyle: "italic", color: "var(--muted2)", maxWidth: 560, margin: "20px auto 0", transitionDelay: ".2s" }}>A powerful platform designed to simplify startup-investor connections, pitch management, and deal tracking.</p>
        <div className={`reveal${vis ? " vis" : ""}`} style={{ display: "flex", justifyContent: "center", gap: 36, marginTop: 48, transitionDelay: ".3s", flexWrap: "wrap" }}>
          {[["6", "Features Live", "red"], ["100%", "Verified", "gold"], ["021", "AI-Powered", "red"], ["∞", "Scalable", "gold"]].map(([v, l, c], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: c === "red" ? "var(--red)" : "var(--gold)", letterSpacing: ".04em" }}>{v}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <svg style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 0, width: 2, height: "100%", overflow: "visible", zIndex: 1, pointerEvents: "none" }}>
          <defs>
            <linearGradient id="fsg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="transparent" /><stop offset="10%" stopColor="#E8341A" stopOpacity=".8" /><stop offset="35%" stopColor="#C9A84C" /><stop offset="65%" stopColor="#E8341A" /><stop offset="90%" stopColor="#C9A84C" stopOpacity=".8" /><stop offset="100%" stopColor="transparent" /></linearGradient>
            <filter id="fglow"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <line ref={spineRef} className="fspine" x1="1" y1="0" x2="1" y2="10000" stroke="url(#fsg)" strokeWidth="1.5" filter="url(#fglow)" />
        </svg>
        {FEATS.map((f, i) => {
          const isR = f.side === "right", isA = active === i;
          return (
            <div key={i} className="feat-row" data-side={f.side} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", alignItems: "center", animationDelay: `${i * .14}s` }}>
              <div className={isR ? "feat-slot" : "feat-slot"} style={{ padding: "0", opacity: isR ? (isA ? .07 : .06) : 1, transition: "opacity .5s" }}>
                {!isR && <FeatCard f={f} active={isA} />}
              </div>
              <div className="feat-mid" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 4 }}>
                <div style={{ position: "relative", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: isA ? 18 : 11, height: isA ? 18 : 11, borderRadius: "50%", background: isA ? f.acc : "var(--black)", border: `2px solid ${f.acc}`, transition: "all .35s cubic-bezier(.23,1,.32,1)", boxShadow: isA ? `0 0 24px ${f.acc},0 0 60px ${f.acc}44` : "none", zIndex: 5, position: "relative" }} />
                </div>
              </div>
              <div className="feat-slot" style={{ padding: "0", opacity: !isR ? (isA ? .07 : .06) : 1, transition: "opacity .5s" }}>
                {isR && <FeatCard f={f} active={isA} />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── MISSION ─── */
function Mission() {
  return (
    <section id="mission" className="mission-sec" style={{ padding: "160px 48px", background: "var(--black)", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(100px,18vw,200px)", letterSpacing: ".08em", color: "rgba(244,240,232,.02)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", whiteSpace: "nowrap", pointerEvents: "none", userSelect: "none" }}>EVOA</div>
      <p className="reveal" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(20px,3.5vw,48px)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.4, maxWidth: 900, margin: "0 auto 40px", color: "var(--white)", position: "relative", zIndex: 2 }}>
        "We are building the world's first <em style={{ color: "var(--gold)", fontStyle: "normal" }}>video-based</em> startup ecosystem — where your idea and your execution are the only credentials that matter."
      </p>
      <div className="reveal" style={{ position: "relative", zIndex: 2, transitionDelay: ".2s", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ width: 1, height: 32, background: "linear-gradient(to bottom,transparent,var(--gold))", marginBottom: 4 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ width: 28, height: 1, background: "var(--red)", display: "inline-block" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--white)" }}>Aditya Narayan Singh</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginTop: 3 }}>Co-Founder &amp; CEO · EVOA</div>
          </div>
          <span style={{ width: 28, height: 1, background: "var(--red)", display: "inline-block" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 16, height: 1, background: "rgba(244,240,232,.12)", display: "inline-block" }} />
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
          <span style={{ width: 16, height: 1, background: "rgba(244,240,232,.12)", display: "inline-block" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <span style={{ width: 28, height: 1, background: "var(--gold)", display: "inline-block" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--white)" }}>Abhishek Kumar</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--muted)", marginTop: 3 }}>Co-Founder &amp; CTO · EVOA</div>
          </div>
          <span style={{ width: 28, height: 1, background: "var(--gold)", display: "inline-block" }} />
        </div>
      </div>
    </section>
  );
}

/* ─── LAUNCH ─── */
function Launch() {
  return (
    <section id="launch" className="launch-sec" style={{ padding: "100px 48px", background: "var(--red)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(-45deg,rgba(0,0,0,.04) 0,rgba(0,0,0,.04) 1px,transparent 1px,transparent 8px)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(6,6,7,.6)", marginBottom: 12 }}>Global Launch</div>
        <div className="launch-d" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(56px,8vw,120px)", lineHeight: .88, color: "var(--black)", letterSpacing: ".02em" }}>26.03.2026</div>
      </div>
      <div className="launch-r" style={{ position: "relative", zIndex: 2, textAlign: "right" }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(16px,2vw,22px)", fontWeight: 300, fontStyle: "italic", color: "rgba(6,6,7,.7)", marginBottom: 28, maxWidth: 360 }}>The future of the startup ecosystem goes live. Be the first inside.</p>
        <Link to="/register" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", padding: "16px 36px", background: "var(--black)", color: "var(--white)", textDecoration: "none", clipPath: "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))", display: "inline-block" }}>Claim Your Spot — Free</Link>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
const LI = ({ href, to, onClick, children }) => {
  const [hov, setHov] = useState(false);
  const style = { fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 300, color: hov ? "rgba(244,240,232,.9)" : "rgba(244,240,232,.5)", textDecoration: "none", transition: "color .2s", background: "none", border: "none", cursor: "pointer", padding: 0 };
  if (to) return <li><Link to={to} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={style}>{children}</Link></li>;
  if (onClick) return <li><button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={style}>{children}</button></li>;
  return <li><a href={href || "#"} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={style}>{children}</a></li>;
};
const SocialIcon = ({ children }) => {
  const [hov, setHov] = useState(false);
  return (
    <a href="#" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ width: 36, height: 36, border: `1px solid ${hov ? "rgba(244,240,232,.4)" : "rgba(244,240,232,.15)"}`, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: hov ? "rgba(244,240,232,.05)" : "transparent", transition: "all .2s", textDecoration: "none" }}>
      {children}
    </a>
  );
};

/* ─── POLICY MODALS ─── */
const MODAL_STYLES = `
.ln-modal-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.7);backdrop-filter:blur(8px);cursor:default}
.ln-modal-box{position:relative;width:100%;max-width:760px;max-height:80vh;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;background:#111;border:1px solid rgba(244,240,232,.1);box-shadow:0 40px 120px rgba(0,0,0,.8)}
.ln-modal-hdr{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(244,240,232,.08)}
.ln-modal-hdr h2{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.06em;color:#F4F0E8;margin:0}
.ln-modal-close{background:none;border:none;cursor:pointer!important;color:rgba(244,240,232,.5);padding:8px;display:flex;transition:color .2s;border-radius:4px}
.ln-modal-close:hover{color:#F4F0E8}
.ln-modal-body{padding:24px;overflow-y:auto;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:300;line-height:1.8;color:rgba(244,240,232,.7)}
.ln-modal-body h3{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.05em;color:#C9A84C;margin:24px 0 8px}
.ln-modal-body h4{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(244,240,232,.7);margin:16px 0 6px}
.ln-modal-body ul{padding-left:20px;margin:8px 0}
.ln-modal-body li{margin-bottom:4px}
.ln-modal-body p{margin-bottom:12px}
.ln-modal-body a{color:#E8341A;text-decoration:none}
.ln-modal-body a:hover{text-decoration:underline}
.ln-modal-warn{background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.2);border-radius:6px;padding:14px 18px;margin:12px 0;display:flex;gap:12px;align-items:flex-start}
`;

function PolicyModal({ title, children, onClose }) {
  useEffect(() => {
    const esc = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div className="ln-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ln-modal-box">
        <div className="ln-modal-hdr">
          <h2>{title}</h2>
          <button className="ln-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="ln-modal-body">{children}</div>
      </div>
    </div>
  );
}

function Footer() {
  const [modal, setModal] = useState(null); // "privacy" | "terms" | "ai" | "community"
  const close = () => setModal(null);
  return (
    <>
      <style>{MODAL_STYLES}</style>
      <footer className="footer-sec" style={{ padding: "64px 48px 32px", background: "#0A0A0A", borderTop: "1px solid rgba(244,240,232,.06)" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", gap: 48, marginBottom: 52 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, letterSpacing: ".12em", color: "var(--white)", marginBottom: 16 }}>EVO-A</div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: "rgba(244,240,232,.45)", maxWidth: 340, marginBottom: 24 }}>Revolutionizing the startup–investor ecosystem. Connect, invest, and grow together in the future of entrepreneurship.</p>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <SocialIcon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(244,240,232,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                </svg>
              </SocialIcon>
              <SocialIcon>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(244,240,232,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </SocialIcon>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--white)", fontWeight: 500, marginBottom: 24 }}>Quick Links</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              <LI to="/">Home</LI><LI to="/login">Sign In</LI><LI to="/register">Sign Up</LI><LI to="/about">About Us</LI>
            </ul>
          </div>
          {/* Support */}
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--white)", fontWeight: 500, marginBottom: 24 }}>Support</div>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
              <LI onClick={() => setModal("privacy")}>Privacy Policy</LI>
              <LI onClick={() => setModal("terms")}>Terms of Service</LI>
              <LI onClick={() => setModal("ai")}>AI Disclaimer</LI>
              <LI onClick={() => setModal("community")}>Community Guidelines</LI>
            </ul>
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(244,240,232,.07)", marginBottom: 24 }} />
        <div style={{ textAlign: "center", fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: ".1em", color: "rgba(244,240,232,.3)" }}>© 2026 EVO-A. All rights reserved.</div>
      </footer>

      {/* ── PRIVACY POLICY ── */}
      {modal === "privacy" && (
        <PolicyModal title="Privacy Policy" onClose={close}>
          <p><strong>Evoa Technology Private Limited</strong> ("Evoa", "Company", "we", "us", or "our") respects your privacy and is committed to protecting your personal data.</p>
          <p>This Privacy Policy explains how we collect, use, store, and protect your information when you use the Evoa platform, Investor AI, 021 AI, our website <strong>evoa.co.in</strong>, and any related services.</p>
          <p><em>By using Evoa services, you agree to the collection and use of information in accordance with this policy.</em></p>
          <h3>1. About Evoa</h3>
          <p>Evoa is a digital platform designed to connect startup founders, investors, builders, and startup enthusiasts. Users can pitch startup ideas through short video reels, explore startups, validate ideas using AI tools, and connect with investors.</p>
          <h3>2. Information We Collect</h3>
          <h4>2.1 Personal Information</h4>
          <p>When you register or use our services, we may collect: full name, username, email address, profile photo, password (encrypted), country/location, startup information, and investor profile information.</p>
          <h4>2.2 Startup Information</h4>
          <p>If you upload a pitch or startup information, we may collect: startup name & description, pitch videos, business model information, financial insights (if voluntarily provided), and market & product information. <em>This data may be displayed publicly depending on your settings.</em></p>
          <h4>2.3 AI Interaction Data</h4>
          <p>When you interact with Investor AI or 021 AI, we may collect: startup ideas you submit, AI prompts and responses, feedback and ratings, AI generated outputs, and chat logs with AI assistants. This data is used to improve AI performance and service quality.</p>
          <h4>2.4 Usage Data</h4>
          <p>We automatically collect: IP address, browser type, device type, operating system, pages visited & time spent, and click interactions & engagement with startup pitches.</p>
          <h3>3. How We Use Your Information</h3>
          <ul>
            <li><strong>Platform Operations:</strong> Create/manage accounts, display pitches, enable networking, provide messaging.</li>
            <li><strong>AI Services:</strong> Operate Investor AI & 021 AI, improve AI responses, and train AI systems.</li>
            <li><strong>Platform Improvement:</strong> Enhance features, understand user behavior, optimize experience.</li>
            <li><strong>Security:</strong> Prevent fraud, detect suspicious activity, protect users.</li>
            <li><strong>Communication:</strong> Send updates, notify about changes, provide support.</li>
          </ul>
          <h3>4. AI System Usage</h3>
          <p>Evoa provides AI-powered tools that assist with startup idea validation, market analysis, business models, pitch feedback, and investor insights. AI responses are informational only and do <strong>not</strong> constitute financial, legal, or investment advice. Users should independently verify any AI-generated insights.</p>
          <h3>5. Data Sharing & Security</h3>
          <p>We do not sell user data. We may share data with service providers (cloud, payment, analytics, AI infrastructure) and if required by Indian law. We implement encryption and secure authentication. Users must protect their credentials.</p>
          <h3>6. Retention, Your Rights & Minors</h3>
          <p>We retain data as long as necessary. Users may access data, update profiles, or request account deletion via <strong>support@evoa.co.in</strong>. Evoa services are not intended for users under 14 years of age.</p>
          <h3>7. Contact</h3>
          <p><strong>Evoa Technology Private Limited</strong><br />Email: <a href="mailto:support@evoa.co.in">support@evoa.co.in</a> · Website: <a href="https://evoa.co.in" target="_blank" rel="noopener noreferrer">evoa.co.in</a></p>
        </PolicyModal>
      )}

      {/* ── TERMS OF SERVICE ── */}
      {modal === "terms" && (
        <PolicyModal title="Terms of Service" onClose={close}>
          <p>These Terms of Service govern your use of the Evoa platform, Investor AI, 021 AI, and our website <strong>evoa.co.in</strong>.</p>
          <p><em>By accessing Evoa services, you agree to these terms.</em></p>
          <h3>1. Eligibility</h3>
          <p>To use Evoa, you must be at least 14 years old, provide accurate information, and comply with all applicable laws.</p>
          <h3>2. User Accounts</h3>
          <p>Users must maintain accurate profile information, keep login credentials secure, and be responsible for activities on their account. Evoa reserves the right to suspend accounts for violations.</p>
          <h3>3. Platform Purpose</h3>
          <p>Evoa is designed to enable startup pitching, help investors discover startups, and assist founders through AI tools. <strong>Evoa does not guarantee funding, investment, or business success.</strong></p>
          <h3>4. AI Services Disclaimer</h3>
          <p>Investor AI and 021 AI provide automated insights. They do <strong>not</strong> provide investment advice, legal advice, or financial guarantees. Users should perform independent research before making decisions.</p>
          <h3>5. Startup Pitches</h3>
          <p>Founders are responsible for ensuring that their pitches are truthful, they have rights to the information they share, and they do not upload misleading or fraudulent information. <em>Evoa does not verify every startup claim.</em></p>
          <h3>6. Intellectual Property</h3>
          <p>Users retain ownership of their startup ideas, pitch videos, and uploaded content. However, by uploading content, users grant Evoa a license to display, distribute, and promote the content within the platform.</p>
          <h3>7. Prohibited Activities</h3>
          <ul>
            <li>Upload illegal content or impersonate others</li>
            <li>Spread misinformation or attempt platform hacking</li>
            <li>Use bots to manipulate engagement</li>
          </ul>
          <div className="ln-modal-warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8341A" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <span>Violation may result in account suspension or permanent ban without prior notice.</span>
          </div>
          <h3>8. Limitation of Liability</h3>
          <p>Evoa is not liable for investment losses, business failures, decisions based on AI outputs, or interactions between users. <strong>Users participate on the platform at their own risk.</strong></p>
          <h3>9. Governing Law & Contact</h3>
          <p>These Terms are governed by the laws of India. Contact: <a href="mailto:support@evoa.co.in">support@evoa.co.in</a></p>
        </PolicyModal>
      )}

      {/* ── AI DISCLAIMER ── */}
      {modal === "ai" && (
        <PolicyModal title="AI Disclaimer" onClose={close}>
          <p>Evoa provides AI-powered tools including <strong>Investor AI</strong> and <strong>021 AI</strong> to assist users with startup insights, idea validation, and informational analysis.</p>
          <div className="ln-modal-warn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8341A" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <div><strong style={{ color: "#F4F0E8" }}>Important AI Limitations</strong><br />These AI systems generate responses automatically and may contain inaccuracies.</div>
          </div>
          <h3>The information provided by AI tools:</h3>
          <ul>
            <li>Does <strong>not</strong> constitute financial advice</li>
            <li>Does <strong>not</strong> constitute legal advice</li>
            <li>Does <strong>not</strong> constitute investment advice</li>
            <li>Should <strong>not</strong> be solely relied upon for business decisions</li>
          </ul>
          <p><strong>Users are responsible for independently verifying any information before making decisions.</strong></p>
          <p><em>Evoa Technology Private Limited is not responsible for any actions taken based on AI-generated content.</em></p>
        </PolicyModal>
      )}

      {/* ── COMMUNITY GUIDELINES ── */}
      {modal === "community" && (
        <PolicyModal title="Community Guidelines" onClose={close}>
          <p>We are building a trusted ecosystem for founders and investors. Respect, honesty, and professionalism are our core values.</p>
          <h3>Prohibited Content & Actions</h3>
          <p>Users must <strong>not</strong> upload or share:</p>
          <ul>
            <li>Fraudulent startup claims or fake traction</li>
            <li>Misleading financial information or manipulated metrics</li>
            <li>Illegal content of any kind</li>
            <li>Hate speech, harassment, or abusive language</li>
            <li>Copyrighted material without explicit permission</li>
            <li>Confidential or proprietary business information they do not have the rights to share</li>
          </ul>
          <div className="ln-modal-warn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8341A" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <div><strong style={{ color: "#F4F0E8" }}>Evoa reserves the right to remove any content that violates these guidelines.</strong><br /><span style={{ fontSize: 13 }}>Accounts involved in fraudulent activities may be suspended or permanently banned without prior notice.</span></div>
          </div>
        </PolicyModal>
      )}
    </>
  );
}

/* ─── AMBASSADOR BANNER ─── */
const BANNER_CSS = `
.amb-banner {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  height: 38px;
  z-index: 999;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(270deg,#1a1004,#2a1a00,#C9A84C22,#1a1004,#2a1a00,#C9A84C22,#1a1004);
  background-size: 400% 400%;
  animation: ambassadorGlow 8s ease infinite;
  border-bottom: 1px solid rgba(201,168,76,0.25);
  border-top: 1px solid rgba(201,168,76,0.12);
  box-shadow: 0 2px 16px rgba(201,168,76,0.08), inset 0 -1px 0 rgba(201,168,76,0.07);
}
.amb-track {
  display: flex;
  white-space: nowrap;
  animation: ambassadorMarquee 22s linear infinite;
  will-change: transform;
}
.amb-track:hover { animation-play-state: paused; }
.amb-item {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 0 48px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(201,168,76,0.9);
}
.amb-dot {
  width: 4px; height: 4px;
  border-radius: 50%;
  background: #C9A84C;
  flex-shrink: 0;
  display: inline-block;
  box-shadow: 0 0 6px rgba(201,168,76,0.8);
}
.amb-text { color: rgba(244,240,232,0.85); letter-spacing: .14em; }
.amb-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  border: 1px solid rgba(201,168,76,0.5);
  color: #C9A84C;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .18em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 2px;
  transition: background .25s, color .25s, border-color .25s;
  cursor: pointer;
  flex-shrink: 0;
  background: rgba(201,168,76,0.06);
}
.amb-cta:hover {
  background: #C9A84C;
  color: #060607;
  border-color: #C9A84C;
}
.amb-spacer { height: 38px; width: 100%; flex-shrink: 0; }
@media(max-width:768px) {
  .amb-banner { top: 60px; height: 34px; }
  .amb-item { font-size: 9px; padding: 0 32px; gap: 10px; }
  .amb-spacer { height: 34px; }
}
`;

const AMB_TEXT = "Join Ambassador Program and Earn Money with Us";
const AMB_ITEMS = Array(8).fill(null);

function AmbassadorBanner() {
  return (
    <>
      <style>{BANNER_CSS}</style>
      <div className="amb-banner" role="marquee" aria-label="Ambassador program promotion">
        <div className="amb-track">
          {AMB_ITEMS.map((_, i) => (
            <span key={i} className="amb-item">
              <span className="amb-dot" />
              <span className="amb-text">{AMB_TEXT}</span>
              <Link to="/ambassador-program" className="amb-cta" aria-label="Join Ambassador Program">
                Click Here
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M1 7L7 1M7 1H2M7 1V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── ROOT ─── */
export default function Landing() {
  useReveal();
  return (
    <div className="evoa-root">
      <style>{STYLES}</style>
      <Cursor />
      <LandingNav />
      <AmbassadorBanner />
      {/* Extra spacer for the ambassador banner below the nav spacer already in LandingNav */}
      <div className="amb-spacer" />
      <Hero />
      <Ticker />
      <PitchShowcase />
      <Problem />
      <Pillars />
      <AISection />
      <HowItWorks />
      <Segments />
      <Features />
      <Mission />
      <Launch />
      <Footer />
    </div>
  );
}
