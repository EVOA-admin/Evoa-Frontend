import re
import os

new_auth_css = """
@keyframes auth-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes auth-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes auth-shake { 0%,100%{transform:translateX(0)} 15%,45%,75%{transform:translateX(-5px)} 30%,60%,90%{transform:translateX(5px)} }
@keyframes ref-spin    { to{transform:rotate(360deg)} }

.auth-root {
  min-height:100vh;display:flex;
  background:var(--bg);color:var(--text);
  font-family:'Inter',sans-serif;
  position:relative;overflow:hidden;
}

/* ── LEFT BRAND PANEL ── */
.auth-left {
  display:none;
}
@media(min-width:1024px){
  .auth-left {
    display:flex;flex-direction:column;justify-content:center;
    width:50%;position:relative;overflow:hidden;
    background:var(--bg);
    border-right:1px solid var(--border);
  }
}

/* ── RIGHT FORM PANEL ── */
.auth-right {
  flex:1;display:flex;align-items:center;justify-content:center;
  padding:32px 24px;position:relative;z-index:2;
}
@media(min-width:1024px){
  .auth-right { width:50%;flex:none; }
}

.auth-panel {
  width:100%;max-width:400px;
}

/* Brand header */
.auth-brand {
  font-family:'Inter',sans-serif;
  font-size:32px;letter-spacing:.02em; font-weight: 800;
  color:var(--text);margin-bottom:6px;text-align:center;
}
.auth-brand span { color:var(--blue); }
.auth-brand-sub {
  font-family:'DM Mono',monospace;font-size:9px;
  letter-spacing:.22em;text-transform:uppercase;
  color:var(--text-mute);text-align:center;margin-bottom:32px;
}

/* Form box */
.auth-box {
  background:var(--bg-card);
  border:1px solid var(--border);
  border-radius: 16px;
  padding:32px 28px;margin-bottom:16px;
}

.auth-heading {
  font-family:'Inter',sans-serif;
  font-size:28px;letter-spacing:-.02em; font-weight: 700;
  color:var(--text);margin-bottom:6px;
}
.auth-subheading {
  font-size:14px;font-weight:400;
  color:var(--text-sub);margin-bottom:24px;
}

/* Label */
.auth-label {
  font-family:'DM Mono',monospace;font-size:10px;
  letter-spacing:.15em;text-transform:uppercase;
  color:var(--text-sub);margin-bottom:8px;display:block;
}

/* Field */
.auth-field { margin-bottom:18px; position:relative; }
.auth-input {
  width:100%;padding:13px 16px;
  background:var(--bg);
  border:1px solid var(--border);
  border-radius: 8px;
  color:var(--text);
  font-family:'Inter',sans-serif;
  font-size:15px;font-weight:400;
  outline:none;transition:border-color .25s,box-shadow .25s;
  box-sizing:border-box;
}
.auth-input::placeholder { color:var(--text-mute); font-style:normal; }
.auth-input:focus {
  border-color:var(--blue);
  box-shadow:0 0 0 3px rgba(59,130,246,0.1);
}
.auth-input.valid { border-color:#00BFA5;box-shadow:0 0 0 3px rgba(0,191,165,.1); }
.auth-input.invalid { border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.1); }
.auth-input-icon {
  position:absolute;right:14px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;
  color:var(--text-mute);padding:4px;
  transition:color .2s;
  display:flex;align-items:center;
}
.auth-input-icon:hover { color:var(--text); }

/* Primary button */
.auth-btn {
  width:100%;padding:14px 24px;
  background:var(--blue);color:#fff;
  font-family:'Inter',sans-serif;
  font-size:15px; font-weight: 600;
  border:none;cursor:pointer; border-radius: 8px;
  transition:background .25s,transform .15s;
  margin-bottom:16px;position:relative;overflow:hidden;
}
.auth-btn:hover { background:var(--blue-hover); }
.auth-btn:active { transform:scale(.98); }
.auth-btn:disabled { opacity:.5;cursor:not-allowed; }

/* OR divider */
.auth-or {
  display:flex;align-items:center;gap:12px;margin:0 0 16px;
}
.auth-or-line {
  flex:1;height:1px;background:var(--border);
}
.auth-or-text {
  font-family:'DM Mono',monospace;font-size:9px;
  letter-spacing:.2em;text-transform:uppercase;
  color:var(--text-mute);
}

/* Google button */
.auth-google-btn {
  width:100%;padding:13px 24px;
  background:var(--bg);
  border:1px solid var(--border); border-radius: 8px;
  color:var(--text);
  font-family:'Inter',sans-serif;
  font-size:14px; font-weight: 500;
  cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;
  transition:border-color .25s,color .25s,background .25s;
  text-transform: none; letter-spacing: normal;
}
.auth-google-btn:hover {
  border-color:var(--blue);
  background:var(--blue-pale);
}
.auth-google-btn:disabled { opacity:.4;cursor:not-allowed; }

/* Error box */
.auth-error {
  background:rgba(239,68,68,0.1);
  border:1px solid rgba(239,68,68,0.3);
  color:#ef4444; border-radius: 8px;
  font-family:'Inter',sans-serif;font-size:13px; font-weight: 500;
  padding:12px 14px;margin-bottom:16px;
  animation:auth-shake .5s ease;
}

/* Footer link box */
.auth-footer-box {
  background:var(--bg-card);
  border:1px solid var(--border); border-radius: 16px;
  padding:16px 24px;text-align:center;
  font-size:14px;font-weight:400;
  color:var(--text-sub);
}
.auth-footer-box a {
  color:var(--blue);text-decoration:none;
  font-family:'Inter',sans-serif;font-size:14px; font-weight: 600;
  transition:color .2s;
}
.auth-footer-box a:hover { color:var(--blue-hover); }

/* Home link */
.auth-home-link {
  position:absolute;top:20px;right:20px;z-index:20;
  font-family:'Inter',sans-serif;font-size:13px; font-weight: 500;
  color:var(--text-sub);
  text-decoration:none; border-radius: 100px;
  border:1px solid var(--border);
  padding:7px 16px; background: var(--bg-card);
  transition:color .2s,border-color .2s;
}
.auth-home-link:hover { color:var(--text);border-color:var(--blue); }

/* Forgot link */
.auth-forgot {
  text-align:right;margin-top:8px;margin-bottom:18px;
}
.auth-forgot a {
  font-family:'Inter',sans-serif;font-size:13px; font-weight: 500;
  color:var(--text-sub);
  text-decoration:none;transition:color .2s;
}
.auth-forgot a:hover { color:var(--blue); }

/* Animations */
.auth-anim-1 { animation:auth-fadeUp .5s ease both; }
.auth-anim-2 { animation:auth-fadeUp .5s .1s ease both; }
.auth-anim-3 { animation:auth-fadeUp .5s .2s ease both; }
.auth-anim-4 { animation:auth-fadeUp .5s .3s ease both; }
.auth-anim-5 { animation:auth-fadeUp .5s .4s ease both; }
.auth-anim-6 { animation:auth-fadeUp .5s .5s ease both; }
.auth-anim-7 { animation:auth-fadeUp .5s .6s ease both; }

/* ── Referral toggle ── */
.ref-toggle {
  display: flex; align-items: center; gap: 6px;
  font-family: 'DM Mono', monospace; font-size: 10px;
  letter-spacing: .14em; text-transform: uppercase;
  color: var(--blue); background: none; border: none;
  cursor: pointer; padding: 0; margin-bottom: 16px;
  transition: color .2s;
}
.ref-toggle:hover { color: var(--blue-hover); }
.ref-toggle svg { transition: transform .25s; }
.ref-toggle.open svg { transform: rotate(180deg); }

/* ── Referral field ── */
.ref-field-wrap {
  overflow: hidden;
  max-height: 0;
  transition: max-height .3s cubic-bezier(.4,0,.2,1), opacity .3s ease;
  opacity: 0;
}
.ref-field-wrap.open {
  max-height: 120px;
  opacity: 1;
}
.ref-status {
  position: absolute; right: 14px; top: 50%;
  transform: translateY(-50%);
  display: flex; align-items: center;
  pointer-events: none;
}
.ref-hint {
  font-family: 'DM Mono', monospace; font-size: 9px;
  letter-spacing: .1em; text-transform: uppercase;
  margin-top: 6px;
}
"""

def update_file(filepath):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
        
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace AUTH_CSS block
    # We find everything between `const AUTH_CSS = \`` and `\`;`
    pattern = r"const AUTH_CSS = `[\s\S]*?`;"
    replacement = f"const AUTH_CSS = `\n{new_auth_css.strip()}\n`;"
    content = re.sub(pattern, replacement, content)

    # Wrap root in evoa-root
    content = content.replace('<div className="auth-root">', '<div className="auth-root evoa-root">')

    # Fix referral code input color if it has inline styles
    content = content.replace("color: 'rgba(244,240,232,.25)'", "color: 'var(--text-mute)'")
    content = content.replace("color: '#00BFA5'", "color: 'var(--blue)'") # Valid hint color
    content = content.replace("color: '#E8341A'", "color: 'var(--red)'") # Invalid hint color

    # Fix icon colors in register
    content = content.replace('border-top-color: \'#C9A84C\'', 'borderTopColor: \'var(--blue)\'')
    content = content.replace('rgba(201,168,76,.3)', 'var(--border)')
    content = content.replace('color="#E8341A"', 'color="var(--red, #ef4444)"')

    with open(filepath, 'w') as f:
        f.write(content)

update_file('src/modules/auth/login.jsx')
update_file('src/modules/auth/register.jsx')
print("Auth UI updated!")
