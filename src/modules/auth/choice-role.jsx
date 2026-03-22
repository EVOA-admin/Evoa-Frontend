import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoRocketSharp,
  IoTrendingUp,
  IoBusinessSharp,
  IoGlasses,
  IoCheckmarkCircle,
  IoLogOutOutline,
} from "react-icons/io5";
import { useAuth } from "../../contexts/AuthContext";

/* ─── Dashboards / routes ─── */
const DASHBOARDS = { startup:'/startup', investor:'/investor', incubator:'/incubator', viewer:'/viewer' };
const ROUTES     = { startup:'/register/startup', investor:'/register/investor', incubator:'/register/incubator', viewer:'/viewer' };

/* ─── Role definitions ─── */
const roles = [
  { id:'startup',   name:'Startup',   Icon:IoRocketSharp,   tag:'FOUNDER',   desc:'Launch your innovative ideas and connect with investors', features:['Pitch your startup','Connect with investors','Raise funding'] },
  { id:'investor',  name:'Investor',  Icon:IoTrendingUp,    tag:'BACKER',    desc:'Discover and invest in the most promising startups',       features:['Discover startups','Make investments','Track portfolio'] },
  { id:'incubator', name:'Incubator', Icon:IoBusinessSharp, tag:'MENTOR',    desc:'Nurture and support startups in your program',             features:['Manage programs','Support startups','Build network'] },
  { id:'viewer',    name:'Viewer',    Icon:IoGlasses,       tag:'EXPLORER',  desc:'Explore the ecosystem and discover opportunities',          features:['Explore startups','Learn from pitches','Stay updated'] },
];

const ROLE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Mono:wght@300;400&display=swap');
@keyframes cr-fadeUp  { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes cr-pulse   { 0%,100%{box-shadow:0 0 0 0 rgba(232,52,26,.3)} 50%{box-shadow:0 0 0 8px rgba(232,52,26,0)} }

.cr-root {
  min-height:100vh;
  background:#060607;
  color:#F4F0E8;
  font-family:'Cormorant Garamond',serif;
  display:flex;flex-direction:column;align-items:center;
  justify-content:flex-start;
  padding:48px 20px 60px;
  position:relative;overflow:hidden;
}
/* bg grid */
.cr-root::before {
  content:'';position:fixed;inset:0;pointer-events:none;
  background-image:
    linear-gradient(rgba(244,240,232,.03) 1px,transparent 1px),
    linear-gradient(90deg,rgba(244,240,232,.03) 1px,transparent 1px);
  background-size:60px 60px;
}
/* ghost watermark */
.cr-root::after {
  content:'EVOA';
  position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
  font-family:'Bebas Neue',sans-serif;font-size:clamp(160px,25vw,320px);
  color:rgba(244,240,232,.015);letter-spacing:.1em;pointer-events:none;
  z-index:0;white-space:nowrap;
}

.cr-header { text-align:center;margin-bottom:48px;position:relative;z-index:1; animation:cr-fadeUp .5s ease both; }
.cr-brand   { font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:.1em;color:#F4F0E8;margin-bottom:4px; }
.cr-brand span { color:#E8341A; }
.cr-brand-tag { font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.22em;text-transform:uppercase;color:rgba(244,240,232,.3);margin-bottom:20px; }
.cr-title { font-family:'Bebas Neue',sans-serif;font-size:clamp(28px,4vw,42px);letter-spacing:.06em;color:#F4F0E8;margin-bottom:8px; }
.cr-subtitle { font-size:16px;font-weight:300;color:rgba(244,240,232,.45);font-style:italic; }

/* Role grid */
.cr-grid {
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:16px;
  width:100%;max-width:840px;
  position:relative;z-index:1;
  margin-bottom:36px;
  animation:cr-fadeUp .5s .1s ease both;
}
@media(min-width:768px){ .cr-grid{grid-template-columns:repeat(4,1fr);gap:20px;} }

.cr-card {
  background:#0f0f10;
  border:1px solid rgba(244,240,232,.07);
  padding:24px 16px;
  cursor:pointer;
  transition:border-color .25s,background .25s,transform .18s;
  position:relative;
  display:flex;flex-direction:column;align-items:center;text-align:center;
  -webkit-tap-highlight-color:transparent;
}
.cr-card:hover { border-color:rgba(232,52,26,.25);background:#111; }
.cr-card.selected {
  border-color:#E8341A;background:rgba(232,52,26,.06);
}
.cr-card.selected::before {
  content:'';position:absolute;inset:0;
  background:linear-gradient(135deg,rgba(232,52,26,.04),transparent);
  pointer-events:none;
}

.cr-card-check {
  position:absolute;top:10px;right:10px;
  color:#E8341A;
}
.cr-card-icon-wrap {
  width:56px;height:56px;
  background:rgba(244,240,232,.04);
  border:1px solid rgba(244,240,232,.07);
  display:flex;align-items:center;justify-content:center;
  margin-bottom:14px;
  transition:border-color .25s,background .25s;
}
.cr-card.selected .cr-card-icon-wrap {
  background:rgba(232,52,26,.08);border-color:rgba(232,52,26,.3);
  animation:cr-pulse 1.5s ease-in-out infinite;
}
.cr-card-tag {
  font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.2em;text-transform:uppercase;
  color:rgba(244,240,232,.3);margin-bottom:6px;
}
.cr-card.selected .cr-card-tag { color:#E8341A; }
.cr-card-name {
  font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:.06em;
  color:#F4F0E8;margin-bottom:8px;
}
.cr-card-desc {
  font-size:13px;font-weight:300;color:rgba(244,240,232,.4);
  line-height:1.6;margin-bottom:14px;
}
.cr-card-divider {
  width:100%;height:1px;background:rgba(244,240,232,.06);margin-bottom:12px;
}
.cr-card.selected .cr-card-divider { background:rgba(232,52,26,.15); }
.cr-card-features { list-style:none;padding:0;margin:0;width:100%; }
.cr-card-features li {
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;
  color:rgba(244,240,232,.3);padding:3px 0;
  display:flex;align-items:center;gap:6px;justify-content:center;
}
.cr-card.selected .cr-card-features li { color:rgba(244,240,232,.6); }
.cr-card-features li::before { content:'·';color:#E8341A;font-size:14px; }

/* Error */
.cr-error {
  background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.2);
  color:rgba(232,52,26,.9);font-family:'DM Mono',monospace;
  font-size:10px;letter-spacing:.06em;padding:12px 16px;
  margin-bottom:20px;width:100%;max-width:840px;
  position:relative;z-index:1;
}

/* Continue button */
.cr-cta-wrap { position:relative;z-index:1;width:100%;max-width:360px;text-align:center; animation:cr-fadeUp .5s .2s ease both;}
.cr-cta {
  width:100%;padding:17px 32px;
  font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;
  border:none;cursor:pointer;
  clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));
  transition:background .25s,transform .15s;
}
.cr-cta.enabled  { background:#E8341A;color:#060607; }
.cr-cta.enabled:hover { background:#C9230F; }
.cr-cta.enabled:active { transform:scale(.97); }
.cr-cta.disabled { background:rgba(244,240,232,.06);color:rgba(244,240,232,.2);cursor:not-allowed; }
.cr-cta-hint {
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;
  color:rgba(244,240,232,.2);margin-top:14px;text-transform:uppercase;
}

/* Logout */
.cr-logout {
  position:absolute;top:20px;right:20px;z-index:10;
  display:flex;align-items:center;gap:6px;
  font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(244,240,232,.35);
  border:1px solid rgba(244,240,232,.08);
  padding:7px 14px;background:none;cursor:pointer;
  transition:color .2s,border-color .2s;
}
.cr-logout:hover { color:#E8341A;border-color:rgba(232,52,26,.3); }
`;

export default function ChoiceRole() {
  const [selectedRole, setSelectedRole]   = useState(null);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [error, setError]                 = useState('');
  const navigate = useNavigate();
  const { updateUserRole, userRole, loading, roleSelected, registrationCompleted, syncing, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !syncing && roleSelected && registrationCompleted && userRole) {
      navigate(DASHBOARDS[userRole] || '/viewer', { replace: true });
    }
  }, [roleSelected, registrationCompleted, userRole, loading, syncing, navigate]);

  const handleContinue = async () => {
    if (!selectedRole || isSubmitting) return;
    setIsSubmitting(true); setError('');
    try {
      await updateUserRole(selectedRole);
      navigate(ROUTES[selectedRole] || '/');
    } catch (err) {
      const status = err?.status;
      const msg    = Array.isArray(err?.data?.message) ? err.data.message.join('. ') : err?.data?.message || err?.message || '';
      if (status === 400)          setError('Invalid role selected. Please try again.');
      else if (status === 401)     { setError('Session expired. Please log in again.'); setTimeout(() => navigate('/login'), 2000); }
      else if (msg)                setError(msg);
      else                         setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cr-root">
      <style>{ROLE_CSS}</style>

      <button className="cr-logout" onClick={async () => { await signOut(); navigate('/'); }}>
        <IoLogOutOutline size={12}/> Log out
      </button>

      <div className="cr-header">
        <div className="cr-brand">EVO<span>-A</span></div>
        <div className="cr-brand-tag">Startup · Investor · Ecosystem</div>
        <div className="cr-title">Choose Your Role</div>
        <div className="cr-subtitle">Select the role that best describes you</div>
      </div>

      <div className="cr-grid">
        {roles.map(({ id, name, Icon, tag, desc, features }) => {
          const selected = selectedRole === id;
          return (
            <button
              key={id}
              className={`cr-card${selected ? " selected" : ""}`}
              onClick={() => { setSelectedRole(id); setError(''); }}
            >
              {selected && <IoCheckmarkCircle size={18} className="cr-card-check" />}
              <div className="cr-card-icon-wrap">
                <Icon size={26} color={selected ? "#E8341A" : "rgba(244,240,232,.55)"} />
              </div>
              <div className="cr-card-tag">{tag}</div>
              <div className="cr-card-name">{name}</div>
              <div className="cr-card-desc">{desc}</div>
              <div className="cr-card-divider" />
              <ul className="cr-card-features">
                {features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </button>
          );
        })}
      </div>

      {error && <div className="cr-error">{error}</div>}

      <div className="cr-cta-wrap">
        <button
          className={`cr-cta ${selectedRole && !isSubmitting ? "enabled" : "disabled"}`}
          onClick={handleContinue}
          disabled={!selectedRole || isSubmitting}
        >
          {isSubmitting ? 'Saving Role…' : 'Continue to Registration'}
        </button>
        <div className="cr-cta-hint">You can change your role anytime in settings</div>
      </div>
    </div>
  );
}
