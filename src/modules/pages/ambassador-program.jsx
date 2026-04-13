import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LandingNav from '../../components/layout/LandingNav';
import Footer from '../../components/layout/footer';

/* ─── SCOPED CSS ─── */
const AMB_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

/* ── ANIMATIONS ── */
@keyframes amb-fadeUp    { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
@keyframes amb-fadeIn    { from { opacity:0 }  to { opacity:1 } }
@keyframes amb-floatUp   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes amb-pulseGlow { 0%,100%{box-shadow:0 0 20px rgba(0,191,165,.1)} 50%{box-shadow:0 0 40px rgba(0,191,165,.28)} }
@keyframes amb-modalIn   { from { opacity:0; transform:translateY(24px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
@keyframes amb-overlayIn { from { opacity:0 } to { opacity:1 } }

/* ── REVEAL SYSTEM ── */
.amb-reveal { opacity:0; transform:translateY(28px); transition:opacity .75s ease, transform .75s ease; }
.amb-reveal.vis       { opacity:1; transform:translateY(0); }
.amb-reveal.delay-1   { transition-delay:.1s; }
.amb-reveal.delay-2   { transition-delay:.2s; }
.amb-reveal.delay-3   { transition-delay:.3s; }
.amb-reveal.delay-4   { transition-delay:.4s; }
.amb-reveal.delay-5   { transition-delay:.5s; }

/* ── PILL TAG ── */
.amb-pill-tag {
  display:inline-flex; align-items:center; gap:8px;
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.22em; text-transform:uppercase;
  color:#00BFA5; border:1px solid rgba(0,191,165,.3); padding:6px 16px; border-radius:40px; margin-bottom:28px;
}
.amb-pill-tag::before { content:''; width:6px; height:6px; border-radius:50%; background:#00BFA5; display:inline-block; animation:amb-pulseGlow 2s ease-in-out infinite; }

/* ── STAG ── */
.amb-stag {
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.22em; text-transform:uppercase;
  color:#E8341A; display:inline-flex; align-items:center; gap:10px; margin-bottom:18px;
}
.amb-stag::before { content:''; width:22px; height:1px; background:#E8341A; flex-shrink:0; display:inline-block; }

/* ── HERO LINE ── */
.amb-hero-line { height:1px; background:linear-gradient(90deg,transparent,#E8341A 30%,#C9A84C 70%,transparent); width:0; transition:width 1.4s cubic-bezier(.4,0,.2,1) .5s; margin:0 auto; }
.amb-hero-line.vis { width:280px; }

/* ── CARD ── */
.amb-card { background:#0f0f10; border:1px solid rgba(255,255,255,0.07); border-radius:14px; transition:border-color .3s, transform .3s, box-shadow .3s; position:relative; overflow:hidden; }
.amb-card:hover { border-color:rgba(0,191,165,.25); transform:translateY(-5px); box-shadow:0 24px 64px rgba(0,0,0,.5), 0 0 40px rgba(0,191,165,.06); }

/* ── STEP NUMBER ── */
.amb-step-num {
  font-family:'Bebas Neue',sans-serif; font-size:clamp(56px,8vw,80px); letter-spacing:.04em; line-height:1;
  background:linear-gradient(135deg,#C9A84C,rgba(201,168,76,.2)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

/* ── SIGNUP LINK ── */
.amb-signup-link { color:#00BFA5; text-decoration:none; font-weight:600; border-bottom:1px solid rgba(0,191,165,.4); transition:color .2s, border-color .2s; padding-bottom:1px; }
.amb-signup-link:hover { color:#B0FFFA; border-color:rgba(176,255,250,.6); }

/* ── SEC TITLE ── */
.amb-sec-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,5vw,56px); letter-spacing:.04em; color:#C9A84C; text-align:center; margin-bottom:12px; }
.amb-sec-sub { font-family:'Cormorant Garamond',serif; font-size:clamp(15px,1.8vw,18px); font-weight:300; color:rgba(244,240,232,0.55); text-align:center; max-width:520px; margin:0 auto 60px; line-height:1.7; }

/* ── GHOST BG TEXT ── */
.amb-ghost-num { position:absolute; font-family:'Bebas Neue',sans-serif; font-size:clamp(120px,22vw,320px); color:rgba(244,240,232,.018); right:-20px; top:-40px; line-height:1; pointer-events:none; user-select:none; z-index:0; }

/* ── ICON BADGE ── */
.amb-icon-badge { width:48px; height:48px; border-radius:12px; background:rgba(0,191,165,.08); border:1px solid rgba(0,191,165,.2); display:flex; align-items:center; justify-content:center; font-size:20px; margin-bottom:20px; transition:background .3s, border-color .3s, transform .3s; flex-shrink:0; }
.amb-card:hover .amb-icon-badge { background:rgba(0,191,165,.16); border-color:rgba(0,191,165,.4); transform:scale(1.08); }

/* ── CTA BUTTON ── */
.amb-cta-btn { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.16em; text-transform:uppercase; padding:16px 36px; background:#E8341A; color:#060607; text-decoration:none; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); display:inline-block; transition:all .3s; border:none; cursor:pointer; }
.amb-cta-btn:hover { background:#C9A84C; transform:translateY(-2px); }

/* ── T&C TRIGGER ── */
.amb-tc-trigger {
  font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase;
  color:rgba(244,240,232,0.3); background:none; border:none; cursor:pointer; padding:4px 8px;
  border-bottom:1px dashed rgba(244,240,232,0.15); transition:color .2s, border-color .2s;
  display:inline-block;
}
.amb-tc-trigger:hover { color:rgba(201,168,76,0.7); border-color:rgba(201,168,76,0.3); }

/* ── MODAL OVERLAY ── */
.amb-modal-overlay {
  position:fixed; inset:0; z-index:9999;
  background:rgba(0,0,0,0.75); backdrop-filter:blur(10px);
  display:flex; align-items:center; justify-content:center;
  padding:16px;
  animation:amb-overlayIn .2s ease;
}

/* ── MODAL BOX ── */
.amb-modal-box {
  position:relative; width:100%; max-width:680px; max-height:88vh;
  display:flex; flex-direction:column;
  background:#111113; border:1px solid rgba(201,168,76,0.2);
  border-radius:16px; overflow:hidden;
  box-shadow:0 40px 120px rgba(0,0,0,.9), 0 0 0 1px rgba(201,168,76,.05), 0 0 60px rgba(201,168,76,.04);
  animation:amb-modalIn .25s cubic-bezier(.23,1,.32,1);
}

/* ── MODAL HEADER ── */
.amb-modal-hdr {
  display:flex; justify-content:space-between; align-items:center;
  padding:20px 28px; border-bottom:1px solid rgba(255,255,255,.06);
  background:#0D0D0F; flex-shrink:0;
}
.amb-modal-hdr-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:.08em; color:#C9A84C; }
.amb-modal-hdr-sub   { font-family:'DM Mono',monospace; font-size:8px; letter-spacing:.18em; text-transform:uppercase; color:rgba(244,240,232,.3); margin-top:2px; }

/* ── MODAL CLOSE ── */
.amb-modal-close {
  width:36px; height:36px; border-radius:8px; border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04); color:rgba(244,240,232,.5);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .2s; flex-shrink:0;
}
.amb-modal-close:hover { background:rgba(232,52,26,.12); border-color:rgba(232,52,26,.3); color:#F4F0E8; }

/* ── MODAL BODY ── */
.amb-modal-body {
  padding:28px; overflow-y:auto; flex:1;
  font-family:'Cormorant Garamond',serif; font-size:15px; font-weight:300; line-height:1.85; color:rgba(244,240,232,.65);
  scrollbar-width:thin; scrollbar-color:rgba(201,168,76,.2) transparent;
}
.amb-modal-body::-webkit-scrollbar { width:4px; }
.amb-modal-body::-webkit-scrollbar-track { background:transparent; }
.amb-modal-body::-webkit-scrollbar-thumb { background:rgba(201,168,76,.25); border-radius:2px; }

/* ── MODAL SECTIONS ── */
.amb-modal-section { margin-bottom:28px; padding-bottom:28px; border-bottom:1px solid rgba(255,255,255,.05); }
.amb-modal-section:last-child { border-bottom:none; margin-bottom:0; padding-bottom:0; }
.amb-modal-section-title {
  font-family:'Bebas Neue',sans-serif; font-size:16px; letter-spacing:.08em; color:#F4F0E8; margin-bottom:12px;
  display:flex; align-items:center; gap:10px;
}
.amb-modal-section-title::before { content:''; width:14px; height:1.5px; background:#C9A84C; display:inline-block; flex-shrink:0; }
.amb-modal-warn {
  background:rgba(232,52,26,.07); border:1px solid rgba(232,52,26,.2); border-radius:8px;
  padding:14px 18px; margin:12px 0; display:flex; gap:12px; align-items:flex-start;
  font-size:14px; color:rgba(244,240,232,.7);
}
.amb-modal-list { padding-left:0; margin:8px 0; list-style:none; display:flex; flex-direction:column; gap:8px; }
.amb-modal-list li { display:flex; align-items:flex-start; gap:10px; font-size:14px; }
.amb-modal-list li::before { content:'▸'; color:#C9A84C; font-size:10px; margin-top:4px; flex-shrink:0; }

/* ── MODAL FOOTER ── */
.amb-modal-footer {
  padding:16px 28px; border-top:1px solid rgba(255,255,255,.06);
  background:#0D0D0F; flex-shrink:0;
  display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;
}
.amb-modal-footer-note { font-family:'DM Mono',monospace; font-size:8px; letter-spacing:.12em; text-transform:uppercase; color:rgba(244,240,232,.25); }
.amb-modal-footer-close-btn {
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.14em; text-transform:uppercase;
  padding:10px 24px; background:#C9A84C; color:#060607; border:none; border-radius:4px;
  cursor:pointer; transition:all .2s;
}
.amb-modal-footer-close-btn:hover { background:#E8D85A; }

/* ── RESPONSIVE ── */
@media (max-width:768px) {
  .amb-steps-grid     { grid-template-columns:1fr !important; }
  .amb-modal-box      { max-height:92vh; border-radius:12px; }
  .amb-modal-hdr      { padding:16px 20px; }
  .amb-modal-body     { padding:20px; }
  .amb-modal-footer   { padding:14px 20px; }
}
@media (max-width:480px) {
  .amb-steps-grid { grid-template-columns:1fr !important; }
  .amb-modal-overlay { padding:0; align-items:flex-end; }
  .amb-modal-box  { max-height:94vh; border-radius:16px 16px 0 0; }
}
`;

/* ─── HOOK: intersection reveal ─── */
function useReveal(options = { threshold: 0.1 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.querySelectorAll('.amb-reveal').forEach(r => r.classList.add('vis'));
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── T&C MODAL ─── */
function TCModal({ onClose }) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const stopProp = useCallback(e => e.stopPropagation(), []);

  return (
    <div
      className="amb-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="amb-tc-title"
      onClick={onClose}
    >
      <div className="amb-modal-box" onClick={stopProp}>

        {/* ── Header ── */}
        <div className="amb-modal-hdr">
          <div>
            <div className="amb-modal-hdr-title" id="amb-tc-title">Terms &amp; Conditions</div>
            <div className="amb-modal-hdr-sub">Evoa Ambassador Program · Effective from 2026</div>
          </div>
          <button className="amb-modal-close" onClick={onClose} aria-label="Close Terms and Conditions">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="amb-modal-body">

          {/* Intro */}
          <div className="amb-modal-section">
            <p>
              By participating in the <strong style={{ color: '#F4F0E8' }}>Evoa Ambassador Program</strong>, you agree to abide by the following terms and conditions. Please read them carefully before sharing your referral code or claiming any rewards.
            </p>
          </div>

          {/* 1. Reward Eligibility */}
          <div className="amb-modal-section">
            <div className="amb-modal-section-title">1. Reward Eligibility</div>
            <ul className="amb-modal-list">
              <li>Rewards are credited <strong style={{ color: '#C9A84C' }}>only</strong> when a referred user successfully signs up on Evoa <strong style={{ color: '#F4F0E8' }}>and</strong> purchases a paid premium plan.</li>
              <li>A referral is considered valid only after the referred user completes full account registration and their premium payment is confirmed.</li>
              <li>Free sign-ups, trial activations, or incomplete registrations do not qualify for ambassador rewards.</li>
              <li>Rewards will be processed within <strong style={{ color: '#F4F0E8' }}>7–14 business days</strong> following successful premium purchase confirmation.</li>
            </ul>
            <div className="amb-modal-warn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8341A" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Rewards are subject to final validation by the Evoa team and may be withheld if any suspicious activity is detected.</span>
            </div>
          </div>

          {/* 2. Account Integrity */}
          <div className="amb-modal-section">
            <div className="amb-modal-section-title">2. Account Integrity</div>
            <ul className="amb-modal-list">
              <li>Creation of <strong style={{ color: '#E8341A' }}>fake, duplicate, or bot accounts</strong> to manipulate referral counts is strictly prohibited.</li>
              <li>Self-referrals (using your own code on a secondary account) are not permitted and will be flagged automatically.</li>
              <li>Each referred user must be a genuine, unique individual with a valid email address and phone number.</li>
              <li>Multiple accounts created from the same device or IP address may be disqualified from the program.</li>
            </ul>
          </div>

          {/* 3. Prohibited Conduct */}
          <div className="amb-modal-section">
            <div className="amb-modal-section-title">3. Prohibited Conduct</div>
            <ul className="amb-modal-list">
              <li>Sharing misleading, false, or exaggerated claims about Evoa's platform or rewards to attract referrals.</li>
              <li>Offering cash, gifts, or incentives to others in exchange for using your referral code.</li>
              <li>Spamming referral codes on social media, forums, or messaging platforms in an unsolicited manner.</li>
              <li>Using automated tools, bots, or scripts to generate or distribute referral links.</li>
            </ul>
          </div>

          {/* 4. Fraud & Enforcement */}
          <div className="amb-modal-section">
            <div className="amb-modal-section-title">4. Fraud &amp; Account Restrictions</div>
            <p>Engaging in fraudulent activity — including but not limited to fake referrals, manipulated accounts, or misuse of the program — will result in:</p>
            <ul className="amb-modal-list">
              <li>Immediate disqualification from the Ambassador Program.</li>
              <li>Forfeiture of all pending and earned rewards.</li>
              <li>Temporary suspension or <strong style={{ color: '#E8341A' }}>permanent restriction</strong> of your Evoa account.</li>
              <li>Potential legal action in cases of deliberate fraud or financial misrepresentation.</li>
            </ul>
            <div className="amb-modal-warn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8341A" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Evoa reserves the right to suspend any ambassador account under investigation without advance notice.</span>
            </div>
          </div>

          {/* 5. Reward Validation */}
          <div className="amb-modal-section">
            <div className="amb-modal-section-title">5. Reward Validation &amp; Modification</div>
            <ul className="amb-modal-list">
              <li>All rewards are <strong style={{ color: '#F4F0E8' }}>subject to validation</strong> by the Evoa compliance team before being issued.</li>
              <li>Evoa reserves the right to adjust, deny, or revoke rewards at its discretion if fraud or policy violations are found.</li>
              <li>Reward structures, amounts, and eligibility criteria may change at any time without prior notice.</li>
              <li>Rewards are non-transferable and have no cash equivalent unless explicitly stated.</li>
            </ul>
          </div>

          {/* 6. Program Changes */}
          <div className="amb-modal-section">
            <div className="amb-modal-section-title">6. Program Modifications &amp; Termination</div>
            <ul className="amb-modal-list">
              <li>Evoa may modify, pause, or terminate the Ambassador Program at any time without prior notice.</li>
              <li>Continued participation after any modification constitutes acceptance of the updated terms.</li>
              <li>Evoa's decision in all matters related to the Ambassador Program is final and binding.</li>
            </ul>
          </div>

          {/* 7. Contact */}
          <div className="amb-modal-section" style={{ marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }}>
            <div className="amb-modal-section-title">7. Contact &amp; Support</div>
            <p>
              For any queries related to the Ambassador Program, rewards, or account concerns, please contact us at{' '}
              <a href="mailto:connectevoa@gmail.com" style={{ color: '#C9A84C', textDecoration: 'none', borderBottom: '1px solid rgba(201,168,76,.3)' }}>
                connectevoa@gmail.com
              </a>
              . Our team will respond within 3–5 business days.
            </p>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className="amb-modal-footer">
          <span className="amb-modal-footer-note">© 2026 Evoa Technology Pvt. Ltd. · All rights reserved</span>
          <button className="amb-modal-footer-close-btn" onClick={onClose}>
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}

/* ─── STEPS DATA ─── */
const steps = [
  {
    num: '01', icon: '🚀', title: 'Sign Up on Evoa',
    desc: (<>Create your account by clicking{' '}<Link to="/register" className="amb-signup-link">Signup</Link>{' '}and choose your role — <strong style={{ color: 'rgba(244,240,232,0.85)' }}>Viewer</strong> or{' '}<strong style={{ color: 'rgba(244,240,232,0.85)' }}>Startup</strong> — to get started on the platform.</>),
    accent: '#E8341A',
  },
  {
    num: '02', icon: '👤', title: 'Go to Your Profile Icon',
    desc: 'Once logged in, look for your profile icon in the bottom-right corner of the navbar. Tap it to open your account menu.',
    accent: '#C9A84C',
  },
  {
    num: '03', icon: '🤝', title: 'Select Ambassador Program',
    desc: 'Inside the profile menu, click on three dot, then find and select the "Ambassador Program" option to access the dedicated ambassador dashboard.',
    accent: '#00BFA5',
  },
  {
    num: '04', icon: '🎟️', title: 'Get Your Ambassador Code',
    desc: 'Your unique ambassador referral code will be generated instantly. Share it with your network and start earning rewards for every successful referral.',
    accent: '#C9A84C',
  },
];

/* ─── HERO ─── */
function Hero() {
  const lineRef = useRef(null);
  useEffect(() => {
    setTimeout(() => { if (lineRef.current) lineRef.current.classList.add('vis'); }, 800);
  }, []);

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,14vw,160px) 24px 80px', position: 'relative', overflow: 'hidden', background: '#060607' }}>
      <div style={{ position: 'absolute', top: '20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(0,191,165,.07),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-8%', width: 420, height: 420, background: 'radial-gradient(circle,rgba(201,168,76,.08),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(circle,rgba(232,52,26,.04),transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(80px,18vw,260px)', color: 'rgba(244,240,232,.015)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', letterSpacing: '.08em' }}>AMBASSADOR</div>

      <div style={{ opacity: 0, animation: 'amb-fadeUp .8s ease forwards .2s' }}>
        <div className="amb-pill-tag">Ambassador Program</div>
      </div>
      <div style={{ opacity: 0, animation: 'amb-fadeUp .9s ease forwards .4s', textAlign: 'center', maxWidth: 840, position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(40px,6.5vw,88px)', lineHeight: 1.08, color: '#F4F0E8', letterSpacing: '-.01em', marginBottom: 10 }}>
          Grow together,<br />
          <span style={{ color: '#C9A84C', fontStyle: 'normal', fontFamily: "'Bebas Neue',sans-serif", fontWeight: 400, letterSpacing: '.04em', fontSize: 'clamp(50px,8vw,108px)', display: 'block', lineHeight: .92 }}>earn together</span>
        </h1>
      </div>

      <div ref={lineRef} className="amb-hero-line" style={{ margin: '28px auto' }} />

      <div style={{ opacity: 0, animation: 'amb-fadeUp .9s ease forwards .7s', textAlign: 'center', maxWidth: 560, position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(16px,2vw,20px)', fontWeight: 300, lineHeight: 1.75, color: 'rgba(244,240,232,0.55)' }}>
          Join Evoa's Ambassador Program and become a part of India's fastest-growing startup ecosystem. Refer, grow, and earn — all from your profile.
        </p>
      </div>

      <div style={{ opacity: 0, animation: 'amb-fadeUp .9s ease forwards .95s', marginTop: 44, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <a href="#amb-steps" className="amb-cta-btn">Get Started →</a>
        <Link to="/register" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(244,240,232,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0' }}>
          Create Account <span style={{ width: 24, height: 1, background: 'currentColor', display: 'inline-block' }} />
        </Link>
      </div>

      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(244,240,232,0.35)', opacity: 0, animation: 'amb-fadeIn 1s ease forwards 1.3s' }}>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom,#E8341A,transparent)', animation: 'amb-floatUp 1.6s ease-in-out infinite' }} />
        Scroll
      </div>
    </section>
  );
}

/* ─── STEPS ─── */
function Steps({ onOpenTC }) {
  const ref = useReveal();
  return (
    <section id="amb-steps" ref={ref} style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)', background: '#0B0B0D', position: 'relative', overflow: 'hidden' }}>
      <div className="amb-ghost-num">Steps</div>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle,rgba(0,191,165,.06),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 380, height: 380, background: 'radial-gradient(circle,rgba(201,168,76,.05),transparent 65%)', pointerEvents: 'none' }} />

      <div className="amb-reveal" style={{ textAlign: 'center', marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <div className="amb-stag" style={{ justifyContent: 'center' }}>How it works</div>
        <div className="amb-sec-title">Join in 4 Simple Steps</div>
        <p className="amb-sec-sub">Follow these steps to become an Evoa Ambassador and start earning through referrals.</p>
      </div>

      <div className="amb-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20, maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {steps.map((step, i) => (
          <div key={step.num} className={`amb-card amb-reveal delay-${i + 1}`} style={{ padding: 'clamp(28px,3vw,44px)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${step.accent}99, transparent)` }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
              <div className="amb-step-num">{step.num}</div>
              <div className="amb-icon-badge" style={{ marginTop: 8, marginBottom: 0 }}>{step.icon}</div>
            </div>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(20px,2.5vw,28px)', letterSpacing: '.05em', color: '#F4F0E8', marginBottom: 12, lineHeight: 1 }}>
              {step.title}
            </h3>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(15px,1.6vw,17px)', fontWeight: 300, lineHeight: 1.8, color: 'rgba(244,240,232,0.55)' }}>
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* T&C clickable trigger */}
      <div className="amb-reveal delay-5" style={{ textAlign: 'center', marginTop: 48, position: 'relative', zIndex: 1 }}>
        <button
          className="amb-tc-trigger"
          onClick={onOpenTC}
          aria-label="View Terms and Conditions"
          id="amb-tc-btn"
        >
          T&amp;C* Applied
        </button>
      </div>
    </section>
  );
}

/* ─── WHY SECTION ─── */
function WhySection() {
  const ref = useReveal();
  const perks = [
    { icon: '💰', title: 'Earn Rewards', desc: 'Get rewarded for every successful referral who joins and purchases a premium plan on the platform.', accent: '#C9A84C' },
    { icon: '📈', title: 'Grow Your Network', desc: 'Build a powerful professional network within the startup and investor ecosystem.', accent: '#00BFA5' },
    { icon: '🏅', title: 'Exclusive Access', desc: 'Unlock early access to new features, exclusive events, and Evoa ambassador badges.', accent: '#E8341A' },
  ];

  return (
    <section ref={ref} style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)', background: '#1A1A1C', position: 'relative', overflow: 'hidden' }}>
      <div className="amb-ghost-num">Why</div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#E8341A 30%,#C9A84C 70%,transparent)', opacity: .35, zIndex: 1 }} />
      <div style={{ position: 'absolute', top: -60, right: -60, width: 380, height: 380, background: 'radial-gradient(circle,rgba(232,52,26,.06),transparent 65%)', pointerEvents: 'none' }} />

      <div className="amb-reveal" style={{ textAlign: 'center', marginBottom: 56, position: 'relative', zIndex: 1 }}>
        <div className="amb-stag" style={{ justifyContent: 'center' }}>Ambassador Perks</div>
        <div className="amb-sec-title">Why Join?</div>
        <p className="amb-sec-sub">Being an Evoa Ambassador comes with real, tangible benefits — not just a title.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20, maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {perks.map((p, i) => (
          <div key={p.title} className={`amb-card amb-reveal delay-${i + 1}`} style={{ padding: '36px 28px', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${p.accent}66,transparent)` }} />
            <div className="amb-icon-badge" style={{ margin: '0 auto 20px' }}>{p.icon}</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: '.06em', color: '#F4F0E8', marginBottom: 12 }}>{p.title}</div>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: 'rgba(244,240,232,0.4)' }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CTA STRIP ─── */
function CTAStrip() {
  const ref = useReveal();
  return (
    <section ref={ref} style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background: '#060607', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(circle,rgba(201,168,76,.07),transparent 65%)', pointerEvents: 'none' }} />
      <div className="amb-reveal" style={{ position: 'relative', zIndex: 1 }}>
        <div className="amb-stag" style={{ justifyContent: 'center' }}>Ready to begin?</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 1.1, color: '#F4F0E8', marginBottom: 24 }}>
          Become an Ambassador<br />
          <span style={{ color: '#C9A84C', fontStyle: 'normal', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,8vw,96px)', letterSpacing: '.04em', display: 'block', lineHeight: .9 }}>today.</span>
        </h2>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 300, color: 'rgba(244,240,232,0.55)', maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Sign up, complete your profile, and unlock your ambassador code within minutes.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="amb-cta-btn">Sign Up Now →</Link>
          <a href="#amb-steps" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(244,240,232,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0' }}>
            View Steps <span style={{ width: 24, height: 1, background: 'currentColor', display: 'inline-block' }} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── MAIN EXPORT ─── */
export default function AmbassadorProgram() {
  const [showTC, setShowTC] = useState(false);
  const openTC = useCallback(() => setShowTC(true), []);
  const closeTC = useCallback(() => setShowTC(false), []);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'evoa-ambassador-css';
    style.textContent = AMB_CSS;
    document.head.appendChild(style);
    document.title = 'Ambassador Program — Evoa';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', "Join the Evoa Ambassador Program. Refer friends, grow your network, and earn rewards by being part of India's top startup-investor platform.");
    return () => {
      const el = document.getElementById('evoa-ambassador-css');
      if (el) document.head.removeChild(el);
    };
  }, []);

  return (
    <div style={{ background: '#060607', minHeight: '100vh' }}>
      <LandingNav />
      <Hero />
      <Steps onOpenTC={openTC} />
      <WhySection />
      <CTAStrip />
      <Footer />
      {showTC && <TCModal onClose={closeTC} />}
    </div>
  );
}
