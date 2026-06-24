import re

with open('src/modules/landing/landingpage.jsx', 'r') as f:
    content = f.read()

css_old = r'''/\* ══════════════════════════════════════════
   AMBASSADOR SIDE BANNERS
══════════════════════════════════════════ \*/
\.amb-side-container \{
  position:absolute;top:0;bottom:0;width:46px;z-index:20;
  background:rgba\(21,101,192,\.03\);
  overflow:hidden;transition:all \.35s;
  display:flex;justify-content:center;
\}
\.amb-side-container:hover \{ background:rgba\(21,101,192,\.08\); \}
\.amb-side-left  \{ left:0;border-right:1px solid rgba\(21,101,192,\.08\);transform:rotate\(180deg\); \}
\.amb-side-right \{ right:0;border-left:1px solid rgba\(21,101,192,\.08\); \}
\.amb-side-left:hover  \{ border-right-color:rgba\(21,101,192,\.22\); \}
\.amb-side-right:hover \{ border-left-color:rgba\(21,101,192,\.22\); \}
\[data-theme="dark"\] \.amb-side-container \{ background:rgba\(59,130,246,\.04\); \}
\[data-theme="dark"\] \.amb-side-container:hover \{ background:rgba\(59,130,246,\.10\); \}
\[data-theme="dark"\] \.amb-side-left  \{ border-right-color:rgba\(59,130,246,\.12\); \}
\[data-theme="dark"\] \.amb-side-right \{ border-left-color:rgba\(59,130,246,\.12\); \}
\[data-theme="dark"\] \.amb-side-left:hover  \{ border-right-color:rgba\(59,130,246,\.30\); \}
\[data-theme="dark"\] \.amb-side-right:hover \{ border-left-color:rgba\(59,130,246,\.30\); \}
\.amb-side-track \{
  display:flex;writing-mode:vertical-rl;white-space:nowrap;
  animation:ambScroll 45s linear infinite;will-change:transform;
\}
\.amb-side-container:hover \.amb-side-track \{ animation-play-state:paused; \}
\.amb-item \{ display:inline-flex;align-items:center;gap:14px;padding:28px 0;text-decoration:none; \}
\.amb-dot \{ width:6px;height:6px;border-radius:50%;background:var\(--blue\);flex-shrink:0;box-shadow:0 0 6px rgba\(21,101,192,\.4\); \}
\[data-theme="dark"\] \.amb-dot \{ box-shadow:0 0 6px rgba\(59,130,246,\.4\); \}
\.amb-text \{
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:\.14em;
  text-transform:uppercase;color:var\(--text-mute\);white-space:nowrap;
\}
\.amb-cta \{
  padding:7px 6px;border:1px solid var\(--blue-brd\);color:var\(--blue\);
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:\.16em;
  text-transform:uppercase;border-radius:4px;background:var\(--blue-pale\);
  transition:all \.3s;display:inline-flex;align-items:center;gap:5px;
\}
\.amb-item:hover \.amb-cta \{ background:var\(--blue\);color:#FFF;border-color:var\(--blue\); \}
@media\(max-width:1300px\)\{ \.amb-side-container\{display:none;\} \}'''

css_new = '''/* ══════════════════════════════════════════
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
@media(max-width:768px){ .amb-bottom-container{display:none;} }'''

content = re.sub(css_old, css_new, content)


jsx_old = r'''function AmbassadorBanner\(\) \{
  return \(
    <>
      <div className="amb-side-container amb-side-left">
        <div className="amb-side-track">
          \{AMB_ITEMS\.map\(\(_, i\) => \(
            <Link key=\{i\} to="/ambassador-program" className="amb-item" aria-label="Join Ambassador Program">
              <span className="amb-dot" />
              <span className="amb-text">\{AMB_TEXT\}</span>
              <span className="amb-cta">
                Join
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M1 7L7 1M7 1H2M7 1V6" stroke="currentColor" strokeWidth="1\.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          \)\)\}
        </div>
      </div>
      <div className="amb-side-container amb-side-right">
        <div className="amb-side-track">
          \{AMB_ITEMS\.map\(\(_, i\) => \(
            <Link key=\{i\} to="/ambassador-program" className="amb-item" aria-label="Join Ambassador Program">
              <span className="amb-dot" />
              <span className="amb-text">\{AMB_TEXT\}</span>
              <span className="amb-cta">
                Join
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M1 7L7 1M7 1H2M7 1V6" stroke="currentColor" strokeWidth="1\.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          \)\)\}
        </div>
      </div>
    </>
  \);
\}'''

jsx_new = '''function AmbassadorBanner() {
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
}'''

content = re.sub(jsx_old, jsx_new, content)

with open('src/modules/landing/landingpage.jsx', 'w') as f:
    f.write(content)
print("Updated ambassador successfully")
