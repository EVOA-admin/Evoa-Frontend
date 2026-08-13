import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import VideoReel from "../../components/shared/VideoReel";

/* ─── EVOA Auth CSS ─── */
const AUTH_CSS = `
/* ─── Auth Page Design Tokens ─── */
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
  --blue-hover:  #1976D2;
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
  --blue-hover:  #60A5FA;
  --border:      rgba(255,255,255,0.08);
  --border-soft: rgba(255,255,255,0.04);
  --shadow-sm:   0 1px 4px rgba(0,0,0,.3);
  --shadow-md:   0 4px 20px rgba(0,0,0,.4);
  --shadow-lg:   0 12px 48px rgba(0,0,0,.5);
  --shadow-blue: 0 8px 32px rgba(59,130,246,.22);
}

@keyframes auth-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes auth-shake { 0%,100%{transform:translateX(0)} 15%,45%,75%{transform:translateX(-5px)} 30%,60%,90%{transform:translateX(5px)} }

.auth-root {
  height:100vh; height:100dvh; display:flex;
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
    width:50%;height:100%;position:relative;overflow:hidden;
    background:var(--bg);
    border-right:1px solid var(--border);
  }
}

/* ── RIGHT FORM PANEL ── */
.auth-right {
  flex:1;
  height:100%;
  overflow-y:auto;
  overflow-x:hidden;
  padding:60px 24px;
  position:relative;z-index:2;
  display:flex;
  flex-direction:column;
}
@media(min-width:1024px){
  .auth-right { width:50%;flex:none; padding:80px 40px; }
}

.auth-panel {
  width:100%;max-width:400px;
  margin:auto;
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

/* Error & Success boxes */
.auth-error {
  background:rgba(239,68,68,0.1);
  border:1px solid rgba(239,68,68,0.3);
  color:#ef4444; border-radius: 8px;
  font-family:'Inter',sans-serif;font-size:13px; font-weight: 500;
  padding:12px 14px;margin-bottom:16px;
  animation:auth-shake .5s ease;
}
.auth-success {
  background:rgba(34,197,94,0.1);
  border:1px solid rgba(34,197,94,0.3);
  color:#22c55e; border-radius: 8px;
  font-family:'Inter',sans-serif;font-size:13px; font-weight: 500;
  padding:12px 14px;margin-bottom:16px;
  text-align:center;
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

/* Animations */
.auth-anim-1 { animation:auth-fadeUp .5s ease both; }
.auth-anim-2 { animation:auth-fadeUp .5s .1s ease both; }
.auth-anim-3 { animation:auth-fadeUp .5s .2s ease both; }
`;

export default function ForgetPassword() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);
  const { forgotPassword }    = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true); setError(null); setSuccess(false);
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root evoa-root">
      <style>{AUTH_CSS}</style>
      <Link to="/" className="auth-home-link">← Home</Link>

      <div className="auth-left"><VideoReel /></div>

      <div className="auth-right">
        <div className="auth-panel">
          <div className="auth-anim-1">
            <div className="auth-brand">EVO<span>-A</span></div>
            <div className="auth-brand-sub">Startup · Investor · Ecosystem</div>
          </div>

          <div className="auth-box auth-anim-2">
            <div className="auth-heading">Forgot Password?</div>
            <div className="auth-subheading">Enter your email address and we'll send you a link to reset your password.</div>

            {success && (
              <div className="auth-success">
                ✓ Password reset link sent! Please check your email inbox.
              </div>
            )}
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="auth-field auth-anim-3">
                <label className="auth-label">Email Address</label>
                <input
                  className="auth-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-btn auth-anim-3" disabled={loading}>
                {loading ? "Sending reset link…" : "Send Reset Link"}
              </button>
            </form>
          </div>

          <div className="auth-footer-box auth-anim-3">
            Remember your password?&nbsp;&nbsp;
            <Link to="/login">Sign In →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
