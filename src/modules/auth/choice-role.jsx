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
const DASHBOARDS = { startup: '/startup', investor: '/investor', incubator: '/incubator', viewer: '/viewer' };
const ROUTES = { startup: '/register/startup?mode=quick', investor: '/register/investor', incubator: '/register/incubator', viewer: '/viewer' };

/* ─── Role definitions ─── */
const roles = [
  { id: 'startup', name: 'Startup', Icon: IoRocketSharp, tag: 'FOUNDER', desc: 'Launch your innovative ideas and connect with investors', features: ['Pitch your startup', 'Connect with investors', 'Raise funding'] },
  { id: 'investor', name: 'Investor', Icon: IoTrendingUp, tag: 'BACKER', desc: 'Discover and invest in the most promising startups', features: ['Discover startups', 'Make investments', 'Track portfolio'] },
  { id: 'incubator', name: 'Incubator', Icon: IoBusinessSharp, tag: 'MENTOR', desc: 'Nurture and support startups in your program', features: ['Manage programs', 'Support startups', 'Build network'] },
  { id: 'viewer', name: 'Viewer', Icon: IoGlasses, tag: 'EXPLORER', desc: 'Explore the ecosystem and discover opportunities', features: ['Explore startups', 'Learn from pitches', 'Stay updated'] },
];

const ROLE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@300;400&display=swap');

/* ── Animations ── */
@keyframes cr-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes cr-glow   { 0%,100%{box-shadow:0 0 0 0 rgba(21,101,192,.25)} 50%{box-shadow:0 0 0 8px rgba(21,101,192,0)} }

/* ── Root ── */
.cr-root {
  min-height:100vh; min-height:100dvh;
  background:#F8FAFC;
  color:#0F172A;
  font-family:'Inter',sans-serif;
  display:flex; flex-direction:column; align-items:center;
  justify-content:flex-start;
  padding:52px 20px 64px;
  position:relative; overflow:hidden;
}
/* dot-grid background */
.cr-root::before {
  content:''; position:fixed; inset:0; pointer-events:none;
  background-image:radial-gradient(circle,#CBD5E1 1px,transparent 1px);
  background-size:28px 28px; opacity:.55;
}
/* ghost watermark */
.cr-root::after {
  content:'EVOA';
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  font-family:'Inter',sans-serif; font-size:clamp(140px,22vw,300px);
  font-weight:800; letter-spacing:-.04em;
  color:rgba(21,101,192,.035);
  pointer-events:none; z-index:0; white-space:nowrap;
}

/* ── Header ── */
.cr-header { text-align:center; margin-bottom:44px; position:relative; z-index:1; animation:cr-fadeUp .5s ease both; }
.cr-brand {
  font-family:'Inter',sans-serif; font-size:30px; font-weight:800;
  letter-spacing:-.03em; color:#0F172A; margin-bottom:4px;
}
.cr-brand span { color:#1565C0; }
.cr-brand-tag {
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.22em;
  text-transform:uppercase; color:#94A3B8; margin-bottom:20px;
}
.cr-title {
  font-family:'Inter',sans-serif; font-size:clamp(26px,4vw,40px);
  font-weight:800; letter-spacing:-.025em; color:#0F172A; margin-bottom:8px;
}
.cr-subtitle { font-size:16px; font-weight:400; color:#64748B; line-height:1.6; }

/* ── Role grid ── */
.cr-grid {
  display:grid; grid-template-columns:repeat(2,1fr);
  gap:14px; width:100%; max-width:860px;
  position:relative; z-index:1; margin-bottom:36px;
  animation:cr-fadeUp .5s .1s ease both;
}
@media(min-width:768px){ .cr-grid{grid-template-columns:repeat(4,1fr);gap:20px;} }

.cr-card {
  background:#FFFFFF;
  border:1.5px solid #E2E8F0;
  border-radius:14px;
  padding:24px 16px;
  cursor:pointer;
  transition:border-color .22s,background .22s,transform .18s,box-shadow .22s;
  position:relative;
  display:flex; flex-direction:column; align-items:center; text-align:center;
  -webkit-tap-highlight-color:transparent;
  box-shadow:0 2px 8px rgba(15,23,42,.05);
}
.cr-card:hover { border-color:rgba(21,101,192,.35); background:#F8FAFC; transform:translateY(-2px); box-shadow:0 8px 24px rgba(21,101,192,.12); }
.cr-card.selected {
  border-color:#1565C0; background:#EFF6FF;
  box-shadow:0 8px 32px rgba(21,101,192,.20);
}
.cr-card.selected::before {
  content:''; position:absolute; inset:0; border-radius:13px;
  background:linear-gradient(135deg,rgba(21,101,192,.06),transparent);
  pointer-events:none;
}

.cr-card-check { position:absolute; top:10px; right:10px; color:#1565C0; }

.cr-card-icon-wrap {
  width:56px; height:56px; border-radius:12px;
  background:#F1F5F9;
  border:1px solid #E2E8F0;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:14px;
  transition:border-color .22s,background .22s;
}
.cr-card.selected .cr-card-icon-wrap {
  background:#DBEAFE; border-color:rgba(21,101,192,.35);
  animation:cr-glow 1.5s ease-in-out infinite;
}

.cr-card-tag {
  font-family:'DM Mono',monospace; font-size:8px; letter-spacing:.2em;
  text-transform:uppercase; color:#94A3B8; margin-bottom:6px;
}
.cr-card.selected .cr-card-tag { color:#1565C0; }

.cr-card-name {
  font-family:'Inter',sans-serif; font-size:17px; font-weight:700;
  letter-spacing:-.01em; color:#0F172A; margin-bottom:8px;
}

.cr-card-desc {
  font-size:13px; color:#64748B; line-height:1.6; margin-bottom:14px;
}

.cr-card-divider { width:100%; height:1px; background:#F1F5F9; margin-bottom:12px; }
.cr-card.selected .cr-card-divider { background:rgba(21,101,192,.15); }

.cr-card-features { list-style:none; padding:0; margin:0; width:100%; }
.cr-card-features li {
  font-family:'Inter',sans-serif; font-size:11px; color:#94A3B8;
  padding:3px 0; display:flex; align-items:center; gap:6px; justify-content:center;
}
.cr-card.selected .cr-card-features li { color:#334155; }
.cr-card-features li::before { content:'·'; color:#1565C0; font-size:14px; }

/* ── Error ── */
.cr-error {
  background:#FEF2F2; border:1px solid #FECACA; border-radius:8px;
  color:#DC2626; font-family:'Inter',sans-serif;
  font-size:13px; padding:12px 16px;
  margin-bottom:20px; width:100%; max-width:860px;
  position:relative; z-index:1;
}

/* ── CTA ── */
.cr-cta-wrap { position:relative; z-index:1; width:100%; max-width:380px; text-align:center; animation:cr-fadeUp .5s .2s ease both; }
.cr-cta {
  width:100%; padding:16px 32px;
  font-family:'Inter',sans-serif; font-size:14px; font-weight:700;
  border:none; cursor:pointer; border-radius:10px;
  clip-path:none;
  transition:background .22s,transform .15s,box-shadow .22s;
}
.cr-cta.enabled  { background:#1565C0; color:#fff; box-shadow:0 4px 16px rgba(21,101,192,.35); }
.cr-cta.enabled:hover { background:#1976D2; transform:translateY(-1px); box-shadow:0 6px 24px rgba(21,101,192,.45); }
.cr-cta.enabled:active { transform:scale(.97); }
.cr-cta.disabled { background:#E2E8F0; color:#94A3B8; cursor:not-allowed; }
.cr-cta-hint {
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.14em;
  color:#94A3B8; margin-top:14px; text-transform:uppercase;
}

/* ── Logout ── */
.cr-logout {
  position:absolute; top:20px; right:20px; z-index:10;
  display:flex; align-items:center; gap:6px;
  font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.14em; text-transform:uppercase;
  color:#64748B; border:1px solid #E2E8F0;
  padding:7px 14px; border-radius:6px; background:#fff; cursor:pointer;
  transition:color .2s,border-color .2s,background .2s;
}
.cr-logout:hover { color:#1565C0; border-color:rgba(21,101,192,.3); background:#EEF5FF; }

/* ── Mobile ── */
@media(max-width:767px){
  .cr-root { padding:40px 14px 28px; justify-content:center; }
  .cr-header { margin-bottom:20px; }
  .cr-brand { font-size:26px; }
  .cr-brand-tag { margin-bottom:8px; }
  .cr-title { font-size:22px; margin-bottom:4px; }
  .cr-subtitle { font-size:13px; }
  .cr-grid { gap:10px; margin-bottom:20px; }
  .cr-card { padding:14px 10px 12px; border-radius:10px; }
  .cr-card-icon-wrap { width:42px; height:42px; margin-bottom:8px; }
  .cr-card-tag { font-size:7px; margin-bottom:4px; }
  .cr-card-name { font-size:15px; margin-bottom:0; }
  .cr-card-desc, .cr-card-divider, .cr-card-features { display:none; }
  .cr-cta-wrap { max-width:100%; }
  .cr-cta { padding:14px 24px; font-size:13px; }
  .cr-error { font-size:12px; padding:10px 12px; margin-bottom:12px; }
}
`;

export default function ChoiceRole() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
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
      // Use window.location.href instead of React navigate() so the page
      // reloads with fresh localStorage cache — avoids stale in-memory
      // React state blocking navigation on the very first click.
      window.location.href = ROUTES[selectedRole] || '/';
    } catch (err) {
      const status = err?.status;
      const msg = Array.isArray(err?.data?.message) ? err.data.message.join('. ') : err?.data?.message || err?.message || '';
      if (status === 400) setError('Invalid role selected. Please try again.');
      else if (status === 401) { setError('Session expired. Please log in again.'); setTimeout(() => navigate('/login'), 2000); }
      else if (msg) setError(msg);
      else setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };


  return (
    <div className="cr-root">
      <style>{ROLE_CSS}</style>

      <button className="cr-logout" onClick={async () => { await signOut(); navigate('/'); }}>
        <IoLogOutOutline size={12} /> Log out
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
                <Icon size={26} color={selected ? "#1565C0" : "#94A3B8"} />
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
        {/* <div className="cr-cta-hint">You can change your role anytime in settings</div> */}
      </div>
    </div>
  );
}
