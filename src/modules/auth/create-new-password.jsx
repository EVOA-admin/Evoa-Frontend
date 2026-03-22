import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400&family=DM+Mono:wght@300;400&display=swap');
@keyframes auth-fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.auth-root{min-height:100vh;display:flex;background:#060607;color:#F4F0E8;font-family:'Cormorant Garamond',serif;}
.auth-right{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px;}
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
.auth-btn{width:100%;padding:15px 24px;background:#E8341A;color:#060607;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;border:none;cursor:pointer;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));transition:background .25s,transform .15s;margin-bottom:0;}
.auth-btn:hover{background:#C9230F;}
.auth-btn:active{transform:scale(.98);}
.auth-footer-box{background:#0f0f10;border:1px solid rgba(244,240,232,.06);padding:16px 24px;text-align:center;font-size:14px;font-weight:300;color:rgba(244,240,232,.4);}
.auth-footer-box a{color:#E8341A;text-decoration:none;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;transition:color .2s;}
.auth-footer-box a:hover{color:#C9A84C;}
.auth-home-link{position:absolute;top:20px;right:20px;z-index:20;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,240,232,.4);text-decoration:none;border:1px solid rgba(244,240,232,.1);padding:7px 14px;transition:color .2s,border-color .2s;}
.auth-home-link:hover{color:#F4F0E8;border-color:rgba(244,240,232,.3);}
.auth-anim-1{animation:auth-fadeUp .5s ease both;}
.auth-anim-2{animation:auth-fadeUp .5s .1s ease both;}
.auth-anim-3{animation:auth-fadeUp .5s .2s ease both;}
`;

export default function CreateNewPassword() {
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = () => navigate("/login");

  return (
    <div className="auth-root" style={{ position: "relative" }}>
      <style>{AUTH_CSS}</style>
      <Link to="/" className="auth-home-link">← Home</Link>

      <div className="auth-right">
        <div className="auth-panel">
          <div className="auth-anim-1">
            <div className="auth-brand">EVO<span>-A</span></div>
            <div className="auth-brand-sub">Startup · Investor · Ecosystem</div>
          </div>

          <div className="auth-box auth-anim-2">
            <div className="auth-heading">Create New Password</div>
            <div className="auth-subheading">Enter a strong password to secure your account</div>

            <div className="auth-field">
              <label className="auth-label">New Password</label>
              <input className="auth-input" type={showNew ? "text" : "password"} placeholder="Min 6 characters" style={{paddingRight:48}} />
              <button type="button" className="auth-input-icon" onClick={() => setShowNew(!showNew)} tabIndex={-1}>
                {showNew ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
              </button>
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <input className="auth-input" type={showConfirm ? "text" : "password"} placeholder="Repeat password" style={{paddingRight:48}} />
              <button type="button" className="auth-input-icon" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                {showConfirm ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
              </button>
            </div>

            <button type="button" className="auth-btn" onClick={handleUpdate}>
              Update Password
            </button>
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
