import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheck, FiX, FiChevronDown } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import VideoReel from "../../components/shared/VideoReel";
import { validateReferralCode } from "../../services/ambassadorService";

/* ── Auth/Register CSS ── */
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
@keyframes auth-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes auth-shake { 0%,100%{transform:translateX(0)} 15%,45%,75%{transform:translateX(-5px)} 30%,60%,90%{transform:translateX(5px)} }
@keyframes ref-spin    { to{transform:rotate(360deg)} }

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
`;

/* ── Referral code status indicator ── */
function RefStatusIcon({ status }) {
  if (status === 'checking') {
    return (
      <div style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: '#C9A84C', borderRadius: '50%', animation: 'ref-spin .7s linear infinite' }} />
    );
  }
  if (status === 'valid') return <FiCheck size={15} color="#00BFA5" strokeWidth={2.5} />;
  if (status === 'invalid') return <FiX size={15} color="var(--red, #ef4444)" strokeWidth={2.5} />;
  return null;
}

export default function Register() {
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail]                             = useState('');
  const [password, setPassword]                       = useState('');
  const [confirmPassword, setConfirmPassword]         = useState('');
  const [loading, setLoading]                         = useState(false);
  const [error, setError]                             = useState(null);

  // Referral code state
  const [refOpen, setRefOpen]       = useState(false);
  const [refCode, setRefCode]       = useState('');
  const [refStatus, setRefStatus]   = useState('idle'); // 'idle' | 'checking' | 'valid' | 'invalid'
  const [refErrMsg, setRefErrMsg]   = useState('');
  const debounceRef                 = useRef(null);

  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const normalizedReferralCode = refCode.trim().toUpperCase();

  // Pre-fill referral code from URL: /register?ref=XXXXXX
  useEffect(() => {
    const urlRef = searchParams.get('ref');
    if (urlRef) { setRefCode(urlRef.toUpperCase()); setRefOpen(true); }
  }, []);

  // Debounced referral code validation
  useEffect(() => {
    const code = refCode.trim().toUpperCase();
    if (!refOpen || !code) { setRefStatus('idle'); setRefErrMsg(''); return; }
    if (code.length !== 16) {
      setRefStatus(code.length > 0 ? 'invalid' : 'idle');
      setRefErrMsg(code.length > 0 ? 'Code must be 16 characters' : '');
      return;
    }
    // 16 chars — validate with debounce
    setRefStatus('checking');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await validateReferralCode(code);
        const validation = res?.data?.data || res?.data || {};
        if (validation.valid) {
          setRefStatus('valid');
          setRefErrMsg('');
        } else {
          setRefStatus('invalid');
          setRefErrMsg('Invalid referral code');
        }
      } catch {
        setRefStatus('invalid');
        setRefErrMsg('Could not validate code. Try again.');
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [refCode, refOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6)          { setError('Password must be at least 6 characters'); return; }
    // Reject if code was entered but is invalid
    if (refOpen && refCode.trim() && refStatus !== 'valid') {
      setError('Please enter a valid referral code or leave the field empty');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(
        email,
        password,
        refOpen && normalizedReferralCode && refStatus === 'valid'
          ? { referralCode: normalizedReferralCode }
          : {}
      );
      if (error) throw error;

      // Persist valid referral code for auth-callback to apply
      if (refOpen && normalizedReferralCode && refStatus === 'valid') {
        sessionStorage.setItem('evoa_referral_code', normalizedReferralCode);
      }

      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true); setError(null);
      // Store referral code before OAuth redirect (sessionStorage survives same-tab redirect)
      if (refOpen && normalizedReferralCode && refStatus === 'valid') {
        sessionStorage.setItem('evoa_referral_code', normalizedReferralCode);
      }
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Failed to initiate Google signup');
      setLoading(false);
    }
  };

  // Input class for referral code
  const refInputClass = ['auth-input',
    refStatus === 'valid'   ? 'valid'   : '',
    refStatus === 'invalid' ? 'invalid' : '',
  ].join(' ').trim();

  return (
    <div className="auth-root evoa-root">
      <style>{AUTH_CSS}</style>
      <Link to="/" className="auth-home-link">← Home</Link>

      {/* Left — Video Reel */}
      <div className="auth-left">
        <VideoReel />
      </div>

      {/* Right — Form */}
      <div className="auth-right">
        <div className="auth-panel">
          <div className="auth-anim-1">
            <div className="auth-brand">EVO<span>-A</span></div>
            <div className="auth-brand-sub">Startup · Investor · Ecosystem</div>
          </div>

          <div className="auth-box auth-anim-2">
            <div className="auth-heading">Create Account</div>
            <div className="auth-subheading">Join us and start your journey today</div>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="auth-field auth-anim-3">
                <label className="auth-label">Email</label>
                <input
                  className="auth-input" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="auth-field auth-anim-4">
                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" required disabled={loading}
                  style={{ paddingRight: 48 }}
                />
                <button type="button" className="auth-input-icon" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="auth-field auth-anim-5">
                <label className="auth-label">Confirm Password</label>
                <input
                  className="auth-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password" required disabled={loading}
                  style={{ paddingRight: 48 }}
                />
                <button type="button" className="auth-input-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                  {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>

              {/* ── Referral Code (optional, collapsible) ── */}
              <div className="auth-anim-6">
                <button
                  type="button"
                  className={`ref-toggle${refOpen ? ' open' : ''}`}
                  onClick={() => { setRefOpen(o => !o); if (refOpen) { setRefCode(''); setRefStatus('idle'); } }}
                  id="ref-toggle-btn"
                >
                  <FiChevronDown size={11} />
                  {refOpen ? 'Hide Referral Code' : 'Have a Referral Code?'}
                </button>

                <div className={`ref-field-wrap${refOpen ? ' open' : ''}`}>
                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">Referral Code <span style={{ color: 'var(--text-mute)' }}>(optional)</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className={refInputClass}
                        type="text"
                        id="referral-code-input"
                        value={refCode}
                        onChange={e => setRefCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16))}
                        placeholder="E.g. ADITYA7X3KR9PQMN"
                        disabled={loading}
                        style={{ paddingRight: 40, letterSpacing: '.1em', fontFamily: "'DM Mono',monospace", fontSize: 13 }}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <span className="ref-status">
                        <RefStatusIcon status={refStatus} />
                      </span>
                    </div>
                    {refStatus === 'valid' && (
                      <div className="ref-hint" style={{ color: 'var(--blue)' }}>✓ Valid referral code</div>
                    )}
                    {refStatus === 'invalid' && refErrMsg && (
                      <div className="ref-hint" style={{ color: 'var(--red)' }}>{refErrMsg}</div>
                    )}
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-btn auth-anim-7" disabled={loading} style={{ marginTop: 20 }}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <div className="auth-or">
              <div className="auth-or-line" /><span className="auth-or-text">or</span><div className="auth-or-line" />
            </div>

            <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
              <FaGoogle size={14} />
              {loading ? 'Authenticating…' : 'Continue with Google'}
            </button>
          </div>

          <div className="auth-footer-box auth-anim-7">
            Already have an account?&nbsp;&nbsp;
            <Link to="/login">Sign In →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
