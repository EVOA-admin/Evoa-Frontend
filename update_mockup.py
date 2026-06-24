import re

with open('src/modules/landing/landingpage.jsx', 'r') as f:
    content = f.read()

css_old = r'''/\* Phone Mockup \*/
\.hero-phone \{
  width:310px;height:630px;border-radius:44px;
  background:#000;border:10px solid #000;
  box-shadow: 0 24px 60px rgba\(0,0,0,0\.15\), inset 0 0 0 1px rgba\(255,255,255,0\.2\), 0 0 0 1px rgba\(0,0,0,0\.1\);
  position:relative;overflow:hidden;
  transform:translateY\(-125px\);transition:transform 0\.6s cubic-bezier\(0\.2,0\.8,0\.2,1\);
\}
\.hero-phone:hover \{ transform:translateY\(-125px\) scale\(1\.02\); \}
\[data-theme="dark"\] \.hero-phone \{ border-color:#000;box-shadow:0 24px 60px rgba\(0,0,0,0\.5\), inset 0 0 0 1px rgba\(255,255,255,0\.1\); \}'''

css_new = '''/* Phone Mockup */
.hero-phone-wrap {
  position: relative;
  transform: translateY(-90px);
  transition: transform 0.6s cubic-bezier(0.2,0.8,0.2,1);
  z-index: 10;
  margin: 0 auto;
}
.hero-phone-wrap:hover { transform: translateY(-90px) scale(1.02); }
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
.box-3 { bottom: 80px; right: -70px; }'''

content = re.sub(css_old, css_new, content)

css_media_old = r'''@media\(max-width:1024px\)\{
  \.hero-inner \{ grid-template-columns:1fr;text-align:center;gap:40px; \}
  \.hero-left \{ align-items:center;text-align:center; \}
  \.hero-h1, \.hero-subtitle \{ text-align:center; \}
  \.hero-ctas, \.hero-stats \{ justify-content:center; \}
  \.hero-phone \{ width:280px;height:580px; \}
\}
@media\(max-width:768px\)\{
  #hero \{ padding:100px 20px 60px; \}
  \.hero-stat-div \{ display:none; \}
  \.hero-stats \{ gap:24px; \}
\}
@media\(max-width:480px\)\{ \.hero-h1\{font-size:32px;\} \.hero-phone \{ width:260px;height:540px; \} \}'''

css_media_new = '''@media(max-width:1024px){
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
@media(max-width:480px){ .hero-h1{font-size:32px;} .hero-phone { width:260px;height:540px; } }'''

content = re.sub(css_media_old, css_media_new, content)

jsx_old = r'''        <div className="hero-right fu5">
          \{\/\* iPhone Mockup \*\/\}
          <div className="hero-phone">
            <div className="hero-phone-notch" />
            <div className="hero-phone-screen">'''

jsx_new = '''        <div className="hero-right fu5">
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
                <div className="fb-title">AI Deal Score</div>
                <div className="fb-sub">Top 5% this week</div>
                <div className="fb-link">Score: 92 / 100</div>
              </div>
            </div>

            <div className="hero-phone">
              <div className="hero-phone-notch" />
              <div className="hero-phone-screen">'''

content = re.sub(jsx_old, jsx_new, content)

# Also close the hero-phone-wrap div at the end
jsx_end_old = r'''              </div>
            </div>
          </div>
        </div>
      </div>
    </section>'''

jsx_end_new = '''              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>'''

content = re.sub(jsx_end_old, jsx_end_new, content)

with open('src/modules/landing/landingpage.jsx', 'w') as f:
    f.write(content)
print("Updated successfully")
