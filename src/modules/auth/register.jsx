import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import VideoReel from "../../components/shared/VideoReel";

/* Re-use the same auth CSS defined by login — import inline */
const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Mono:wght@300;400&display=swap');
@keyframes auth-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes auth-shake { 0%,100%{transform:translateX(0)} 15%,45%,75%{transform:translateX(-5px)} 30%,60%,90%{transform:translateX(5px)} }
.auth-root{min-height:100vh;display:flex;background:#060607;color:#F4F0E8;font-family:'Cormorant Garamond',serif;position:relative;overflow:hidden;}
.auth-left{display:none;}
@media(min-width:1024px){.auth-left{display:flex;flex-direction:column;justify-content:center;width:50%;position:relative;overflow:hidden;background:#000;}}
.auth-right{flex:1;display:flex;align-items:center;justify-content:center;padding:32px 24px;position:relative;z-index:2;}
@media(min-width:1024px){.auth-right{width:50%;flex:none;}}
.auth-panel{width:100%;max-width:400px;}
.auth-brand{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:.1em;color:#F4F0E8;margin-bottom:6px;text-align:center;}
.auth-brand span{color:#E8341A;}
.auth-brand-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(244,240,232,.35);text-align:center;margin-bottom:32px;}
.auth-box{background:#0f0f10;border:1px solid rgba(244,240,232,.08);padding:32px 28px;margin-bottom:16px;}
.auth-heading{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.06em;color:#F4F0E8;margin-bottom:6px;}
.auth-subheading{font-size:14px;font-weight:300;color:rgba(244,240,232,.45);margin-bottom:24px;}
.auth-label{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(244,240,232,.5);margin-bottom:8px;display:block;}
.auth-field{margin-bottom:18px;position:relative;}
.auth-input{width:100%;padding:13px 16px;background:rgba(244,240,232,.03);border:1px solid rgba(244,240,232,.08);color:#F4F0E8;font-family:'Cormorant Garamond',serif;font-size:16px;font-weight:300;outline:none;transition:border-color .25s,box-shadow .25s;box-sizing:border-box;}
.auth-input::placeholder{color:rgba(244,240,232,.2);font-style:italic;}
.auth-input:focus{border-color:#E8341A;box-shadow:0 0 0 3px rgba(232,52,26,.08);}
.auth-input-icon{position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:rgba(244,240,232,.35);padding:4px;transition:color .2s;}
.auth-input-icon:hover{color:#F4F0E8;}
.auth-btn{width:100%;padding:15px 24px;background:#E8341A;color:#060607;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;border:none;cursor:pointer;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));transition:background .25s,transform .15s;margin-bottom:16px;position:relative;overflow:hidden;}
.auth-btn:hover{background:#C9230F;}
.auth-btn:active{transform:scale(.98);}
.auth-btn:disabled{opacity:.5;cursor:not-allowed;}
.auth-or{display:flex;align-items:center;gap:12px;margin:0 0 16px;}
.auth-or-line{flex:1;height:1px;background:rgba(244,240,232,.07);}
.auth-or-text{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(244,240,232,.25);}
.auth-google-btn{width:100%;padding:13px 24px;background:transparent;border:1px solid rgba(244,240,232,.1);color:rgba(244,240,232,.7);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:border-color .25s,color .25s,background .25s;}
.auth-google-btn:hover{border-color:rgba(244,240,232,.25);color:#F4F0E8;background:rgba(244,240,232,.04);}
.auth-google-btn:disabled{opacity:.4;cursor:not-allowed;}
.auth-error{background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.25);color:rgba(232,52,26,.9);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;padding:12px 14px;margin-bottom:16px;animation:auth-shake .5s ease;}
.auth-footer-box{background:#0f0f10;border:1px solid rgba(244,240,232,.06);padding:16px 24px;text-align:center;font-size:14px;font-weight:300;color:rgba(244,240,232,.4);}
.auth-footer-box a{color:#E8341A;text-decoration:none;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;transition:color .2s;}
.auth-footer-box a:hover{color:#C9A84C;}
.auth-home-link{position:absolute;top:20px;right:20px;z-index:20;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,240,232,.4);text-decoration:none;border:1px solid rgba(244,240,232,.1);padding:7px 14px;transition:color .2s,border-color .2s;}
.auth-home-link:hover{color:#F4F0E8;border-color:rgba(244,240,232,.3);}
.auth-anim-1{animation:auth-fadeUp .5s ease both;}
.auth-anim-2{animation:auth-fadeUp .5s .1s ease both;}
.auth-anim-3{animation:auth-fadeUp .5s .15s ease both;}
.auth-anim-4{animation:auth-fadeUp .5s .2s ease both;}
.auth-anim-5{animation:auth-fadeUp .5s .25s ease both;}
.auth-anim-6{animation:auth-fadeUp .5s .3s ease both;}
`;

export default function Register() {
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail]                             = useState("");
  const [password, setPassword]                       = useState("");
  const [confirmPassword, setConfirmPassword]         = useState("");
  const [loading, setLoading]                         = useState(false);
  const [error, setError]                             = useState(null);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6)          { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true); setError(null);
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Failed to initiate Google signup");
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
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
              <div className="auth-field auth-anim-3">
                <label className="auth-label">Email</label>
                <input className="auth-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required disabled={loading} />
              </div>

              <div className="auth-field auth-anim-4">
                <label className="auth-label">Password</label>
                <input className="auth-input" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required disabled={loading} style={{paddingRight:48}} />
                <button type="button" className="auth-input-icon" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>

              <div className="auth-field auth-anim-5">
                <label className="auth-label">Confirm Password</label>
                <input className="auth-input" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required disabled={loading} style={{paddingRight:48}} />
                <button type="button" className="auth-input-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                  {showConfirmPassword ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>

              <button type="submit" className="auth-btn auth-anim-6" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <div className="auth-or">
              <div className="auth-or-line"/><span className="auth-or-text">or</span><div className="auth-or-line"/>
            </div>

            <button type="button" className="auth-google-btn" onClick={handleGoogle} disabled={loading}>
              <FaGoogle size={14}/>
              {loading ? 'Authenticating…' : 'Continue with Google'}
            </button>
          </div>

          <div className="auth-footer-box auth-anim-6">
            Already have an account?&nbsp;&nbsp;
            <Link to="/login">Sign In →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
