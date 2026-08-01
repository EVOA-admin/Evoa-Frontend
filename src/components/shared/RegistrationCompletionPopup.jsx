import React, { useState, useEffect } from 'react';
import { IoRocketOutline, IoClose, IoShieldCheckmarkOutline, IoVideocamOutline, IoArrowForward } from 'react-icons/io5';

// ── Dismiss key: session-scoped (reappears every new session until complete) ──
const DISMISS_KEY = 'evoa_reg_popup_dismissed';

/**
 * Determines whether the startup profile is "fully registered":
 * has all required registration fields completed.
 */
function isProfileComplete(startup) {
  if (!startup) return false;
  const hasDesc = !!((startup.description && startup.description.trim()) || (startup.shortDescription && startup.shortDescription.trim()));
  const hasIndustry = !!((startup.industries && startup.industries.length > 0) || startup.industry);
  const hasStage = !!startup.stage;
  const hasVerification = !!(startup.verification?.entityType || startup.verification?.countryCode);
  const hasEmail = !!((startup.companyEmail && startup.companyEmail.trim()) || (startup.founders?.[0]?.email && startup.founders[0].email.trim()) || (startup.founder?.email && startup.founder.email.trim()));
  const hasFounder = !!(startup.founders?.length > 0 && startup.founders[0]?.role);
  return hasDesc && hasIndustry && hasStage && hasVerification && hasEmail && hasFounder;
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Mono:wght@400&display=swap');

@keyframes rcp-slideUp {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
@keyframes rcp-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(21,101,192,.3); }
  50%       { box-shadow: 0 0 0 6px rgba(21,101,192,0); }
}

.rcp-root {
  position: fixed;
  /* Desktop: bottom-right corner */
  bottom: 88px; right: 20px;
  z-index: 9000;
  width: min(360px, calc(100vw - 24px));
  animation: rcp-slideUp .38s cubic-bezier(.22,1,.36,1) both;
  font-family: 'Inter', sans-serif;
}
@media (max-width: 639px) {
  .rcp-root {
    /* Mobile: full-width bottom sheet */
    bottom: 74px; right: 0; left: 0;
    width: 100%;
    padding: 0 12px;
  }
}

.rcp-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(15,23,42,.16), 0 2px 8px rgba(15,23,42,.08);
  overflow: hidden;
  border: 1px solid rgba(21,101,192,.1);
}
/* dark mode card */
.dark .rcp-card {
  background: #1E293B;
  border-color: rgba(255,255,255,.08);
}

/* Accent gradient strip */
.rcp-strip {
  height: 3px;
  background: linear-gradient(90deg, #1565C0 0%, #1976D2 50%, #42A5F5 100%);
}

.rcp-body { padding: 16px 18px 18px; }

/* Header row */
.rcp-header {
  display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px;
}
.rcp-icon-wrap {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  background: linear-gradient(135deg, #EEF5FF 0%, #DBEAFE 100%);
  display: flex; align-items: center; justify-content: center;
  animation: rcp-pulse 2.5s ease-in-out infinite;
}
.dark .rcp-icon-wrap { background: rgba(21,101,192,.25); }

.rcp-headline {
  font-size: 14px; font-weight: 700; color: #0F172A; line-height: 1.3; flex: 1;
  letter-spacing: -.01em;
}
.dark .rcp-headline { color: #F1F5F9; }

.rcp-close {
  width: 24px; height: 24px; border-radius: 8px; border: none; cursor: pointer;
  background: #F1F5F9; display: flex; align-items: center; justify-content: center;
  color: #94A3B8; transition: background .15s, color .15s; flex-shrink: 0; padding: 0;
}
.rcp-close:hover { background: #E2E8F0; color: #475569; }
.dark .rcp-close { background: rgba(255,255,255,.08); color: #64748B; }
.dark .rcp-close:hover { background: rgba(255,255,255,.14); color: #94A3B8; }

/* Benefits list */
.rcp-benefits { margin: 0 0 14px 52px; padding: 0; list-style: none; }
.rcp-benefit {
  font-size: 12px; color: #64748B; display: flex; align-items: center; gap: 6px;
  margin-bottom: 5px; line-height: 1.4;
}
.dark .rcp-benefit { color: #94A3B8; }
.rcp-benefit::before {
  content: ''; width: 5px; height: 5px; border-radius: 50%;
  background: #1565C0; flex-shrink: 0;
}

/* CTA */
.rcp-cta {
  width: 100%; padding: 11px 20px;
  background: #1565C0; color: #fff; border: none; border-radius: 10px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
  transition: background .2s, transform .15s, box-shadow .2s;
  box-shadow: 0 4px 14px rgba(21,101,192,.35);
  letter-spacing: .005em;
}
.rcp-cta:hover { background: #1976D2; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(21,101,192,.45); }
.rcp-cta:active { transform: scale(.97); }
`;

export default function RegistrationCompletionPopup({ startup, onComplete, isDark = false }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return !!sessionStorage.getItem(DISMISS_KEY); } catch { return false; }
  });

  // Re-evaluate whenever startup data changes
  const complete = isProfileComplete(startup);
  const hasPitchVideo = !!startup?.pitchVideoUrl;

  // Don't show if: data still loading, profile complete, or dismissed this session
  if (!startup || complete || dismissed) return null;

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch {}
    setDismissed(true);
  };

  // Variant A: no pitch video yet
  // Variant B: has video but still incomplete
  const isVariantA = !hasPitchVideo;

  return (
    <div className={`rcp-root${isDark ? ' dark' : ''}`}>
      <style>{CSS}</style>
      <div className="rcp-card">
        <div className="rcp-strip" />
        <div className="rcp-body">
          {/* Header */}
          <div className="rcp-header">
            <div className="rcp-icon-wrap">
              {isVariantA
                ? <IoVideocamOutline size={20} color="#1565C0" />
                : <IoShieldCheckmarkOutline size={20} color="#1565C0" />
              }
            </div>
            <div className="rcp-headline">
              {isVariantA
                ? 'Add your pitch video to get discovered'
                : 'Complete registration to get verified ✓'
              }
            </div>
            <button className="rcp-close" onClick={dismiss} aria-label="Dismiss">
              <IoClose size={14} />
            </button>
          </div>

          {/* Benefits */}
          <ul className="rcp-benefits">
            {isVariantA ? (
              <>
                <li className="rcp-benefit">Investors watch your pitch before messaging</li>
                <li className="rcp-benefit">Videos increase funding inquiry rate by 3×</li>
                <li className="rcp-benefit">Takes less than 2 minutes to complete</li>
              </>
            ) : (
              <>
                <li className="rcp-benefit">Get the Verified badge on your profile</li>
                <li className="rcp-benefit">Appear higher in investor search results</li>
                <li className="rcp-benefit">Unlock full platform features</li>
              </>
            )}
          </ul>

          {/* CTA */}
          <button className="rcp-cta" onClick={onComplete}>
            <IoRocketOutline size={15} />
            Complete Registration
            <IoArrowForward size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
