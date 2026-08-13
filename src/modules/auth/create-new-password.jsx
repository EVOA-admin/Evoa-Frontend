import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "../../config/supabase";
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

export default function CreateNewPassword() {
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]         = useState(false);
  const [checking, setChecking]       = useState(true);
  const [error, setError]             = useState(null);
  const [success, setSuccess]         = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const navigate                      = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      const searchParams = new URLSearchParams(search);

      // Check URL parameters for explicit errors (e.g. expired link)
      if (hash.includes("error=") || search.includes("error=") || hash.includes("error_description=")) {
        if (!isMounted) return;
        setInvalidToken(true);
        setError("This password reset link is invalid or has expired. Please request a new reset link.");
        setChecking(false);
        return;
      }

      // Handle PKCE code in query if present
      const code = searchParams.get("code");
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch (e) {
          console.warn("PKCE code exchange error:", e?.message || e);
        }
      }

      // Check for active session
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (data?.session) {
        setInvalidToken(false);
        setChecking(false);
      } else {
        // Allow a brief moment for hash token parsing
        setTimeout(async () => {
          if (!isMounted) return;
          const { data: retryData } = await supabase.auth.getSession();
          if (retryData?.session) {
            setInvalidToken(false);
          } else {
            // Only flag invalid if there's no hash or code at all
            if (!hash.includes("access_token") && !code) {
              setInvalidToken(true);
              setError("No active password reset session found. The link may have expired or already been used.");
            }
          }
          setChecking(false);
        }, 1200);
      }
    };

    verifySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setInvalidToken(false);
        setChecking(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || invalidToken) return;

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.");
      return;
    }

    setLoading(true); setError(null); setSuccess(false);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });

      if (updateErr) {
        const msg = updateErr.message?.toLowerCase() || "";
        if (msg.includes("same as") || msg.includes("different") || msg.includes("expired") || msg.includes("session") || msg.includes("invalid") || msg.includes("token")) {
          setInvalidToken(true);
          setError("This reset link is expired or invalid. Please request a new password reset link.");
        } else {
          setError(updateErr.message || "Failed to update password. Please try again.");
        }
        return;
      }

      setSuccess(true);
      // Revoke temporary recovery session and redirect to normal login
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (_) { /* ignore */ }
        navigate("/login", { replace: true, state: { message: "Password updated successfully. Please log in with your new password." } });
      }, 1800);
    } catch (err) {
      setError(err?.message || "Failed to update password. Please try again.");
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
            <div className="auth-heading">Create New Password</div>
            <div className="auth-subheading">Choose a new, secure password for your account.</div>

            {success && (
              <div className="auth-success">
                ✓ Password updated successfully! Redirecting to login…
              </div>
            )}
            {error && <div className="auth-error">{error}</div>}

            {checking ? (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ width: 32, height: 32, border: "3px solid #2563EB", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 12px auto", animation: "auth-pulse 1s linear infinite" }} />
                <p style={{ fontSize: 13, color: "var(--text-sub)", margin: 0 }}>Verifying reset token…</p>
              </div>
            ) : invalidToken ? (
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Link to="/forget-password" className="auth-btn" style={{ display: "inline-block", textDecoration: "none", boxSizing: "border-box" }}>
                  Request New Reset Link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="auth-field auth-anim-3">
                  <label className="auth-label">New Password</label>
                  <input
                    className="auth-input"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    disabled={loading || success}
                    style={{ paddingRight: 48 }}
                  />
                  <button type="button" className="auth-input-icon" onClick={() => setShowNew(!showNew)} tabIndex={-1}>
                    {showNew ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                  </button>
                </div>

                <div className="auth-field auth-anim-3">
                  <label className="auth-label">Confirm New Password</label>
                  <input
                    className="auth-input"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    disabled={loading || success}
                    style={{ paddingRight: 48 }}
                  />
                  <button type="button" className="auth-input-icon" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                    {showConfirm ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                  </button>
                </div>

                <button type="submit" className="auth-btn auth-anim-3" disabled={loading || success}>
                  {loading ? "Updating password…" : "Update Password"}
                </button>
              </form>
            )}
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
