import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AUTH_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400&family=DM+Mono:wght@300;400&display=swap');
@keyframes auth-fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes auth-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.08);opacity:.85}}
@keyframes auth-ping{0%{transform:scale(1);opacity:1}75%,100%{transform:scale(2.2);opacity:0}}
.auth-root{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#060607;color:#F4F0E8;font-family:'Cormorant Garamond',serif;position:relative;overflow:hidden;padding:40px 24px;}
.auth-bg-blob{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;}
.auth-panel{width:100%;max-width:420px;position:relative;z-index:2;}
.auth-brand{font-family:'Bebas Neue',sans-serif;font-size:32px;letter-spacing:.1em;color:#F4F0E8;margin-bottom:6px;text-align:center;}
.auth-brand span{color:#E8341A;}
.auth-brand-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(244,240,232,.35);text-align:center;margin-bottom:32px;}
.auth-box{background:#0f0f10;border:1px solid rgba(244,240,232,.08);padding:36px 28px;margin-bottom:16px;text-align:center;}
.auth-icon-ring{width:80px;height:80px;border-radius:50%;background:rgba(232,52,26,.07);border:1px solid rgba(232,52,26,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;position:relative;animation:auth-pulse 2.5s ease-in-out infinite;}
.auth-icon-dot{position:absolute;top:4px;right:4px;width:12px;height:12px;border-radius:50%;background:#E8341A;animation:auth-ping 2s ease-in-out infinite;}
.auth-heading{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:.06em;color:#F4F0E8;margin-bottom:8px;}
.auth-subheading{font-size:14px;font-weight:300;color:rgba(244,240,232,.45);margin-bottom:8px;line-height:1.7;}
.auth-email-highlight{font-family:'DM Mono',monospace;font-size:12px;color:#E8341A;margin-bottom:16px;word-break:break-all;}
.auth-success{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);color:rgba(134,239,172,.9);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;padding:12px 14px;margin-bottom:16px;}
.auth-error{background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.25);color:rgba(232,52,26,.9);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;padding:12px 14px;margin-bottom:16px;}
.auth-btn{width:100%;padding:15px 24px;background:#E8341A;color:#060607;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;border:none;cursor:pointer;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));transition:background .25s,transform .15s;margin-bottom:12px;}
.auth-btn:hover{background:#C9230F;}
.auth-btn:active{transform:scale(.98);}
.auth-btn-ghost{width:100%;padding:13px 24px;background:transparent;border:1px solid rgba(244,240,232,.1);color:rgba(244,240,232,.6);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:border-color .25s,color .25s;}
.auth-btn-ghost:hover{border-color:rgba(244,240,232,.25);color:#F4F0E8;}
.auth-btn-ghost:disabled{opacity:.4;cursor:not-allowed;}
.auth-spam{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;color:rgba(244,240,232,.2);margin-top:14px;}
.auth-footer-box{background:#0f0f10;border:1px solid rgba(244,240,232,.06);padding:14px 24px;text-align:center;}
.auth-footer-box a{color:rgba(244,240,232,.4);text-decoration:none;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;transition:color .2s;}
.auth-footer-box a:hover{color:#E8341A;}
.auth-anim-1{animation:auth-fadeUp .5s ease both;}
.auth-anim-2{animation:auth-fadeUp .5s .1s ease both;}
.auth-anim-3{animation:auth-fadeUp .5s .2s ease both;}
`;

export default function VerifyEmail() {
  const [searchParams]                              = useSearchParams();
  const email                                       = searchParams.get("email") || "";
  const { resendVerification }                      = useAuth();
  const [resendLoading, setResendLoading]           = useState(false);
  const [resendSuccess, setResendSuccess]           = useState(false);
  const [resendError, setResendError]               = useState(null);
  const [cooldown, setCooldown]                     = useState(0);

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
    <div className="auth-root">
      <style>{AUTH_CSS}</style>
      <div className="auth-bg-blob" style={{width:360,height:360,top:"-10%",right:"-5%",background:"rgba(232,52,26,.07)"}} />
      <div className="auth-bg-blob" style={{width:280,height:280,bottom:"5%",left:"-5%",background:"rgba(201,168,76,.05)"}} />

      <div className="auth-panel">
        <div className="auth-anim-1">
          <div className="auth-brand">EVO<span>-A</span></div>
          <div className="auth-brand-sub">Startup · Investor · Ecosystem</div>
        </div>

        <div className="auth-box auth-anim-2">
          <div className="auth-icon-ring">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#E8341A" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <div className="auth-icon-dot" />
          </div>

          <div className="auth-heading">Check Your Inbox</div>
          <div className="auth-subheading">We've sent a verification link to</div>
          {email && <div className="auth-email-highlight">{email}</div>}
          <div className="auth-subheading">Click the link in the email to verify your account. The link expires in 24 hours.</div>

          {resendSuccess && <div className="auth-success">✓ Verification email sent! Check your inbox.</div>}
          {resendError   && <div className="auth-error">{resendError}</div>}

          <button className="auth-btn" onClick={() => window.location.href = "mailto:"}>
            Open Email App
          </button>

          <button
            className="auth-btn-ghost"
            onClick={handleResend}
            disabled={resendLoading || cooldown > 0 || !email}
          >
            {resendLoading ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
          </button>

          <div className="auth-spam">Didn't receive it? Check your spam or junk folder.</div>
        </div>

        <div className="auth-footer-box auth-anim-3">
          <Link to="/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
