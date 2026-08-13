import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
@keyframes auth-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.15);opacity:.85} }

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

/* Primary button */
.auth-btn {
  width:100%;padding:14px 24px;
  background:var(--blue);color:#fff;
  font-family:'Inter',sans-serif;
  font-size:15px; font-weight: 600;
  border:none;cursor:pointer; border-radius: 8px;
  transition:background .25s,transform .15s;
  margin-bottom:12px;position:relative;overflow:hidden;
}
.auth-btn:hover { background:var(--blue-hover); }
.auth-btn:active { transform:scale(.98); }
.auth-btn:disabled { opacity:.5;cursor:not-allowed; }

/* Secondary / Ghost button */
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

/* Verification Page Custom Elements */
.auth-icon-ring {
  width:72px; height:72px; border-radius:50%;
  background:var(--blue-pale);
  border:1px solid var(--blue-brd);
  display:flex; align-items:center; justify-content:center;
  margin:0 auto 24px; position:relative;
}
.auth-icon-dot {
  position:absolute; top:2px; right:2px;
  width:12px; height:12px; border-radius:50%;
  background:var(--blue);
  box-shadow:0 0 10px var(--blue);
  animation:auth-pulse 2s ease-in-out infinite;
}
.auth-email-badge {
  font-family:'DM Mono',monospace; font-size:13px; font-weight:500;
  color:var(--blue); background:var(--blue-pale);
  border:1px solid var(--blue-brd); border-radius:8px;
  padding:10px 16px; margin:14px 0 18px; word-break:break-all;
  display:inline-block; width:100%; box-sizing:border-box; text-align:center;
}
.auth-spam-hint {
  font-size:12px; color:var(--text-mute);
  text-align:center; margin-top:16px;
}
`;

export default function VerifyEmail() {
  const [searchParams]                    = useSearchParams();
  const email                             = searchParams.get("email") || "";
  const { resendVerification }            = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError]     = useState(null);
  const [cooldown, setCooldown]           = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || resendLoading || cooldown > 0) return;
    setResendLoading(true); setResendError(null); setResendSuccess(false);
    try {
      await resendVerification(email);
      setResendSuccess(true); setCooldown(60);
    } catch (err) {
      setResendError(err?.message || "Failed to resend. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-root evoa-root">
      <style>{AUTH_CSS}</style>
      <Link to="/" className="auth-home-link">← Home</Link>

      {/* Left — Video Reel */}
      <div className="auth-left">
        <VideoReel />
      </div>

      {/* Right — Panel */}
      <div className="auth-right">
        <div className="auth-panel">
          <div className="auth-anim-1">
            <div className="auth-brand">EVO<span>-A</span></div>
            <div className="auth-brand-sub">Startup · Investor · Ecosystem</div>
          </div>

          <div className="auth-box auth-anim-2" style={{ textAlign: 'center' }}>
            <div className="auth-icon-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div className="auth-icon-dot" />
            </div>

            <div className="auth-heading">Check Your Inbox</div>
            <div className="auth-subheading" style={{ marginBottom: 4 }}>We've sent a verification link to</div>

            {email && <div className="auth-email-badge">{email}</div>}

            <div className="auth-subheading" style={{ marginTop: 0, marginBottom: 24, fontSize: 13, lineHeight: '1.6' }}>
              Click the link in the email to verify your account. The link expires in 24 hours.
            </div>

            {resendSuccess && <div className="auth-success">✓ Verification email sent! Check your inbox.</div>}
            {resendError   && <div className="auth-error">{resendError}</div>}

            <button
              type="button"
              className="auth-btn"
              onClick={() => window.location.href = "mailto:"}
            >
              Open Email App
            </button>

            <button
              type="button"
              className="auth-google-btn"
              onClick={handleResend}
              disabled={resendLoading || cooldown > 0 || !email}
            >
              {resendLoading ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
            </button>

            <div className="auth-spam-hint">Didn't receive it? Check your spam or junk folder.</div>
          </div>

          <div className="auth-footer-box auth-anim-3">
            <Link to="/login">← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
