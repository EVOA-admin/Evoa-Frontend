import { useState, useEffect, useRef, useCallback } from "react";
import Footer from "../../components/layout/footer";
import LandingNav from "../../components/layout/LandingNav";

/* ─── SCOPED CSS (no body/nav/cursor rules — layout handled by App) ─── */
const CONTACT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

/* ── ANIMATIONS ── */
@keyframes con-fadeUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
@keyframes con-fadeIn { from{opacity:0} to{opacity:1} }
@keyframes con-pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.05)} }
@keyframes con-orbit { from{transform:rotate(0deg) translateX(120px) rotate(0deg)} to{transform:rotate(360deg) translateX(120px) rotate(-360deg)} }
@keyframes con-orbit2 { from{transform:rotate(120deg) translateX(80px) rotate(-120deg)} to{transform:rotate(480deg) translateX(80px) rotate(-480deg)} }
@keyframes con-orbit3 { from{transform:rotate(240deg) translateX(160px) rotate(-240deg)} to{transform:rotate(600deg) translateX(160px) rotate(-600deg)} }
@keyframes con-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
@keyframes con-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes con-ripple { 0%{transform:scale(0);opacity:1} 100%{transform:scale(4);opacity:0} }
@keyframes con-glowPulse { 0%,100%{box-shadow:0 0 20px rgba(0,191,165,.2),0 0 40px rgba(0,191,165,.05)} 50%{box-shadow:0 0 40px rgba(0,191,165,.4),0 0 80px rgba(0,191,165,.15)} }
@keyframes con-morphBg { 0%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} 100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} }
@keyframes con-waveform { 0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)} }

/* ── REVEAL SYSTEM ── */
.cr { opacity:0; transform:translateY(30px); transition: opacity .8s ease, transform .8s ease; }
.cr.vis { opacity:1; transform:translateY(0); }
.cr.delay1 { transition-delay:.1s }
.cr.delay2 { transition-delay:.2s }
.cr.delay3 { transition-delay:.3s }
.cr.delay4 { transition-delay:.4s }
.cr.delay5 { transition-delay:.5s }
.cr.delay6 { transition-delay:.6s }
.cr.from-left { transform:translateX(-40px); }
.cr.from-left.vis { transform:translateX(0); }
.cr.from-right { transform:translateX(40px); }
.cr.from-right.vis { transform:translateX(0); }

/* ── INPUT STYLING ── */
.con-input {
  width: 100%;
  background: rgba(244,240,232,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 4px;
  padding: 14px 18px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  font-weight: 300;
  color: #F4F0E8;
  outline: none;
  transition: border-color .3s, background .3s, box-shadow .3s;
  position: relative;
}
.con-input::placeholder { color: rgba(244,240,232,.25); font-style: italic; }
.con-input:focus {
  border-color: #00BFA5;
  background: rgba(0,191,165,.04);
  box-shadow: 0 0 0 3px rgba(0,191,165,.08), 0 0 30px rgba(0,191,165,.1);
}
.con-input.error { border-color: #E8341A; }

/* ── LABEL ── */
.con-field-label {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: #00BFA5;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.con-field-label .req { color: #E8341A; }

/* ── SEND BUTTON ── */
.con-send-btn {
  width: 100%;
  padding: 18px 40px;
  background: #00BFA5;
  color: #060607;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: .22em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  position: relative;
  overflow: hidden;
  transition: background .3s, transform .2s;
}
.con-send-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent);
  background-size: 200% 100%;
  animation: con-shimmer 2.5s infinite;
  pointer-events: none;
}
.con-send-btn:hover { background: #C9A84C; transform: translateY(-2px); }
.con-send-btn:active { transform: translateY(0); }
.con-send-btn.sending { opacity: .7; pointer-events: none; }

/* ── CONTACT INFO CARD ── */
.con-info-card {
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: border-color .3s, background .3s, transform .3s;
  position: relative;
  overflow: hidden;
}
.con-info-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, #00BFA5, transparent);
  opacity: 0;
  transition: opacity .3s;
}
.con-info-card:hover::before { opacity: 1; }
.con-info-card:hover {
  border-color: rgba(0,191,165,.25);
  background: rgba(0,191,165,.04);
  transform: translateX(6px);
}

/* ── ICON BOX ── */
.con-icon-box {
  width: 48px; height: 48px;
  border-radius: 10px;
  background: rgba(0,191,165,.1);
  border: 1px solid rgba(0,191,165,.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background .3s, transform .3s;
}
.con-info-card:hover .con-icon-box {
  background: rgba(0,191,165,.2);
  transform: scale(1.08) rotate(3deg);
}

/* ── WAVEFORM ── */
.con-waveform { display: flex; align-items: center; gap: 2px; height: 16px; }
.con-waveform-bar {
  width: 2px;
  background: #00BFA5;
  border-radius: 1px;
  animation: con-waveform .8s ease-in-out infinite;
  opacity: .6;
}

/* ── PARTICLE CANVAS ── */
#con-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: .4;
}

/* ── SUCCESS STATE ── */
.con-success-overlay {
  position: absolute;
  inset: 0;
  background: rgba(6,6,7,.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
  transition: opacity .5s;
}
.con-success-overlay.visible {
  opacity: 1;
  pointer-events: all;
}

/* ── RESPONSIVE ── */
@media(max-width:768px) {
  .con-contact-grid { grid-template-columns: 1fr !important; }
  .con-hero-title { font-size: clamp(52px,14vw,80px) !important; }
}
@media(max-width:480px) {
  .con-info-stack { gap: 12px !important; }
}
`;

/* ─── CANVAS BACKGROUND ─── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [], mouseX = 0, mouseY = 0, raf;

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * 1400, y: Math.random() * 900,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.5 + .3,
        a: Math.random() * .6 + .1,
        c: Math.random() > .5 ? '#00BFA5' : '#C9A84C'
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        const dx = mouseX - p.x, dy = mouseY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) { p.vx += dx * 0.00015; p.vy += dy * 0.00015; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill(); ctx.globalAlpha = 1;
      });
      for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
        const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#00BFA5'; ctx.globalAlpha = (1 - d / 110) * .08; ctx.lineWidth = .5; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas id="con-canvas" ref={ref} />;
}

/* ─── ORBITING DECORATION ─── */
function OrbitDeco() {
  return (
    <div style={{ position: 'absolute', top: '50%', left: '-80px', transform: 'translateY(-50%)', width: 320, height: 320, pointerEvents: 'none', zIndex: 0 }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(0,191,165,.06)' }} />
      <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1px solid rgba(201,168,76,.04)' }} />
      {[1, 2, 3].map(i => (
        <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, marginTop: -3, marginLeft: -3, borderRadius: '50%', background: i === 2 ? '#C9A84C' : '#00BFA5', boxShadow: `0 0 12px ${i === 2 ? '#C9A84C' : '#00BFA5'}`, animation: `con-orbit${i === 1 ? '' : i} ${5 + i * 2}s linear infinite` }} />
      ))}
    </div>
  );
}

/* ─── WAVEFORM ─── */
function Waveform({ active }) {
  return (
    <div className="con-waveform">
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="con-waveform-bar" style={{ height: active ? `${8 + Math.sin(i * 1.2) * 6}px` : '4px', animationDelay: `${i * .08}s`, animationPlayState: active ? 'running' : 'paused' }} />
      ))}
    </div>
  );
}

/* ─── RIPPLE EFFECT ─── */
function useRipple() {
  const [ripples, setRipples] = useState([]);
  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 800);
  }, []);
  return { ripples, addRipple };
}

/* ─── CONTACT INFO ITEM ─── */
function InfoCard({ icon, label, value, delay, active }) {
  return (
    <div className={`con-info-card cr delay${delay}`}>
      <div className="con-icon-box">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(244,240,232,0.4)', marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, color: '#F4F0E8', lineHeight: 1.5 }}>{value}</div>
      </div>
      {active && <Waveform active />}
    </div>
  );
}

/* ─── FLOATING LABEL FIELD ─── */
function FloatingField({ label, type = 'text', placeholder, value, onChange, error, multiline }) {
  const [focused, setFocused] = useState(false);
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div style={{ position: 'relative' }}>
      <label className="con-field-label">
        <span style={{ width: 14, height: 1, background: '#00BFA5', display: 'inline-block' }} />
        {label} <span className="req">*</span>
      </label>
      <Tag
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`con-input${error ? ' error' : ''}`}
        rows={multiline ? 5 : undefined}
        style={{ display: 'block', resize: multiline ? 'vertical' : undefined, minHeight: multiline ? 120 : undefined }}
      />
      {error && <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: '#E8341A', marginTop: 6, letterSpacing: '.1em' }}>↑ {error}</div>}
      <div style={{ position: 'absolute', bottom: error ? 20 : 0, left: 0, right: 0, height: 1, background: '#00BFA5', transform: focused ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'transform .3s cubic-bezier(.23,1,.32,1)' }} />
    </div>
  );
}

/* ─── MAIN CONTACT PAGE ─── */
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const { ripples, addRipple } = useRipple();
  const sectionRef = useRef(null);
  const formRef = useRef(null);
  const scanRef = useRef(null);

  // Inject scoped CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'evoa-contact-css';
    style.textContent = CONTACT_CSS;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('evoa-contact-css');
      if (el) document.head.removeChild(el);
    };
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.cr').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Scanline effect
  useEffect(() => {
    let pos = -100;
    const tick = () => {
      pos += 0.4;
      if (pos > 100) pos = -100;
      if (scanRef.current) scanRef.current.style.top = pos + '%';
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (form.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
    return e;
  };

  const handleSend = (e) => {
    addRipple(e);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 2200);
  };

  const handleChange = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (field === 'message') setCharCount(e.target.value.length);
    if (errors[field]) setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <>
      <LandingNav />
      <ParticleCanvas />

      {/* ── HERO SECTION ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,14vw,160px) 24px 80px', position: 'relative', overflow: 'hidden', zIndex: 1, background: '#060607' }}>

        <div style={{ position: 'absolute', top: '20%', left: '-15%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(0,191,165,.07),transparent 65%)', animation: 'con-morphBg 8s ease-in-out infinite', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(201,168,76,.06),transparent 65%)', animation: 'con-morphBg 11s ease-in-out infinite reverse', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 300, background: 'radial-gradient(circle,rgba(232,52,26,.04),transparent 60%)', pointerEvents: 'none', filter: 'blur(60px)' }} />

        {/* ghost text */}
        <div style={{ position: 'absolute', fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(80px,18vw,240px)', color: 'rgba(244,240,232,.015)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '.1em', userSelect: 'none' }}>CONTACT</div>

        {/* tag */}
        <div style={{ opacity: 0, animation: 'con-fadeUp .7s ease forwards .2s' }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.28em', textTransform: 'uppercase', color: '#00BFA5', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 28, border: '1px solid rgba(0,191,165,.2)', padding: '6px 16px', borderRadius: 40 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00BFA5', boxShadow: '0 0 8px #00BFA5', display: 'inline-block', animation: 'con-pulse 2s ease-in-out infinite' }} />
            Signal Transmission Open
          </div>
        </div>

        {/* main title */}
        <div style={{ opacity: 0, animation: 'con-fadeUp .9s ease forwards .4s', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h1 className="con-hero-title" style={{ fontFamily: "'Cormorant Garamond',serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(48px,7vw,100px)', lineHeight: 1.05, color: '#F4F0E8', letterSpacing: '-.01em', marginBottom: 8 }}>
            Let's build<br />
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontStyle: 'normal', fontWeight: 400, fontSize: 'clamp(60px,9vw,130px)', lineHeight: .88, letterSpacing: '.03em', display: 'block' }}>
              <span style={{ color: '#00BFA5' }}>something</span>{' '}
              <span style={{ WebkitTextStroke: '1px #C9A84C', WebkitTextFillColor: 'transparent' }}>extraordinary</span>
            </span>
          </h1>
        </div>

        {/* sub */}
        <div style={{ opacity: 0, animation: 'con-fadeUp .9s ease forwards .6s', textAlign: 'center', maxWidth: 560, marginTop: 28 }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(16px,2vw,20px)', fontWeight: 300, lineHeight: 1.75, color: 'rgba(244,240,232,0.5)' }}>
            Have a question, partnership inquiry, or just want to say hello? Our team receives your signal and responds within 24 hours.
          </p>
        </div>

        {/* scroll hint */}
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0, animation: 'con-fadeIn 1s ease forwards 1.2s' }}>
          <div style={{ width: 1, height: 48, background: 'linear-gradient(to bottom,#00BFA5,transparent)', animation: 'con-float 1.8s ease-in-out infinite' }} />
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(244,240,232,0.35)' }}>Scroll</div>
        </div>
      </section>

      {/* ── MAIN CONTACT SECTION ── */}
      <section ref={sectionRef} style={{ padding: 'clamp(60px,8vw,120px) clamp(20px,5vw,80px)', position: 'relative', zIndex: 1, background: '#060607' }}>

        {/* section heading */}
        <div style={{ textAlign: 'center', marginBottom: 80, position: 'relative', zIndex: 1 }}>
          <div className="cr" style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.26em', textTransform: 'uppercase', color: '#E8341A', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 28, height: 1, background: '#E8341A', display: 'inline-block' }} />Transmission Center<span style={{ width: 28, height: 1, background: '#E8341A', display: 'inline-block' }} />
          </div>
          <h2 className="cr delay1" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(48px,7vw,88px)', letterSpacing: '.04em', color: '#F4F0E8', lineHeight: .9, marginBottom: 20 }}>
            Get In <span style={{ color: '#00BFA5' }}>Touch</span>
          </h2>
          <p className="cr delay2" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 300, color: 'rgba(244,240,232,0.5)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            We typically respond within 24 business hours. Your message travels at the speed of ambition.
          </p>
        </div>

        {/* grid */}
        <div className="con-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 40, maxWidth: 1200, margin: '0 auto', alignItems: 'start' }}>

          {/* ── LEFT: Info Panel ── */}
          <div style={{ position: 'relative' }}>
            <OrbitDeco />
            <div className="con-info-stack" style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>

              <InfoCard delay={2}
                icon={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                label="Email"
                value="admin@evoa.co.in"
                active
              />

              <InfoCard delay={3}
                icon={<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></>}
                label="Phone"
                value="+91 9636641861, 9759054403"
              />

              <InfoCard delay={4}
                icon={<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>}
                label="Address"
                value="Shanti Nagar, Bareilly, 243001"
              />

              {/* Follow Us */}
              <div className="cr delay5" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '24px 28px' }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: '.06em', color: '#F4F0E8', marginBottom: 10 }}>Follow Us</div>
                <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,0.35)', marginBottom: 20, lineHeight: 1.6 }}>Connect for updates, startup stories, and ecosystem news.</p>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[
                    { label: 'LinkedIn', href: 'https://linkedin.com/company/evo-a', icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></> },
                    { label: 'Instagram', href: 'https://instagram.com/evoaofficial', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></> }
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{ width: 44, height: 44, border: '1px solid rgba(0,191,165,.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', transition: 'all .3s', background: 'rgba(0,191,165,.05)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,165,.15)'; e.currentTarget.style.borderColor = 'rgba(0,191,165,.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,191,165,.05)'; e.currentTarget.style.borderColor = 'rgba(0,191,165,.2)'; e.currentTarget.style.transform = ''; }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00BFA5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                    </a>
                  ))}
                </div>
              </div>

              {/* Response time stat */}
              <div className="cr delay6" style={{ background: 'linear-gradient(135deg,rgba(0,191,165,.08),rgba(201,168,76,.05))', border: '1px solid rgba(0,191,165,.15)', borderRadius: 8, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, lineHeight: 1, color: '#00BFA5', letterSpacing: '.04em' }}>24h</div>
                <div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(244,240,232,0.35)', marginBottom: 4 }}>Response Time</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 300, color: 'rgba(244,240,232,.6)' }}>We read every message personally</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Contact Form ── */}
          <div className="cr from-right delay2" ref={formRef} style={{ background: 'rgba(10,10,12,.6)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 'clamp(28px,4vw,52px)', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(20px)', animation: 'con-glowPulse 4s ease-in-out infinite' }}>

            {/* scanline effect */}
            <div ref={scanRef} style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,191,165,.3),transparent)', pointerEvents: 'none', zIndex: 0 }} />

            {/* top accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,transparent,#00BFA5 40%,#C9A84C 60%,transparent)' }} />

            {/* form header */}
            <div style={{ marginBottom: 36, position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: '#00BFA5', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Waveform active={!sent} />
                <span>Send Us a Message</span>
              </div>
              <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: '.04em', color: '#F4F0E8', lineHeight: 1, marginBottom: 10 }}>Start a Conversation</h3>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 300, color: 'rgba(244,240,232,0.35)', lineHeight: 1.6 }}>Fill out the form and we'll get back to you shortly.</p>
            </div>

            {/* success overlay */}
            <div className={`con-success-overlay${sent ? ' visible' : ''}`}>
              <div style={{ fontSize: 56, marginBottom: 24, animation: sent ? 'con-fadeUp .5s ease' : 'none' }}>✦</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, letterSpacing: '.06em', color: '#00BFA5', marginBottom: 12 }}>Signal Received</div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 300, color: 'rgba(244,240,232,0.55)', textAlign: 'center', maxWidth: 320, lineHeight: 1.7 }}>Your message has been transmitted. We'll respond within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); setCharCount(0); }}
                style={{ marginTop: 32, fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#00BFA5', background: 'transparent', border: '1px solid rgba(0,191,165,.3)', padding: '12px 28px', cursor: 'pointer', transition: 'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,165,.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >Send Another →</button>
            </div>

            {/* form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <FloatingField label="Full Name" placeholder="Aditya Singh" value={form.name} onChange={handleChange('name')} error={errors.name} />
                <FloatingField label="Email Address" type="email" placeholder="hello@evoa.co.in" value={form.email} onChange={handleChange('email')} error={errors.email} />
              </div>
              <FloatingField label="Subject" placeholder="Partnership Inquiry" value={form.subject} onChange={handleChange('subject')} error={errors.subject} />
              <div>
                <FloatingField label="Message" placeholder="Tell us about your inquiry, startup idea, or partnership opportunity..." value={form.message} onChange={handleChange('message')} error={errors.message} multiline />
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: charCount > 500 ? '#C9A84C' : 'rgba(244,240,232,0.35)', marginTop: 8, textAlign: 'right', letterSpacing: '.1em' }}>{charCount} chars</div>
              </div>

              {/* send button */}
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <button className={`con-send-btn${sending ? ' sending' : ''}`} onClick={handleSend}>
                  {sending ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                      <span style={{ display: 'flex', gap: 4 }}>
                        {[0, 1, 2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#060607', animation: 'con-pulse .8s ease-in-out infinite', animationDelay: `${i * .2}s` }} />)}
                      </span>
                      Transmitting Signal...
                    </span>
                  ) : 'Send Message →'}
                </button>
                {/* ripples */}
                {ripples.map(r => (
                  <span key={r.id} style={{ position: 'absolute', left: r.x, top: r.y, width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,.3)', transform: 'translate(-50%,-50%) scale(0)', animation: 'con-ripple .8s ease-out forwards', pointerEvents: 'none' }} />
                ))}
              </div>

              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, fontWeight: 300, color: 'rgba(244,240,232,.3)', textAlign: 'center', lineHeight: 1.6, fontStyle: 'italic' }}>
                By submitting this form, you agree to our privacy policy. We respect your privacy and will never share your information with third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MAP / LOCATION STRIP ── */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,80px)', position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,.04)', background: '#060607' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div className="cr">
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(244,240,232,0.35)', marginBottom: 12 }}>Located In</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,56px)', letterSpacing: '.04em', color: '#F4F0E8', lineHeight: 1 }}>UP, <span style={{ color: '#C9A84C' }}>India</span></div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, color: 'rgba(244,240,232,0.55)', marginTop: 8 }}>Bareilly, 243001</div>
          </div>
          {/* Coordinate display */}
          <div className="cr delay3" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'rgba(0,191,165,.5)', letterSpacing: '.12em', textAlign: 'right' }}>
            <div>28.3676° N</div>
            <div>79.4304° E</div>
            <div style={{ marginTop: 8, fontSize: 9, color: 'rgba(244,240,232,0.35)' }}>UTC+05:30 · IST</div>
          </div>
          {/* visual grid */}
          <div className="cr delay2" style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 6 }}>
            {Array.from({ length: 40 }, (_, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: i === 20 ? '#00BFA5' : 'rgba(255,255,255,.04)', boxShadow: i === 20 ? '0 0 12px #00BFA5' : 'none', animation: i === 20 ? 'con-pulse 2s ease-in-out infinite' : 'none', transition: 'background .3s' }} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
