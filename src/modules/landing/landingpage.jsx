import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LandingNav from "../../components/layout/LandingNav";
import Footer from "../../components/layout/footer";

/* ─────────────────────────────────────────────────────
   EVOA LANDING PAGE — Professional White & Blue Design
   Light Mode (default): White background + Blue accents
   Dark Mode (Option C): Navy background + Blue accents
───────────────────────────────────────────────────── */

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@300;400&display=swap');

/* ─── Design Tokens ─── */
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

/* ─── Animations ─── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes floatY2  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
@keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:.7} }
@keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes rotate   { to{transform:rotate(360deg)} }
@keyframes ambScroll { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
@keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* ─── Reveal classes ─── */
.reveal { opacity:0;transform:translateY(18px);transition:opacity .7s ease,transform .7s ease; }
.reveal.vis { opacity:1;transform:translateY(0); }
.rL { opacity:0;transform:translateX(-28px);transition:opacity .7s,transform .7s; }
.rL.vis { opacity:1;transform:translateX(0); }
.rR { opacity:0;transform:translateX(28px);transition:opacity .7s,transform .7s; }
.rR.vis { opacity:1;transform:translateX(0); }

/* ─── Utility ─── */
.fu1{opacity:0;animation:fadeUp .8s ease forwards .15s}
.fu2{opacity:0;animation:fadeUp .8s ease forwards .30s}
.fu3{opacity:0;animation:fadeUp .8s ease forwards .45s}
.fu4{opacity:0;animation:fadeUp .8s ease forwards .60s}
.fu5{opacity:0;animation:fadeIn  1s ease forwards .40s}
.fi1{opacity:0;animation:fadeIn  .8s ease forwards .2s}

/* ─── Section layout ─── */
.sec-inner { max-width:1200px;margin:0 auto;padding:0 48px; }
@media(max-width:768px){ .sec-inner{padding:0 20px;} }

/* ─── Shared eyebrow label ─── */
.eyebrow {
  display:inline-flex;align-items:center;gap:8px;
  font-family:'DM Mono',monospace;font-size:11px;font-weight:400;
  letter-spacing:.18em;text-transform:uppercase;color:var(--blue);
  margin-bottom:16px;
}
.eyebrow::before{content:'';width:18px;height:2px;background:var(--blue);flex-shrink:0;}

/* ─── Buttons ─── */
.btn-primary {
  display:inline-flex;align-items:center;gap:8px;
  padding:13px 26px;background:var(--blue);color:#FFF;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:600;
  border-radius:8px;text-decoration:none;border:none;cursor:pointer;
  transition:background .2s,transform .2s,box-shadow .2s;
  box-shadow:var(--shadow-blue);
}
.btn-primary:hover{background:var(--blue-mid);transform:translateY(-2px);box-shadow:0 10px 30px rgba(21,101,192,.32);}
[data-theme="dark"] .btn-primary{box-shadow:0 8px 28px rgba(59,130,246,.30);}
[data-theme="dark"] .btn-primary:hover{box-shadow:0 10px 36px rgba(59,130,246,.40);}
.btn-outline {
  display:inline-flex;align-items:center;gap:8px;
  padding:12px 26px;background:transparent;color:var(--blue);
  font-family:'Inter',sans-serif;font-size:14px;font-weight:600;
  border-radius:8px;text-decoration:none;border:2px solid var(--blue-brd);cursor:pointer;
  transition:all .2s;
}
.btn-outline:hover{background:var(--blue-pale);border-color:var(--blue);}
.btn-white {
  display:inline-flex;align-items:center;gap:8px;
  padding:13px 28px;background:#FFF;color:#1565C0;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:700;
  border-radius:8px;text-decoration:none;border:none;cursor:pointer;
  transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,.18);
}
.btn-white:hover{background:#EEF5FF;transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,.24);}
.btn-white-outline {
  display:inline-flex;align-items:center;gap:8px;
  padding:12px 28px;background:transparent;color:#FFF;
  font-family:'Inter',sans-serif;font-size:14px;font-weight:600;
  border-radius:8px;text-decoration:none;border:2px solid rgba(255,255,255,.4);cursor:pointer;
  transition:all .2s;
}
.btn-white-outline:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.75);}

/* ══════════════════════════════════════════
   HERO
══════════════════════════════════════════ */
#hero {
  position:relative;min-height:100vh;
  display:flex;align-items:center;justify-content:center;
  padding:90px 48px 80px;overflow:hidden;background:var(--bg);
}
.hero-inner {
  display:grid;grid-template-columns:1.2fr 1fr;gap:60px;
  max-width:1200px;width:100%;align-items:center;z-index:2;
}
.hero-left {
  display:flex;flex-direction:column;align-items:flex-start;text-align:left;
}
.hero-right {
  display:flex;justify-content:center;align-items:center;position:relative;
}
.hero-blob {
  position:absolute;border-radius:50%;pointer-events:none;
  filter:blur(90px);opacity:.55;
}
.hero-blob-1 {
  width:700px;height:700px;top:-160px;left:-160px;
  background:radial-gradient(circle,rgba(21,101,192,.14),transparent 65%);
}
.hero-blob-2 {
  width:550px;height:550px;bottom:-100px;right:-100px;
  background:radial-gradient(circle,rgba(33,150,243,.10),transparent 65%);
}
[data-theme="dark"] .hero-blob-1{background:radial-gradient(circle,rgba(59,130,246,.20),transparent 65%);}
[data-theme="dark"] .hero-blob-2{background:radial-gradient(circle,rgba(96,165,250,.12),transparent 65%);}

.hero-badge {
  display:inline-flex;align-items:center;gap:10px;
  padding:7px 16px;background:var(--blue-pale);border:1px solid var(--blue-brd);
  border-radius:100px;margin-bottom:28px;
  font-family:'DM Mono',monospace;font-size:11px;font-weight:400;
  letter-spacing:.12em;text-transform:uppercase;color:var(--blue);
}
.hero-badge-dot { width:7px;height:7px;border-radius:50%;background:var(--blue);animation:pulseDot 2s ease-in-out infinite; }

.hero-h1 {
  font-size:clamp(34px,5vw,64px);font-weight:800;
  line-height:1.1;letter-spacing:-.028em;
  color:var(--text);max-width:680px;margin-bottom:40px;
}
.hero-h1 em { color:var(--blue);font-style:normal; }

.hero-subtitle {
  font-size:clamp(15px,1.7vw,18px);font-weight:400;line-height:1.7;
  color:var(--text-sub);max-width:540px;margin-bottom:40px;
}

.hero-ctas { display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:52px; }

.hero-stats { display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:72px; }
.hero-stat-val { font-size:28px;font-weight:800;color:var(--blue);line-height:1;margin-bottom:4px; }
.hero-stat-lbl { font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-mute); }
.hero-stat-div { width:1px;height:36px;background:var(--border);flex-shrink:0; }

/* Phone Mockup */
.hero-phone-wrap {
  position: relative;
  transform: translateY(-40px);
  transition: transform 0.6s cubic-bezier(0.2,0.8,0.2,1);
  z-index: 10;
  margin: 0 auto;
}
.hero-phone-wrap:hover { transform: translateY(-40px) scale(1.02); }
.hero-phone-glow {
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 140%; height: 120%;
  background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 60%);
  z-index: -1; pointer-events: none;
}
.hero-phone {
  width:320px;height:650px;border-radius:48px;
  background:#000;border:12px solid #1a1a1c;
  box-shadow: 0 30px 80px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.15), 0 0 0 2px #2a2a2d;
  position:relative;overflow:hidden;
}
[data-theme="dark"] .hero-phone { border-color:#0f0f11;box-shadow:0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 0 2px #1f1f22; }

/* Floating Boxes */
.hero-float-box {
  position: absolute;
  background: #FFF;
  border-radius: 18px;
  padding: 16px 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03);
  display: flex; gap: 14px; align-items: center;
  z-index: 50; width: max-content; max-width: 280px;
  transition: transform 0.4s cubic-bezier(0.2,0.8,0.2,1);
}
.hero-phone-wrap:hover .hero-float-box { transform: translateY(-6px); }
[data-theme="dark"] .hero-float-box {
  background: var(--bg-card);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--border);
}
.fb-icon { width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0; }
.fb-icon-red { background: rgba(239,68,68,0.1); color: #ef4444; }
.fb-icon-yellow { background: rgba(245,158,11,0.1); color: #f59e0b; }
.fb-icon-green { background: rgba(16,185,129,0.1); color: #10b981; }

.fb-content { display: flex; flex-direction: column; gap: 4px; text-align: left; }
.fb-title { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.1; }
.fb-sub { font-size: 13px; color: var(--text-sub); line-height: 1.2; }
.fb-link { font-size: 13px; font-weight: 600; color: var(--blue); margin-top: 2px; }
.fb-trend { font-size: 13px; font-weight: 600; color: #10b981; margin-top: 2px; }

.box-1 { top: 60px; right: -90px; }
.box-2 { top: 300px; left: -110px; }
.box-3 { bottom: 80px; right: -70px; }
.hero-phone-notch {
  position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:100px;height:26px;background:#000;
  border-bottom-left-radius:18px;border-bottom-right-radius:18px;
  z-index:40;
}
.hero-phone-screen {
  width:100%;height:100%;background:#000;position:relative;overflow:hidden;border-radius:34px;
}
.hero-reel-track {
  display:flex;flex-direction:column;height:100%;
  overflow-y:auto;scroll-snap-type:y mandatory;scrollbar-width:none;
}
.hero-reel-track::-webkit-scrollbar { display:none; }
.hero-reel-slide {
  width:100%;height:100%;flex:0 0 100%;position:relative;background:#111;
  scroll-snap-align:start;
}
.hero-reel-img { width:100%;height:100%;object-fit:cover; }
.hero-reel-overlay {
  position:absolute;inset:0;background:linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 35%, transparent 60%);
  pointer-events:none;
}
.hero-reel-tag {
  position:absolute;top:40px;left:14px;z-index:20;
  padding:4px 10px;border-radius:100px;font-size:10px;font-weight:600;
  background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);color:#FFF;border:1px solid rgba(255,255,255,0.2);
}
.hero-reel-bottom {
  position:absolute;bottom:20px;left:14px;right:64px;color:#fff;z-index:20;
}
.hero-reel-title { font-family:'Inter',sans-serif;font-size:15px;font-weight:700;margin-bottom:4px;display:flex;align-items:center;gap:6px; }
.hero-reel-desc { font-family:'Inter',sans-serif;font-size:11px;opacity:0.85;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden; }
.hero-reel-actions {
  position:absolute;bottom:20px;right:12px;display:flex;flex-direction:column;gap:14px;align-items:center;z-index:20;
}
.hero-reel-btn {
  display:flex;flex-direction:column;align-items:center;gap:3px;color:#fff;cursor:pointer;
}
.hero-reel-btn-icon {
  width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);
  display:flex;align-items:center;justify-content:center;transition:background 0.2s;
}
.hero-reel-btn-icon svg { width:16px;height:16px; }
.hero-reel-btn-lbl { font-size:9px;font-weight:600;opacity:0.9; }

@media(max-width:1024px){
  .hero-inner { grid-template-columns:1fr;text-align:center;gap:40px; }
  .hero-left { align-items:center;text-align:center; }
  .hero-h1, .hero-subtitle { text-align:center; }
  .hero-ctas, .hero-stats { justify-content:center; }
  .hero-phone-wrap { transform: none; margin-top: 40px; }
  .hero-phone-wrap:hover { transform: scale(1.02); }
  .hero-phone { width:280px;height:580px; }
  .box-1 { right: -20px; top: 40px; }
  .box-2 { left: -20px; top: 250px; }
  .box-3 { right: -10px; bottom: 60px; }
}
@media(max-width:768px){
  #hero { padding:100px 20px 60px; }
  .hero-stat-div { display:none; }
  .hero-stats { gap:24px; }
  .hero-float-box { display: none; /* Hide floating boxes on very small screens to avoid clutter */ }
}
@media(max-width:480px){ .hero-h1{font-size:32px;} .hero-phone { width:260px;height:540px; } }

/* ══════════════════════════════════════════
   PITCH SHOWCASE
══════════════════════════════════════════ */
#pitch-showcase {
  padding:80px 0 90px;
  background:var(--bg-alt);
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
}
.ps-hdr { padding:0 0 40px; }
.ps-scroll {
  display:flex;gap:14px;overflow-x:auto;
  padding:0 48px 16px;scrollbar-width:none;
  cursor:grab;-webkit-overflow-scrolling:touch;
  scroll-snap-type:x mandatory;
}
.ps-scroll:active { cursor:grabbing; }
.ps-scroll::-webkit-scrollbar { display:none; }
.ps-card { flex:0 0 auto;width:175px;scroll-snap-align:start;transition:transform .3s; }
.ps-card:hover { transform:scale(1.04) translateY(-4px); }
.ps-name {
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--text-mute);margin-bottom:8px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.ps-img {
  width:100%;aspect-ratio:9/16;object-fit:cover;border-radius:14px;
  border:1px solid var(--border);background:var(--bg-deep);display:block;
  transition:box-shadow .3s,border-color .3s;
}
.ps-card:hover .ps-img { box-shadow:0 10px 36px rgba(21,101,192,.14);border-color:var(--blue-brd); }
@media(max-width:768px){ .ps-scroll{padding:0 20px 14px;}.ps-card{width:140px;} }

/* ══════════════════════════════════════════
   PLATFORM FEATURES
══════════════════════════════════════════ */
#features { padding:100px 0;background:var(--bg); }
.feat-grid {
  display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px;
}
.feat-card {
  background:var(--bg-card);border:1px solid var(--border);border-radius:16px;
  padding:30px 26px;box-shadow:var(--shadow-sm);
  transition:all .3s;position:relative;overflow:hidden;cursor:default;
}
.feat-card::before {
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--blue),var(--blue-mid));
  transform:scaleX(0);transition:transform .35s;transform-origin:left;
}
.feat-card:hover::before { transform:scaleX(1); }
.feat-card:hover { box-shadow:var(--shadow-md);transform:translateY(-4px);border-color:var(--blue-brd); }
.feat-icon {
  width:46px;height:46px;border-radius:12px;background:var(--blue-pale);
  display:flex;align-items:center;justify-content:center;
  margin-bottom:18px;color:var(--blue);flex-shrink:0;
}
.feat-title { font-size:16px;font-weight:700;color:var(--text);margin-bottom:9px;line-height:1.3; }
.feat-desc { font-size:14px;line-height:1.7;color:var(--text-sub); }
@media(max-width:1024px){ .feat-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px){ .feat-grid{grid-template-columns:1fr;} }

/* ══════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════ */
#how {
  padding:100px 0;background:var(--bg-alt);
  border-top:1px solid var(--border);
}
.how-grid {
  display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:56px;
  position:relative;
}
.how-connector {
  position:absolute;top:42px;left:calc(12.5% + 18px);right:calc(12.5% + 18px);
  height:2px;pointer-events:none;
  background:linear-gradient(90deg,var(--blue),var(--blue-mid),var(--blue));
  opacity:.18;
}
.how-step {
  background:var(--bg-card);border:1px solid var(--border);border-radius:16px;
  padding:30px 22px;text-align:center;box-shadow:var(--shadow-sm);
  transition:all .3s;position:relative;z-index:1;
}
.how-step:hover { border-color:var(--blue-brd);box-shadow:var(--shadow-md);transform:translateY(-5px); }
.how-num {
  width:54px;height:54px;border-radius:50%;background:var(--blue);
  color:#FFF;font-size:20px;font-weight:800;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 18px;box-shadow:0 4px 16px rgba(21,101,192,.35);
}
[data-theme="dark"] .how-num { box-shadow:0 4px 16px rgba(59,130,246,.35); }
.how-step-title { font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px;line-height:1.3; }
.how-step-desc { font-size:13px;line-height:1.7;color:var(--text-sub); }
@media(max-width:900px){ .how-grid{grid-template-columns:repeat(2,1fr);}.how-connector{display:none;} }
@media(max-width:480px){ .how-grid{grid-template-columns:1fr;} }

/* ══════════════════════════════════════════
   SEGMENTS (on blue bg — inverted)
══════════════════════════════════════════ */
#segments {
  padding:100px 0;background:var(--blue);
  position:relative;overflow:hidden;
}
[data-theme="dark"] #segments { background:var(--bg-deep); }
#segments::before {
  content:'';position:absolute;inset:0;opacity:.04;
  background-image:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E");
  pointer-events:none;
}
.seg-eyebrow { color:rgba(255,255,255,.65); }
.seg-eyebrow::before { background:rgba(255,255,255,.65); }
[data-theme="dark"] .seg-eyebrow { color:var(--blue); }
[data-theme="dark"] .seg-eyebrow::before { background:var(--blue); }
.seg-h2 { font-size:clamp(30px,4vw,52px);font-weight:800;color:#FFF;line-height:1.06;max-width:520px;margin-bottom:56px;letter-spacing:-.02em; }
[data-theme="dark"] .seg-h2 { color:var(--text); }
.seg-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:18px; }
.seg-card {
  background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);
  border-radius:18px;padding:32px 24px;transition:all .3s;
  backdrop-filter:blur(12px);cursor:default;
}
.seg-card:hover { background:rgba(255,255,255,.17);transform:translateY(-5px);box-shadow:0 16px 44px rgba(0,0,0,.16); }
[data-theme="dark"] .seg-card { background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.20); }
[data-theme="dark"] .seg-card:hover { background:rgba(59,130,246,.14);border-color:rgba(59,130,246,.35); }
.seg-icon {
  width:50px;height:50px;border-radius:13px;
  background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;
  margin-bottom:18px;font-size:22px;
}
[data-theme="dark"] .seg-icon { background:rgba(59,130,246,.15); }
.seg-role { font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:7px; }
[data-theme="dark"] .seg-role { color:var(--text-mute); }
.seg-headline { font-size:24px;font-weight:800;color:#FFF;line-height:1.15;margin-bottom:10px; }
[data-theme="dark"] .seg-headline { color:var(--text); }
.seg-desc { font-size:13px;line-height:1.7;color:rgba(255,255,255,.72);margin-bottom:18px; }
[data-theme="dark"] .seg-desc { color:var(--text-sub); }
.seg-features { list-style:none;display:flex;flex-direction:column;gap:4px; }
.seg-feature {
  display:flex;align-items:center;gap:8px;
  font-size:12px;color:rgba(255,255,255,.70);
  padding:4px 0;border-bottom:1px solid rgba(255,255,255,.07);
}
.seg-feature:last-child { border-bottom:none; }
[data-theme="dark"] .seg-feature { color:var(--text-sub);border-bottom-color:rgba(255,255,255,.05); }
.seg-feature-dot { width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.55);flex-shrink:0; }
[data-theme="dark"] .seg-feature-dot { background:var(--blue); }
@media(max-width:1024px){ .seg-grid{grid-template-columns:repeat(2,1fr);} }
@media(max-width:540px){ .seg-grid{grid-template-columns:1fr;} }

/* ══════════════════════════════════════════
   MISSION
══════════════════════════════════════════ */
#mission {
  padding:100px 0;background:var(--bg);
  border-top:1px solid var(--border);
  text-align:center;
}
.mission-quote {
  font-size:clamp(18px,2.6vw,32px);font-weight:400;
  font-style:italic;line-height:1.55;
  color:var(--text);max-width:820px;margin:0 auto 44px;
  position:relative;
}
.mission-blue { color:var(--blue);font-style:normal;font-weight:700; }
.mission-authors { display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap; }
.mission-author-name { font-size:14px;font-weight:700;color:var(--text); }
.mission-author-role { font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-mute);margin-top:3px; }
.mission-divider { width:1px;height:36px;background:var(--border); }

/* ══════════════════════════════════════════
   CTA BAND
══════════════════════════════════════════ */
#cta-band {
  padding:100px 0;
  background:linear-gradient(135deg,#0D47A1 0%,#1565C0 50%,#1976D2 100%);
  position:relative;overflow:hidden;
}
[data-theme="dark"] #cta-band {
  background:linear-gradient(135deg,#0D1B2A 0%,#162032 50%,#1E2D3D 100%);
  border-top:1px solid rgba(59,130,246,.2);
}
#cta-band::before {
  content:'';position:absolute;inset:0;opacity:.05;pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
}
.cta-inner { position:relative;z-index:2;text-align:center; }
.cta-eyebrow {
  display:flex;align-items:center;justify-content:center;gap:12px;
  font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;color:rgba(255,255,255,.65);margin-bottom:20px;
}
.cta-eyebrow::before,.cta-eyebrow::after { content:'';width:36px;height:1px;background:rgba(255,255,255,.35); }
[data-theme="dark"] .cta-eyebrow { color:var(--blue-mid); }
[data-theme="dark"] .cta-eyebrow::before,[data-theme="dark"] .cta-eyebrow::after { background:rgba(59,130,246,.35); }
.cta-h2 {
  font-size:clamp(30px,4.5vw,58px);font-weight:800;
  color:#FFF;line-height:1.06;margin-bottom:18px;letter-spacing:-.02em;
}
[data-theme="dark"] .cta-h2 { color:var(--text); }
.cta-sub { font-size:clamp(15px,1.7vw,18px);color:rgba(255,255,255,.72);line-height:1.65;max-width:480px;margin:0 auto 40px; }
[data-theme="dark"] .cta-sub { color:var(--text-sub); }
.cta-btns { display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap; }


.ln-modal-body a{color:var(--blue)}
.ln-modal-body strong{color:var(--text)}
.ln-modal-warn{background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.20);border-radius:10px;padding:14px 18px;margin:12px 0;display:flex;gap:12px;align-items:flex-start}

/* ══════════════════════════════════════════
   AMBASSADOR BOTTOM BANNER
══════════════════════════════════════════ */
.amb-bottom-container {
  position:absolute;bottom:0;left:0;right:0;height:46px;z-index:20;
  background:rgba(21,101,192,.03);
  overflow:hidden;transition:all .35s;
  display:flex;align-items:center;
  border-top:1px solid rgba(21,101,192,.08);
}
.amb-bottom-container:hover { background:rgba(21,101,192,.08); border-top-color:rgba(21,101,192,.22); }
[data-theme="dark"] .amb-bottom-container { background:rgba(59,130,246,.04); border-top-color:rgba(59,130,246,.12); }
[data-theme="dark"] .amb-bottom-container:hover { background:rgba(59,130,246,.10); border-top-color:rgba(59,130,246,.30); }
.amb-bottom-track {
  display:flex;white-space:nowrap;
  animation:ticker 45s linear infinite;will-change:transform;
  width:max-content;
}
.amb-bottom-container:hover .amb-bottom-track { animation-play-state:paused; }
.amb-item { display:inline-flex;align-items:center;gap:14px;padding:0 28px;text-decoration:none; }
.amb-dot { width:6px;height:6px;border-radius:50%;background:var(--blue);flex-shrink:0;box-shadow:0 0 6px rgba(21,101,192,.4); }
[data-theme="dark"] .amb-dot { box-shadow:0 0 6px rgba(59,130,246,.4); }
.amb-text {
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--text-mute);white-space:nowrap;
}
.amb-cta {
  padding:4px 8px;border:1px solid var(--blue-brd);color:var(--blue);
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;
  text-transform:uppercase;border-radius:4px;background:var(--blue-pale);
  transition:all .3s;display:inline-flex;align-items:center;gap:5px;
}
.amb-item:hover .amb-cta { background:var(--blue);color:#FFF;border-color:var(--blue); }
@media(max-width:768px){ .amb-bottom-container{display:none;} }
`;

/* ─── Hooks ─── */
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("vis"); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll(".reveal,.rL,.rR").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─── Ambassador Banner ─── */
const AMB_TEXT = "Join Ambassador Program and Earn Money with Us";
const AMB_ITEMS = Array(18).fill(null);

function AmbassadorBanner() {
  return (
    <div className="amb-bottom-container">
      <div className="amb-bottom-track">
        {AMB_ITEMS.map((_, i) => (
          <Link key={i} to="/ambassador-program" className="amb-item" aria-label="Join Ambassador Program">
            <span className="amb-dot" />
            <span className="amb-text">{AMB_TEXT}</span>
            <span className="amb-cta">
              Join
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                <path d="M1 7L7 1M7 1H2M7 1V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── HERO ─── */
function Hero() {
  const trackRef = useRef(null);

  useEffect(() => {
    let timer;
    const startScroll = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!trackRef.current) return;
        const el = trackRef.current;
        const itemH = el.clientHeight;
        const maxScroll = el.scrollHeight - itemH;

        // Calculate the next snap point exactly to avoid smooth scroll desync
        let currentIdx = Math.round(el.scrollTop / itemH);
        let nextTop = (currentIdx + 1) * itemH;

        if (nextTop > maxScroll - 10) {
          nextTop = 0;
        }
        el.scrollTo({ top: nextTop, behavior: 'smooth' });
      }, 4000);
    };

    startScroll();

    // Pause auto-scroll on manual interaction
    const handlePause = () => clearInterval(timer);
    const handleResume = () => startScroll();

    const el = trackRef.current;
    let scrollTimeout;
    const handleScroll = () => {
      handlePause();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleResume, 2000);
    };

    if (el) {
      el.addEventListener('touchstart', handlePause, { passive: true });
      el.addEventListener('touchend', handleResume, { passive: true });
      el.addEventListener('mousedown', handlePause);
      el.addEventListener('mouseup', handleResume);
      el.addEventListener('mouseleave', handleResume);
      // Also pause if the user is scrolling manually via trackpad/wheel
      el.addEventListener('wheel', handlePause, { passive: true });
      el.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      clearInterval(timer);
      clearTimeout(scrollTimeout);
      if (el) {
        el.removeEventListener('touchstart', handlePause);
        el.removeEventListener('touchend', handleResume);
        el.removeEventListener('mousedown', handlePause);
        el.removeEventListener('mouseup', handleResume);
        el.removeEventListener('mouseleave', handleResume);
        el.removeEventListener('wheel', handlePause);
        el.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <section id="hero">
      <div className="hero-blob hero-blob-1" />
      <div className="hero-blob hero-blob-2" />
      <AmbassadorBanner />

      <div className="hero-inner">
        <div className="hero-left">
          {/* Headline */}
          <h1 className="hero-h1 fu2">
            India's First <br /> <em>Video-Based</em><br />
            Startup &amp; Investor<br />
            Discovery Platform
          </h1>

          {/* Subtitle removed */}

          {/* CTAs */}
          <div className="hero-ctas fu3">
            <Link to="/register" className="btn-primary">
              Start Pitching — Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/login" className="btn-outline">
              Explore Investors →
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats fu4">
            <div className="hero-stat">
              <div className="hero-stat-val">100+</div>
              <div className="hero-stat-lbl">Startups Pitching</div>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <div className="hero-stat-val">50+</div>
              <div className="hero-stat-lbl">Active Investors</div>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <div className="hero-stat-val">₹0</div>
              <div className="hero-stat-lbl">Cost to Join</div>
            </div>
            <div className="hero-stat-div" />
            <div className="hero-stat">
              <div className="hero-stat-val">90s</div>
              <div className="hero-stat-lbl">Video Pitches</div>
            </div>
          </div>
        </div>

        <div className="hero-right fu5">
          {/* iPhone Mockup */}
          <div className="hero-phone-wrap">
            <div className="hero-phone-glow" />

            {/* Floating Boxes */}
            <div className="hero-float-box box-1">
              <div className="fb-icon fb-icon-red">🎯</div>
              <div className="fb-content">
                <div className="fb-title">Investor Matched!</div>
                <div className="fb-sub">Sequoia India · Seed Stage</div>
                <div className="fb-link">→ View Profile</div>
              </div>
            </div>

            <div className="hero-float-box box-2">
              <div className="fb-icon fb-icon-yellow">📊</div>
              <div className="fb-content">
                <div className="fb-title">Pitch Analytics</div>
                <div className="fb-sub">2,400 views · last 48 hours</div>
                <div className="fb-trend">↑ 38% this week</div>
              </div>
            </div>

            <div className="hero-float-box box-3">
              <div className="fb-icon fb-icon-green">⚡</div>
              <div className="fb-content">
                <div className="fb-title">Investor AI</div>
                <div className="fb-sub">Startup Review & Analysis</div>
                <div className="fb-link">→ View Pitchdeck/Sch Meet</div>
              </div>
            </div>

            <div className="hero-phone">
              <div className="hero-phone-notch" />
              <div className="hero-phone-screen">
                <div className="hero-reel-track" ref={trackRef}>
                  {PITCH_IMAGES.map((p, i) => (
                    <div className="hero-reel-slide" key={i}>
                      <img src={p.url} className="hero-reel-img" alt={`${p.name} pitch`} />
                      <div className="hero-reel-overlay" />

                      <div className="hero-reel-tag">Seed Stage</div>

                      <div className="hero-reel-bottom">
                        <div className="hero-reel-title">
                          {p.name}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        </div>
                        <div className="hero-reel-desc">Raising ₹2Cr for 10% equity. We are revolutionizing the industry with an AI-first approach...</div>
                      </div>

                      <div className="hero-reel-actions">
                        <div className="hero-reel-btn">
                          <div className="hero-reel-btn-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                          </div>
                          <span className="hero-reel-btn-lbl">2.4k</span>
                        </div>
                        <div className="hero-reel-btn">
                          <div className="hero-reel-btn-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                          </div>
                          <span className="hero-reel-btn-lbl">42</span>
                        </div>
                        <div className="hero-reel-btn">
                          <div className="hero-reel-btn-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false, sx = 0, sl = 0;
    const dn = e => { isDown = true; sx = e.pageX - el.offsetLeft; sl = el.scrollLeft; };
    const up = () => { isDown = false; };
    const mv = e => { if (!isDown) return; e.preventDefault(); el.scrollLeft = sl - (e.pageX - el.offsetLeft - sx); };
    el.addEventListener('mousedown', dn);
    el.addEventListener('mouseleave', up);
    el.addEventListener('mouseup', up);
    el.addEventListener('mousemove', mv);
    return () => { el.removeEventListener('mousedown', dn); el.removeEventListener('mouseleave', up); el.removeEventListener('mouseup', up); el.removeEventListener('mousemove', mv); };
  }, []);

  return (
    <section id="pitch-showcase">
      <div className="sec-inner">
        <div className="ps-hdr reveal">
          <div className="eyebrow">Live on EVOA</div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 10 }}>
            Startups Pitching Right Now
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-sub)', lineHeight: 1.65 }}>
            Real founders. Real pitches. Discover the next big idea before anyone else.
          </p>
        </div>
      </div>
      <div className="ps-scroll" ref={scrollRef}>
        {[...PITCH_IMAGES, ...PITCH_IMAGES].map((p, i) => (
          <div key={i} className="ps-card">
            <div className="ps-name">{p.name}</div>
            <img className="ps-img" src={p.url} alt={`${p.name} pitch`} loading={i < 4 ? 'eager' : 'lazy'} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── PLATFORM FEATURES ─── */
const FEATURES_DATA = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 8s-4-4-10-4S2 8 2 8" /><path d="M22 8v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8" /><path d="M8 21h8" /><path d="M12 17v4" />
        <polygon points="8,8 16,8 12,14" />
      </svg>
    ),
    title: 'Video Pitch Platform',
    desc: 'Record and share your 90-second startup pitch. Get discovered by 50+ active investors without any cold outreach.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    title: 'Investor AI Matching',
    desc: 'AI-powered matching connects startups with the right investors instantly. No cold outreach — just precise signal.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: '021 AI Co-Founder',
    desc: 'Your virtual C-suite — CEO, CMO, CTO, CFO — operating in parallel, 24/7. Turn your idea into a business plan instantly.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    title: 'Smart Discovery',
    desc: 'Find hundreds of quality startups, investors, and opportunities. Intelligent filters. Zero noise. Maximum signal.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Analytics & Insights',
    desc: 'Track pitch views, investor engagement, and traction in real-time. Know your numbers and own your growth.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Verified & Secure',
    desc: 'CIN, GST, SEBI, PAN — all verified. Enterprise-grade encryption and security at every layer of the platform.',
  },
];

function PlatformFeatures() {
  return (
    <section id="features">
      <div className="sec-inner">
        <div className="reveal">
          <div className="eyebrow">The Platform</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,50px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.07, letterSpacing: '-.022em', maxWidth: 620, marginBottom: 12 }}>
            Everything You Need to Raise Capital
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.7, maxWidth: 560 }}>
            Six powerful tools. One seamless ecosystem designed to take startups from idea to funded.
          </p>
        </div>
        <div className="feat-grid">
          {FEATURES_DATA.map((f, i) => (
            <div key={i} className="feat-card reveal" style={{ transitionDelay: `${i * .07}s` }}>
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
const HOW_STEPS = [
  { n: '01', title: 'Create Your Account', desc: 'Sign up with email or phone. Choose your role — Startup, Investor, Incubator, or Viewer.' },
  { n: '02', title: 'Complete Your Profile', desc: 'Startups add pitch, team & traction. Investors set ticket size, sector & preferences.' },
  { n: '03', title: 'Discover & Pitch', desc: 'Browse the pitch feed, watch 90-second reels, and discover opportunities that match your goals.' },
  { n: '04', title: 'Connect & Close', desc: 'Send messages, make offers, schedule calls — all within one platform until the deal is done.' },
];

function HowItWorks() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) document.querySelectorAll('.how-step').forEach((el, i) =>
        setTimeout(() => el.classList.add('reveal', 'vis'), i * 120)
      );
    }, { threshold: .06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section id="how" ref={ref}>
      <div className="sec-inner">
        <div className="reveal">
          <div className="eyebrow">Simple Process</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,50px)', fontWeight: 800, color: 'var(--text)', lineHeight: 1.07, letterSpacing: '-.022em', marginBottom: 10 }}>
            How It Works
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-sub)', lineHeight: 1.65 }}>
            Get started in four simple steps — no complicated setup, no gatekeepers.
          </p>
        </div>
        <div className="how-grid">
          <div className="how-connector" />
          {HOW_STEPS.map((s, i) => (
            <div key={i} className="how-step" style={{ transitionDelay: `${i * .1}s` }}>
              <div className="how-num">{s.n}</div>
              <div className="how-step-title">{s.title}</div>
              <p className="how-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ textAlign: 'center', marginTop: 52 }}>
          <Link to="/register" className="btn-primary" style={{ padding: '15px 36px', fontSize: 15 }}>
            Create Your Account — Free
          </Link>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-mute)', fontStyle: 'italic' }}>
            No gatekeepers. No warm intros. Just your idea.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── SEGMENTS ─── */
const SEGMENTS_DATA = [
  {
    icon: '🚀',
    role: 'Founders',
    headline: 'Build Empires.',
    desc: 'From first idea to Series A. EVOA gives you the stage, tools, AI co-founder, and global investor access.',
    features: ['Pitch to 50+ investors', '021 AI co-founder', 'Product validation', 'Hire talent & AI agents', 'Compete in Battleground'],
  },
  {
    icon: '💎',
    role: 'Investors',
    headline: 'Fund Futures.',
    desc: 'AI-curated deal flow from verified startups. Watch 90-second pitch reels and track traction live — no middleman.',
    features: ['AI-matched deal flow', '90s pitch reels', 'Traction dashboards', 'Direct founder access', 'Portfolio analytics'],
  },
  {
    icon: '🏛️',
    role: 'Incubators',
    headline: 'Nurture Unicorns.',
    desc: 'Build a verified portfolio page, connect your cohort to global investors, and showcase your programs at scale.',
    features: ['Verified portfolio page', 'Cohort investor access', 'Startup showcase tools', 'Program management', 'Impact analytics'],
  },
  {
    icon: '🔭',
    role: 'Visionaries',
    headline: 'Dream Big.',
    desc: 'You have the vision. Explore the pitch feed, discover co-founders, connect with incubators, and track emerging sectors.',
    features: ['Explore pitch feed daily', 'Connect with incubators', 'Discover co-founders', 'Track emerging sectors', 'Learn from live deals'],
  },
];

function Segments() {
  return (
    <section id="segments">
      <div className="sec-inner">
        <div className="reveal">
          <div className="eyebrow seg-eyebrow">Built For</div>
          <h2 className="seg-h2">Four worlds.<br />One platform.</h2>
        </div>
        <div className="seg-grid">
          {SEGMENTS_DATA.map((s, i) => (
            <div key={i} className="seg-card reveal" style={{ transitionDelay: `${i * .1}s` }}>
              <div className="seg-icon">{s.icon}</div>
              <div className="seg-role">{s.role}</div>
              <div className="seg-headline">{s.headline}</div>
              <p className="seg-desc">{s.desc}</p>
              <ul className="seg-features">
                {s.features.map((f, j) => (
                  <li key={j} className="seg-feature">
                    <span className="seg-feature-dot" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── MISSION ─── */
function Mission() {
  return (
    <section id="mission">
      <div className="sec-inner">
        <p className="mission-quote reveal">
          "We are building India's first{' '}
          <span className="mission-blue">video-based startup ecosystem</span>
          {' '}— where your idea and your execution are the only credentials that matter."
        </p>
        <div className="mission-authors reveal">
          <div className="mission-author">
            <div className="mission-author-name">Aditya Narayan Singh</div>
            <div className="mission-author-role">Co-Founder & CEO · EVOA</div>
          </div>
          <div className="mission-divider" />
          <div className="mission-author">
            <div className="mission-author-name">Abhishek Kumar</div>
            <div className="mission-author-role">Co-Founder & CTO · EVOA</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA BAND ─── */
function CTABand() {
  return (
    <section id="cta-band">
      <div className="sec-inner cta-inner">
        <div className="cta-eyebrow">Global Launch · 26.03.2026</div>
        <h2 className="cta-h2">Ready to Join India's<br />Startup Revolution?</h2>
        <p className="cta-sub">
          Be among the first 100 startups and get free early access to every feature — including Investor AI and 021 AI.
        </p>
        <div className="cta-btns">
          <Link to="/register" className="btn-white">
            Claim Your Spot — Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          <Link to="/login" className="btn-white-outline">Sign In →</Link>
        </div>
      </div>
    </section>
  );
}

/* ─── POLICY MODAL ─── */



/* ─── ROOT ─── */
export default function Landing() {
  useReveal();
  return (
    <div className="evoa-root">
      <style>{STYLES}</style>
      <LandingNav />
      <Hero />
      <PitchShowcase />
      <PlatformFeatures />
      <HowItWorks />
      <Segments />
      <Mission />
      <CTABand />
      <Footer />
    </div>
  );
}
