import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaChartLine, FaFire, FaTimes } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { goToProfile } from "../../utils/profileNavigation";

/* ─── Glassmorphism styles for RisingStartupsSection ─── */
const RSS_CSS = `
/* ── Inline section glass card ── */
.rss-inline {
  margin: 8px 10px;
  border-radius: 22px;
  border: 1px solid;
  overflow: hidden;
  animation: card-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.rss-inline.dark {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.09);
  box-shadow:
    0 4px 24px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
.rss-inline.light {
  background: rgba(255,255,255,0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.88);
  box-shadow:
    0 4px 20px rgba(0,0,0,0.06),
    inset 0 1px 0 rgba(255,255,255,0.95);
}

/* ── Section header icon ── */
.rss-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(0,184,169,0.14);
  border: 1px solid rgba(0,184,169,0.25);
  color: #00B8A9;
  box-shadow: 0 0 10px rgba(0,184,169,0.2);
}

/* ── View All button ── */
.rss-view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(0,184,169,0.3);
  background: rgba(0,184,169,0.10);
  color: #00B8A9;
  transition: background .2s, box-shadow .2s;
  flex-shrink: 0;
  cursor: pointer;
}
.rss-view-all-btn:hover {
  background: rgba(0,184,169,0.18);
  box-shadow: 0 0 10px rgba(0,184,169,0.2);
}

/* ── Row hover ── */
.rss-row-btn {
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background .2s;
  border-radius: 14px;
}
.rss-inline.dark  .rss-row-btn:hover { background: rgba(0,184,169,0.06); }
.rss-inline.light .rss-row-btn:hover { background: rgba(0,184,169,0.05); }

/* ── Rank badge ── */
.rss-rank {
  font-size: 11px;
  font-weight: 800;
  background: linear-gradient(135deg, #00E5D3, #00B8A9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

/* ── Score chip ── */
.rss-score-chip {
  text-align: right;
  flex-shrink: 0;
  width: 48px;
}
.rss-score-value {
  font-size: 13px;
  font-weight: 700;
}
.rss-inline.dark  .rss-score-value { color: rgba(255,255,255,0.85); }
.rss-inline.light .rss-score-value { color: rgba(0,0,0,0.8); }
.rss-score-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.rss-inline.dark  .rss-score-label { color: rgba(255,255,255,0.3); }
.rss-inline.light .rss-score-label { color: rgba(0,0,0,0.35); }

/* ── Logo ring in rows ── */
.rss-logo-ring {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid rgba(0,184,169,0.3);
  flex-shrink: 0;
}

/* ── Full panel backdrop ── */
.rss-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
@media (min-width: 640px) {
  .rss-backdrop {
    align-items: center;
    justify-content: center;
  }
}

.rss-panel-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ── Full panel glass sheet ── */
.rss-panel {
  position: relative;
  width: 100%;
  border-radius: 28px 28px 0 0;
  max-height: 88svh;
  display: flex;
  flex-direction: column;
}
@media (min-width: 640px) {
  .rss-panel {
    max-width: 560px;
    border-radius: 28px;
    max-height: 80vh;
    margin: auto;
  }
}
.rss-panel.dark {
  background: rgba(14,14,20,0.94);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow:
    0 -2px 0 rgba(0,184,169,0.15),
    0 24px 80px rgba(0,0,0,0.7),
    inset 0 1px 0 rgba(255,255,255,0.06);
}
.rss-panel.light {
  background: rgba(250,249,247,0.96);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(255,255,255,0.95);
  box-shadow:
    0 -2px 0 rgba(0,184,169,0.10),
    0 24px 80px rgba(0,0,0,0.12),
    inset 0 1px 0 rgba(255,255,255,1);
}

/* ── Drag handle ── */
.rss-drag-handle {
  width: 40px;
  height: 5px;
  border-radius: 3px;
  background: rgba(0,184,169,0.4);
  box-shadow: 0 0 8px rgba(0,184,169,0.35);
  margin: 0 auto;
}

/* ── Panel divider ── */
.rss-panel-divider {
  height: 1px;
}
.rss-panel.dark  .rss-panel-divider { background: rgba(255,255,255,0.08); }
.rss-panel.light .rss-panel-divider { background: rgba(0,0,0,0.07); }

/* ── Panel card rows ── */
.rss-panel-row {
  border-radius: 18px;
  border: 1px solid;
  overflow: hidden;
  transition: box-shadow .25s, transform .2s;
}
.rss-panel.dark .rss-panel-row {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.08);
}
.rss-panel.dark .rss-panel-row:hover {
  background: rgba(0,184,169,0.06);
  box-shadow: 0 4px 16px rgba(0,184,169,0.15);
}
.rss-panel.light .rss-panel-row {
  background: rgba(255,255,255,0.8);
  border-color: rgba(0,0,0,0.07);
}
.rss-panel.light .rss-panel-row:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

/* ── Panel row button (inside card) ── */
.rss-panel-row-btn {
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
}

/* ── Refresh button ── */
.rss-refresh-btn {
  width: 100%;
  border-radius: 14px;
  background: linear-gradient(135deg, #00E5D3 0%, #00B8A9 50%, #007a73 100%);
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  border: none;
  cursor: pointer;
  transition: transform .2s, box-shadow .2s;
  box-shadow: 0 4px 20px rgba(0,184,169,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
}
.rss-refresh-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 28px rgba(0,184,169,0.55), inset 0 1px 0 rgba(255,255,255,0.25);
}
.rss-refresh-btn:active { transform: scale(0.98); }
`;

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

const logoFallback = (name = "Startup") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00B8A9&color=fff&size=72`;

const DOMAIN_SUFFIXES = new Set([
  "com", "io", "ai", "app", "co", "in", "net", "org", "tech", "dev", "xyz",
]);
const NOISY_SUFFIXES = ["official"];
const BRAND_SUFFIXES = ["hub", "labs", "tech", "works", "space", "x"];

function stripDomainBits(value = "") {
  let cleaned = String(value).trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "");
  cleaned = cleaned.replace(/^www\./, "");
  cleaned = cleaned.split("/")[0];
  cleaned = cleaned.split("?")[0];
  cleaned = cleaned.split("#")[0];
  const parts = cleaned.split(".").filter(Boolean);
  while (parts.length > 1 && DOMAIN_SUFFIXES.has(parts[parts.length - 1])) {
    parts.pop();
  }
  return parts.join(" ");
}

function cleanToken(token = "") {
  let cleaned = token.replace(/[^a-zA-Z0-9]/g, "");
  if (!cleaned) return "";
  const lower = cleaned.toLowerCase();
  const noisySuffix = NOISY_SUFFIXES.find(
    (s) => lower.endsWith(s) && lower.length > s.length + 2
  );
  if (noisySuffix) cleaned = cleaned.slice(0, -noisySuffix.length);
  const lt = cleaned.toLowerCase();
  if (lt.length <= 3) return lt.toUpperCase();
  const brandSuffix = BRAND_SUFFIXES.find(
    (s) => lt.endsWith(s) && lt.length > s.length + 2
  );
  if (brandSuffix) {
    const prefix = lt.slice(0, -brandSuffix.length);
    return (
      prefix.charAt(0).toUpperCase() +
      prefix.slice(1) +
      brandSuffix.charAt(0).toUpperCase() +
      brandSuffix.slice(1)
    );
  }
  return lt.charAt(0).toUpperCase() + lt.slice(1);
}

function formatStartupDisplayName(startup) {
  for (const candidate of [startup?.name, startup?.username]) {
    if (!candidate || String(candidate).trim().toLowerCase() === "startup") continue;
    const withoutDomain = stripDomainBits(candidate);
    const normalized = withoutDomain.replace(/[_\-+.]+/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    const formatted = normalized.split(" ").map(cleanToken).filter(Boolean).join(" ").trim();
    if (formatted) return formatted;
  }
  return "Startup";
}

/* ─── StartupRow ─────────────────────────────────────────────────────────────── */
function StartupRow({ startup, onOpenProfile, isDark, detailed = false, panelMode = false }) {
  const displayName = formatStartupDisplayName(startup);
  const score = startup.trendingScore ?? 0;
  const btnCls = panelMode ? "rss-panel-row-btn" : "rss-row-btn";

  return (
    <button
      type="button"
      onClick={() => onOpenProfile(startup)}
      className={btnCls}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Rank */}
        <span className="rss-rank" aria-label={`Rank ${startup.rank}`}>#{startup.rank}</span>

        {/* Logo */}
        <div className="rss-logo-ring">
          <img
            src={startup.logoUrl || logoFallback(displayName)}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = logoFallback(displayName); }}
          />
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className={`truncate text-sm font-bold leading-snug ${isDark ? "text-white" : "text-gray-900"}`}>
            {displayName}
          </p>
          {detailed && startup.tagline && (
            <p className={`truncate text-xs mt-0.5 ${isDark ? "text-white/40" : "text-gray-500"}`}>
              {startup.tagline}
            </p>
          )}
        </div>

        {/* Score */}
        <div className="rss-score-chip">
          <p className="rss-score-value">{score}</p>
          <p className="rss-score-label">score</p>
        </div>
      </div>
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────── */
export default function RisingStartupsSection({
  startups = [],
  loading = false,
  onRefresh,
  triggerOnly = false,
  panelOnly = false,
  isOpen: isOpenProp,
  onOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const isDark = theme === "dark";
  const panelCls = isDark ? "dark" : "light";

  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = typeof isOpenProp === "boolean";
  const isOpen = isControlled ? isOpenProp : internalOpen;

  /* ── Body scroll-lock when the panel is open ── */
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  const openPanel = () => {
    if (onOpen) { onOpen(); return; }
    if (!isControlled) setInternalOpen(true);
  };

  const closePanel = () => {
    if (onClose) { onClose(); return; }
    if (!isControlled) setInternalOpen(false);
  };

  const openProfile = (startup) => {
    if (!startup?.founderId) return;
    closePanel();
    goToProfile(startup.founderId, currentUser, navigate);
  };

  const topFive = startups.slice(0, 5);

  /* ── Fire-icon trigger ── */
  const triggerButton = (
    <button
      type="button"
      onClick={openPanel}
      className={`evoa-header-action-btn ${isDark ? "" : ""}`}
      title="Rising Startups"
      aria-label="Open Rising Startups"
    >
      <FaFire size={16} style={{ color: isDark ? "#ff9f43" : "#f97316" }} />
    </button>
  );

  /* ── Skeleton ── */
  const skeletonRows = (count) =>
    Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`h-14 rounded-2xl animate-pulse mx-2 my-1 ${isDark ? "bg-white/5" : "bg-black/5"}`} />
    ));

  /* ── Inline preview section ── */
  const inlineSection = (
    <section className={`rss-inline ${panelCls}`}>
      <style>{RSS_CSS}</style>

      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="rss-icon-wrap">
            <FaChartLine size={15} />
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
              Rising Startups
            </p>
            <p className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>
              Top 5 this week
            </p>
          </div>
        </div>
        <button type="button" onClick={openPanel} className="rss-view-all-btn">
          View All
          <FaArrowRight size={9} />
        </button>
      </div>

      {/* Divider */}
      <div className="rss-panel-divider" />

      {/* List */}
      {loading ? (
        <div className="py-2">{skeletonRows(3)}</div>
      ) : topFive.length > 0 ? (
        <div className="py-1 px-1">
          {topFive.map((startup, index) => (
            <div key={startup.startupId}>
              {index !== 0 && <div className={`h-px mx-3 ${isDark ? "bg-white/5" : "bg-black/5"}`} />}
              <StartupRow
                startup={startup}
                onOpenProfile={openProfile}
                isDark={isDark}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-3 pb-3">
          <div className={`rounded-2xl px-4 py-5 text-center text-sm ${isDark ? "bg-white/5 text-white/40" : "bg-black/4 text-gray-500"}`}>
            No startups available yet.
          </div>
        </div>
      )}
    </section>
  );

  /* ── Full-screen panel ── */
  const panel = isOpen && (
    <div className="rss-backdrop" role="dialog" aria-modal="true" aria-label="Rising Startups">
      <style>{RSS_CSS}</style>

      {/* Backdrop */}
      <div className="rss-panel-overlay" onClick={closePanel} />

      {/* Sheet */}
      <div className={`rss-panel ${panelCls}`}>
        {/* Drag handle (mobile only) */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
          <div className="rss-drag-handle" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className={`text-base font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
              Rising Startups
            </p>
            <p className={`text-xs ${isDark ? "text-white/35" : "text-gray-500"}`}>
              Live ranking across EVOA
            </p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark
                ? "text-white/60 hover:bg-white/10"
                : "text-gray-600 hover:bg-black/8"
            }`}
            aria-label="Close"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Divider */}
        <div className="rss-panel-divider flex-shrink-0" />

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide py-2 px-2">
          {loading ? (
            <div className="space-y-2 p-2">{skeletonRows(6)}</div>
          ) : startups.length > 0 ? (
            <div className="space-y-2 p-1">
              {startups.map((startup) => (
                <div key={startup.startupId} className={`rss-panel-row ${panelCls}`}>
                  <StartupRow
                    startup={startup}
                    onOpenProfile={openProfile}
                    isDark={isDark}
                    detailed
                    panelMode
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10">
              <div className={`rounded-2xl px-4 py-8 text-center text-sm ${isDark ? "bg-white/5 text-white/40" : "bg-black/4 text-gray-500"}`}>
                There are no ranked startups yet.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {onRefresh && (
          <div
            className="flex-shrink-0 px-4 py-3"
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <div className="rss-panel-divider mb-3" />
            <button type="button" onClick={onRefresh} className="rss-refresh-btn">
              Refresh Ranking
            </button>
          </div>
        )}

        {/* iOS safe-area spacer */}
        {!onRefresh && (
          <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} className="flex-shrink-0" />
        )}
      </div>
    </div>
  );

  /* ── Render ── */
  return (
    <>
      {triggerOnly ? (
        triggerButton
      ) : !panelOnly ? (
        inlineSection
      ) : null}

      {panel}
    </>
  );
}
