import { useState, useEffect, useRef } from "react";
import AdityaImg from "../../../team_images/Aditya_image.jpg";
import AbhishekImg from "../../../team_images/Abhishek_Image.jpeg";
import Footer from "../../components/layout/footer";
import LandingNav from "../../components/layout/LandingNav";

/* ─── SCOPED CSS (animations + page-level layout only, no body/nav/cursor overrides) ─── */
const ABOUT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

/* ── ANIMATIONS ── */
@keyframes abt-fadeUp { from { opacity:0; transform:translateY(32px) } to { opacity:1; transform:translateY(0) } }
@keyframes abt-fadeIn { from { opacity:0 } to { opacity:1 } }
@keyframes abt-floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
@keyframes abt-pulseGlow { 0%,100%{box-shadow:0 0 20px var(--blue-brd)} 50%{box-shadow:0 0 40px var(--blue-brd)} }
@keyframes abt-orbSpin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes abt-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

/* ── REVEAL SYSTEM ── */
.abt-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity .75s ease, transform .75s ease;
}
.abt-reveal.vis { opacity: 1; transform: translateY(0); }
.abt-reveal.delay-1 { transition-delay: .1s; }
.abt-reveal.delay-2 { transition-delay: .2s; }
.abt-reveal.delay-3 { transition-delay: .3s; }
.abt-reveal.delay-4 { transition-delay: .4s; }
.abt-reveal.delay-5 { transition-delay: .5s; }

/* ── STAG / PILL ── */
.abt-stag {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--blue);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.abt-stag::before { content: ''; width: 22px; height: 1px; background: var(--blue); flex-shrink: 0; display: inline-block; }

.abt-pill-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: var(--blue-mid);
  border: 1px solid var(--blue-brd);
  padding: 6px 16px;
  border-radius: 40px;
  margin-bottom: 28px;
}
.abt-pill-tag::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--blue-mid); display: inline-block; animation: abt-pulseGlow 2s ease-in-out infinite; }

/* ── CARD ── */
.abt-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: border-color .3s, transform .3s;
}
.abt-card:hover { border-color: var(--blue-brd); transform: translateY(-4px); }

/* ── SECTION TITLE ── */
.abt-sec-title {
  font-family: 'Inter', sans-serif; font-weight: 800;
  font-size: clamp(36px, 5vw, 56px);
  letter-spacing: .04em;
  color: var(--blue-bright);
  text-align: center;
  margin-bottom: 12px;
}
.abt-sec-sub {
  font-family: 'Inter', sans-serif;
  font-size: clamp(15px, 1.8vw, 18px);
  font-weight: 300;
  color: var(--text-sub);
  text-align: center;
  max-width: 520px;
  margin: 0 auto 60px;
  line-height: 1.7;
}

/* ── GHOST NUMBER ── */
.abt-ghost-num {
  position: absolute;
  font-family: 'Inter', sans-serif; font-weight: 800;
  font-size: clamp(120px, 22vw, 320px);
  color: var(--border-soft);
  right: -20px;
  top: -40px;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

/* ── HERO LINE ── */
.abt-hero-line { height: 1px; background: linear-gradient(90deg,transparent,var(--blue) 30%,var(--blue-bright) 70%,transparent); width: 0; transition: width 1.4s cubic-bezier(.4,0,.2,1) .5s; margin: 0 auto; }
.abt-hero-line.vis { width: 280px; }

/* ── STATS BAR ── */
.abt-stat-item { text-align: center; padding: 0 32px; border-right: 1px solid var(--border); }
.abt-stat-item:last-child { border-right: none; }

/* ── TEAM AVATAR ── */
.abt-avatar-ring {
  width: 88px; height: 88px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--blue-brd);
  margin: 0 auto 20px;
  position: relative;
}
.abt-avatar-ring::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid var(--blue-brd);
  animation: abt-orbSpin 8s linear infinite;
  border-top-color: var(--blue-brd);
}

/* ── TIMELINE ── */
.abt-tl-year {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--blue-mid);
  background: var(--blue-brd);
  border: 1px solid var(--blue-brd);
  padding: 4px 12px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
}
.abt-tl-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--blue-mid);
  box-shadow: 0 0 16px var(--blue-brd);
  flex-shrink: 0;
}

/* ── VALUE ICON ── */
.abt-val-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  background: var(--blue-brd);
  border: 1px solid var(--blue-brd);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  margin: 0 auto 20px;
  transition: background .3s, border-color .3s, transform .3s;
}
.abt-card:hover .abt-val-icon { background: var(--blue-brd); border-color: var(--blue-brd); transform: scale(1.08); }

/* ── BFIRE BUTTON ── */
.abt-bfire { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.16em; text-transform:uppercase; padding:16px 36px; background:var(--blue); color:var(--bg); text-decoration:none; clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px)); display:inline-block; transition:all .3s; border:none; cursor:pointer; }
.abt-bfire:hover { background:var(--blue-bright); transform:translateY(-2px); }

/* ── FOOTER LINK ── */
.abt-ft-link { font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 300; color: var(--text-mute); text-decoration: none; transition: color .2s; display: block; padding: 4px 0; }
.abt-ft-link:hover { color: var(--text); }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .abt-mission-grid { grid-template-columns: 1fr !important; }
  .abt-values-grid { grid-template-columns: 1fr 1fr !important; }
  .abt-team-grid { grid-template-columns: 1fr !important; }
  .abt-stats-row { flex-wrap: wrap !important; gap: 24px !important; justify-content: center !important; }
  .abt-stat-item { border-right: none !important; border-bottom: 1px solid var(--border); padding: 12px 24px !important; }
  .abt-stat-item:last-child { border-bottom: none; }
}
@media (max-width: 480px) {
  .abt-values-grid { grid-template-columns: 1fr !important; }
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
        el.querySelectorAll('.abt-reveal').forEach(r => r.classList.add('vis'));
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── HOOK: breakpoint ─── */
function useBreakpoint() {
  const get = () => ({ isMobile: window.innerWidth <= 768, isSmall: window.innerWidth <= 480 });
  const [bp, setBp] = useState(() => typeof window !== 'undefined' ? get() : { isMobile: false, isSmall: false });
  useEffect(() => { const u = () => setBp(get()); window.addEventListener('resize', u); return () => window.removeEventListener('resize', u); }, []);
  return bp;
}

/* ─── HERO ─── */
function Hero() {
  const lineRef = useRef(null);
  useEffect(() => {
    setTimeout(() => { if (lineRef.current) lineRef.current.classList.add('vis'); }, 800);
  }, []);
  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(100px,14vw,160px) 24px 80px', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* ambient orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '-8%', width: 420, height: 420, background: 'radial-gradient(circle,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, background: 'radial-gradient(circle,var(--blue-brd),transparent 60%)', pointerEvents: 'none' }} />

      {/* ghost text */}
      <div style={{ position: 'absolute', fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 'clamp(80px,20vw,280px)', color: 'var(--border-soft)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', letterSpacing: '.08em' }}>EVOA</div>

      {/* pill */}
      <div style={{ opacity: 0, animation: 'abt-fadeUp .8s ease forwards .2s' }}>
        <div className="abt-pill-tag">About Evo-A</div>
      </div>

      {/* headline */}
      <div style={{ opacity: 0, animation: 'abt-fadeUp .9s ease forwards .4s', textAlign: 'center', maxWidth: 820, position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(42px,7vw,96px)', lineHeight: 1.08, color: 'var(--text)', letterSpacing: '-.01em', marginBottom: 10 }}>
          Building the future of
          <br />
          <span style={{ color: 'var(--blue-bright)', fontStyle: 'normal', fontFamily: "'Inter', sans-serif; font-weight: 800", fontWeight: 400, letterSpacing: '.04em', fontSize: 'clamp(52px,8.5vw,116px)', display: 'block', lineHeight: .92 }}>startup funding</span>
        </h1>
      </div>

      {/* line */}
      <div ref={lineRef} className="abt-hero-line" style={{ margin: '28px auto' }} />

      {/* sub */}
      <div style={{ opacity: 0, animation: 'abt-fadeUp .9s ease forwards .7s', textAlign: 'center', maxWidth: 580, position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 'clamp(16px,2vw,20px)', fontWeight: 300, lineHeight: 1.75, color: 'var(--text-sub)' }}>
          EVO-A connects ambitious founders with visionary investors, creating a trusted platform for funding, mentorship, and long-term growth in the startup ecosystem.
        </p>
      </div>

      {/* CTA */}
      <div style={{ opacity: 0, animation: 'abt-fadeUp .9s ease forwards .95s', marginTop: 44, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
        <a href="#abt-mission" className="abt-bfire">Our Story →</a>
        <a href="#abt-team" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-sub)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0' }}>
          Meet the Team <span style={{ width: 24, height: 1, background: 'currentColor', display: 'inline-block' }} />
        </a>
      </div>

      {/* stats strip */}
      <div style={{ opacity: 0, animation: 'abt-fadeUp .9s ease forwards 1.1s', marginTop: 72, position: 'relative', zIndex: 1, width: '100%', maxWidth: 680 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'rgba(15,15,16,.6)', backdropFilter: 'blur(12px)', overflow: 'hidden' }}>
          <div className="abt-stats-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            {[['2,400+', 'Startups', 'var(--blue)'], ['₹40Cr+', 'Capital Matched', 'var(--blue-bright)'], ['18', 'Countries', 'var(--blue-mid)'], ['2025', 'Est. Year', 'var(--blue-bright)']].map(([n, l, c]) => (
              <div key={l} className="abt-stat-item" style={{ padding: '24px 20px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 32, lineHeight: 1, color: c, letterSpacing: '.04em' }}>{n}</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-mute)', marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* scroll hint */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--text-mute)', opacity: 0, animation: 'abt-fadeIn 1s ease forwards 1.4s' }}>
        <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom,var(--blue),transparent)', animation: 'abt-floatUp 1.6s ease-in-out infinite' }} />Scroll
      </div>
    </section>
  );
}

/* ─── MISSION + VISION ─── */
function MissionVision() {
  const ref = useReveal();
  return (
    <section id="abt-mission" ref={ref} style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)', background: 'var(--bg-alt)', position: 'relative', overflow: 'hidden' }}>
      <div className="abt-ghost-num">01</div>
      <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'radial-gradient(circle,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />

      <div className="abt-reveal" style={{ textAlign: 'center', marginBottom: 60, position: 'relative', zIndex: 1 }}>
        <div className="abt-stag" style={{ justifyContent: 'center' }}>Who we are</div>
        <div className="abt-sec-title">Mission &amp; Vision</div>
        <p className="abt-sec-sub">Driven by purpose, guided by vision — every decision at EVO-A is rooted in empowering the next generation of founders.</p>
      </div>

      <div className="abt-mission-grid abt-reveal delay-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Mission card */}
        <div className="abt-card" style={{ padding: 'clamp(32px,4vw,52px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: 'linear-gradient(90deg,var(--blue),transparent)' }} />
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 22, height: 1, background: 'var(--blue)', display: 'inline-block' }} />Our Mission
          </div>
          <h3 style={{ fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 'clamp(28px,3.5vw,44px)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 24, lineHeight: 1 }}>Our mission</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 300, lineHeight: 1.85, color: 'var(--text-sub)', marginBottom: 18 }}>
            EVO-A exists to democratize access to startup funding for entrepreneurs across India, ensuring that promising ideas are not limited by geography or traditional networks.
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 300, lineHeight: 1.85, color: 'var(--text-mute)' }}>
            By combining technology, data, and human expertise, the platform enables startups and investors to discover the right opportunities faster, with greater confidence and transparency.
          </p>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,var(--blue-brd),transparent)' }} />
        </div>

        {/* Vision card */}
        <div className="abt-card" style={{ padding: 'clamp(32px,4vw,52px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: 'linear-gradient(90deg,transparent,var(--blue-mid),transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--blue-brd)', border: '1.5px solid var(--blue-brd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 28, animation: 'abt-pulseGlow 3s ease-in-out infinite', position: 'relative', zIndex: 1 }}>
            💡
          </div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--blue-mid)', marginBottom: 20, position: 'relative', zIndex: 1 }}>Vision 2030</div>
          <h3 style={{ fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 'clamp(28px,3.5vw,44px)', letterSpacing: '.04em', color: 'var(--text)', marginBottom: 24, lineHeight: 1, position: 'relative', zIndex: 1 }}>Vision 2030</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 300, lineHeight: 1.85, color: 'var(--text-sub)', position: 'relative', zIndex: 1, maxWidth: 380 }}>
            To be India's most trusted startup–investor platform, enabling <em style={{ color: 'var(--blue-bright)', fontStyle: 'normal' }}>₹10,000+ crores</em> in funding and empowering thousands of founders by 2030.
          </p>
          <div style={{ marginTop: 32, padding: '12px 24px', border: '1px solid var(--blue-brd)', borderRadius: 8, fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--blue-mid)', position: 'relative', zIndex: 1 }}>
            2025 → 2030
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── CORE VALUES ─── */
function CoreValues() {
  const ref = useReveal();
  const values = [
    { icon: '🚀', title: 'Innovation First', desc: 'Supporting bold, breakthrough ideas that can reshape industries and create lasting impact.', acc: 'var(--blue)' },
    { icon: '👥', title: 'Community Driven', desc: 'Building an ecosystem where startups, investors, and mentors grow and succeed together.', acc: 'var(--blue-mid)' },
    { icon: '📊', title: 'Data-Driven', desc: 'Using insights and analytics to guide smarter investment and growth decisions.', acc: 'var(--blue-bright)' },
    { icon: '🤝', title: 'Transparency', desc: 'Prioritizing openness, trust, and honest communication with all stakeholders.', acc: 'var(--blue-mid)' },
  ];
  return (
    <section ref={ref} style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="abt-ghost-num">02</div>
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 440, height: 440, background: 'radial-gradient(circle,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />

      <div className="abt-reveal" style={{ marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <div className="abt-stag" style={{ justifyContent: 'center' }}>What we stand for</div>
        <div className="abt-sec-title">Our core values</div>
        <p className="abt-sec-sub">These aren't just words on a wall — they're the principles that shape every feature, every partnership, every decision we make.</p>
      </div>

      <div className="abt-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {values.map((v, i) => (
          <div key={v.title} className={`abt-card abt-reveal delay-${i + 1}`} style={{ padding: '36px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${v.acc}66,transparent)` }} />
            <div className="abt-val-icon">{v.icon}</div>
            <div style={{ fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 20, letterSpacing: '.06em', color: 'var(--text)', marginBottom: 12 }}>{v.title}</div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: 'var(--text-mute)' }}>{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── JOURNEY / TIMELINE ─── */
function Journey() {
  const ref = useReveal();
  const milestones = [
    { year: '2025', title: 'Founded', desc: 'EVO-A launched with a vision to transform how startups connect with capital.', acc: 'var(--blue)' },
    { year: '2026', title: 'Add 10000 Startups & 50 Investors', desc: 'Reached a community of 30+ national & 10+ international startups.', acc: 'var(--blue-bright)' },
  ];
  return (
    <section ref={ref} style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)', background: 'var(--bg-alt)', position: 'relative', overflow: 'hidden' }}>
      <div className="abt-ghost-num">03</div>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,var(--blue) 30%,var(--blue-bright) 70%,transparent)', opacity: .4, zIndex: 1 }} />
      <div style={{ position: 'absolute', top: -60, right: -60, width: 380, height: 380, background: 'radial-gradient(circle,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />

      <div className="abt-reveal" style={{ marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <div className="abt-stag" style={{ justifyContent: 'center' }}>Milestones</div>
        <div className="abt-sec-title">Our journey</div>
        <p className="abt-sec-sub">From a single idea to a growing ecosystem — every milestone is a step toward our 2030 vision.</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* vertical spine */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom,transparent,var(--blue) 20%,var(--blue-bright) 80%,transparent)', transform: 'translateX(-50%)', zIndex: 0 }} />

        {milestones.map((m, i) => (
          <div key={m.year} className={`abt-reveal delay-${i + 2}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: i < milestones.length - 1 ? 48 : 0, position: 'relative' }}>
            {/* left side */}
            <div style={{ flex: 1, textAlign: 'right', paddingRight: 32, paddingTop: 8 }}>
              {i % 2 === 0 ? (
                <div>
                  <span className="abt-tl-year">{m.year}</span>
                  <div style={{ fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 24, letterSpacing: '.04em', color: 'var(--text)', marginBottom: 8, lineHeight: 1 }}>{m.title}</div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: 'var(--text-sub)' }}>{m.desc}</p>
                </div>
              ) : <div />}
            </div>

            {/* dot */}
            <div style={{ position: 'relative', zIndex: 2, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6 }}>
              <div className="abt-tl-dot" style={{ background: m.acc, boxShadow: `0 0 20px ${m.acc}66` }} />
            </div>

            {/* right side */}
            <div style={{ flex: 1, paddingLeft: 32, paddingTop: 8 }}>
              {i % 2 !== 0 ? (
                <div>
                  <span className="abt-tl-year" style={{ color: m.acc, borderColor: `${m.acc}44`, background: `${m.acc}15` }}>{m.year}</span>
                  <div style={{ fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 24, letterSpacing: '.04em', color: 'var(--text)', marginBottom: 8, lineHeight: 1 }}>{m.title}</div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: 'var(--text-sub)' }}>{m.desc}</p>
                </div>
              ) : <div />}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── TEAM ─── */
function Team() {
  const ref = useReveal();
  const { isMobile } = useBreakpoint();

  const members = [
    { name: 'Aditya Singh', role: 'CEO & Co-Founder', photo: AdityaImg, acc: 'var(--blue)' },
    { name: 'Abhishek Kumar', role: 'CTO & Co-Founder', photo: AbhishekImg, acc: 'var(--blue-mid)' },
  ];

  return (
    <section id="abt-team" ref={ref} style={{ padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,80px)', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="abt-ghost-num">04</div>
      <div style={{ position: 'absolute', top: -60, left: -60, width: 400, height: 400, background: 'radial-gradient(circle,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />

      <div className="abt-reveal" style={{ textAlign: 'center', marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <div className="abt-stag" style={{ justifyContent: 'center' }}>The people behind Evo-A</div>
        <div className="abt-sec-title">Our team</div>
        <p className="abt-sec-sub">A small, focused team of builders, thinkers, and operators driven by a shared belief in the power of ideas.</p>
      </div>

      <div className="abt-team-grid" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 24, maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {members.map((m, i) => (
          <div key={m.name} className={`abt-card abt-reveal delay-${i + 1}`} style={{ padding: '40px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${m.acc},transparent)` }} />

            {/* Avatar with real image */}
            <div className="abt-avatar-ring">
              <img
                src={m.photo}
                alt={m.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                loading="lazy"
              />
            </div>

            <div style={{ fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 22, letterSpacing: '.06em', color: 'var(--text)', marginBottom: 6 }}>{m.name}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: '.16em', textTransform: 'uppercase', color: m.acc, marginBottom: 16 }}>{m.role}</div>
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
    <section ref={ref} style={{ padding: 'clamp(60px,8vw,100px) clamp(20px,5vw,80px)', background: 'var(--bg-alt)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(circle,var(--blue-brd),transparent 65%)', pointerEvents: 'none' }} />
      <div className="abt-reveal" style={{ position: 'relative', zIndex: 1 }}>
        <div className="abt-stag" style={{ justifyContent: 'center' }}>Join the ecosystem</div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 1.1, color: 'var(--text)', marginBottom: 24 }}>
          Ready to be part of<br />
          <span style={{ color: 'var(--blue-bright)', fontStyle: 'normal', fontFamily: "'Inter', sans-serif; font-weight: 800", fontSize: 'clamp(48px,8vw,96px)', letterSpacing: '.04em', display: 'block', lineHeight: .9 }}>something bigger?</span>
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 300, color: 'var(--text-sub)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Whether you're a founder seeking capital or an investor seeking the next breakthrough — EVO-A is your platform.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" className="abt-bfire">Get Started →</a>
          <a href="/contact" style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-sub)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, padding: '16px 0' }}>
            Contact us <span style={{ width: 24, height: 1, background: 'currentColor', display: 'inline-block' }} />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── MAIN EXPORT ─── */
export default function About() {
  // Inject scoped CSS only (no body/nav/cursor rules)
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'evoa-about-css';
    style.textContent = ABOUT_CSS;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById('evoa-about-css');
      if (el) document.head.removeChild(el);
    };
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <LandingNav />
      <Hero />
      <MissionVision />
      <CoreValues />
      <Journey />
      <Team />
      <CTAStrip />
      <Footer />
    </div>
  );
}
