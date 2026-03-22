import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400&family=DM+Mono:wght@300;400&display=swap');
@keyframes auth-fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes auth-ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2);opacity:0}}
.auth-root{min-height:100vh;display:flex;background:#060607;color:#F4F0E8;font-family:'Cormorant Garamond',serif;}
.auth-right{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 24px;}
.auth-panel{width:100%;max-width:400px;}
.auth-brand{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:.1em;color:#F4F0E8;margin-bottom:6px;text-align:center;}
.auth-brand span{color:#E8341A;}
.auth-brand-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(244,240,232,.35);text-align:center;margin-bottom:32px;}
.auth-box{background:#0f0f10;border:1px solid rgba(244,240,232,.08);padding:36px 28px;margin-bottom:16px;text-align:center;}
.auth-heading{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.06em;color:#F4F0E8;margin-bottom:6px;}
.auth-subheading{font-size:14px;font-weight:300;color:rgba(244,240,232,.45);margin-bottom:24px;line-height:1.7;}
.auth-otp-row{display:flex;gap:12px;justify-content:center;margin-bottom:28px;}
.auth-otp-input{
  width:56px;height:64px;text-align:center;
  font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:.05em;
  background:rgba(244,240,232,.03);border:1px solid rgba(244,240,232,.1);
  color:#F4F0E8;outline:none;transition:border-color .25s,box-shadow .25s;
}
.auth-otp-input:focus{border-color:#E8341A;box-shadow:0 0 0 3px rgba(232,52,26,.1);}
.auth-otp-input.filled{border-color:rgba(232,52,26,.4);}
.auth-btn{width:100%;padding:15px 24px;background:#E8341A;color:#060607;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;border:none;cursor:pointer;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));transition:background .25s,transform .15s;margin-bottom:0;}
.auth-btn:hover{background:#C9230F;}
.auth-btn:active{transform:scale(.98);}
.auth-footer-box{background:#0f0f10;border:1px solid rgba(244,240,232,.06);padding:16px 24px;text-align:center;font-size:14px;font-weight:300;color:rgba(244,240,232,.4);}
.auth-footer-box a,.auth-footer-box button{color:#E8341A;text-decoration:none;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;transition:color .2s;background:none;border:none;cursor:pointer;padding:0;}
.auth-footer-box a:hover,.auth-footer-box button:hover{color:#C9A84C;}
.auth-home-link{position:absolute;top:20px;right:20px;z-index:20;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:rgba(244,240,232,.4);text-decoration:none;border:1px solid rgba(244,240,232,.1);padding:7px 14px;transition:color .2s,border-color .2s;}
.auth-home-link:hover{color:#F4F0E8;border-color:rgba(244,240,232,.3);}
.auth-anim-1{animation:auth-fadeUp .5s ease both;}
.auth-anim-2{animation:auth-fadeUp .5s .1s ease both;}
.auth-anim-3{animation:auth-fadeUp .5s .2s ease both;}

.otp-icon-ring{
  width:72px;height:72px;border-radius:50%;
  background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.2);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 20px;position:relative;
}
.otp-icon-dot{
  position:absolute;top:0;right:0;
  width:12px;height:12px;border-radius:50%;background:#E8341A;
  animation:auth-ping 2s ease-in-out infinite;
}
`;

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const navigate = useNavigate();

  const handleVerify = () => navigate("/create-new-password");

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs[index - 1].current?.focus();
  };

  const handlePaste = e => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").slice(0, 4);
    const newOtp = [...otp];
    for (let i = 0; i < data.length && i < 4; i++) newOtp[i] = data[i];
    setOtp(newOtp);
  };

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
            <div className="otp-icon-ring">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8341A" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <div className="otp-icon-dot" />
            </div>

            <div className="auth-heading">Verify OTP Code</div>
            <div className="auth-subheading">We've sent a 4-digit code to your email address</div>

            <div className="auth-otp-row">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  className={`auth-otp-input${digit ? " filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            <button type="button" className="auth-btn" onClick={handleVerify}>
              Verify Code
            </button>
          </div>

          <div className="auth-footer-box auth-anim-3">
            Didn't receive code?&nbsp;&nbsp;
            <button type="button">Resend OTP</button>
            &nbsp;·&nbsp;
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
