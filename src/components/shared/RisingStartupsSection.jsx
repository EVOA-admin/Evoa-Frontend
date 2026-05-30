import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaChartLine, FaFire, FaTimes } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { goToProfile } from "../../utils/profileNavigation";

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

/* ─── StartupRow ─────────────────────────────────────────────────────────────
   Renders a single startup entry. Designed to be safe at any screen width.    */
function StartupRow({ startup, onOpenProfile, isDark, detailed = false }) {
  const displayName = formatStartupDisplayName(startup);
  const score = startup.trendingScore ?? 0;

  return (
    <button
      type="button"
      onClick={() => onOpenProfile(startup)}
      className={`w-full text-left px-3 py-3 sm:px-4 transition-colors ${
        detailed ? "rounded-2xl hover:bg-black/5 dark:hover:bg-white/5" : ""
      }`}
    >
      {/* flex row — all children have explicit shrink/grow rules so nothing overflows */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">

        {/* Rank — fixed width, no shrink */}
        <div
          className="flex-shrink-0 w-8 text-xs font-bold text-[#00B8A9] text-center leading-none"
          aria-label={`Rank ${startup.rank}`}
        >
          #{startup.rank}
        </div>

        {/* Logo — fixed size, no shrink */}
        <div
          className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ${
            isDark ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <img
            src={startup.logoUrl || logoFallback(displayName)}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = logoFallback(displayName); }}
          />
        </div>

        {/* Name — takes remaining space, truncates */}
        <div className="flex-1 min-w-0">
          <p
            className={`truncate text-sm font-bold leading-snug ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {displayName}
          </p>
          {detailed && startup.tagline && (
            <p
              className={`truncate text-xs mt-0.5 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {startup.tagline}
            </p>
          )}
        </div>

        {/* Score — fixed, no shrink */}
        <div className="flex-shrink-0 text-right w-12 sm:w-14">
          <p
            className={`text-sm font-semibold tabular-nums ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {score}
          </p>
          <p
            className={`text-[10px] leading-none mt-0.5 ${
              isDark ? "text-gray-500" : "text-gray-400"
            }`}
          >
            score
          </p>
        </div>
      </div>
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────────  */
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

  /* ── Fire-icon trigger (used in header bars, etc.) ── */
  const triggerButton = (
    <button
      type="button"
      onClick={openPanel}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-90 ${
        isDark
          ? "text-[#ff9f43] hover:text-[#ffb36b] hover:bg-white/8"
          : "text-[#f97316] hover:text-[#ea580c] hover:bg-orange-50"
      }`}
      title="Rising Startups"
      aria-label="Open Rising Startups"
    >
      <FaFire size={16} />
    </button>
  );

  /* ── Inline preview section (shown in feed / dashboard) ── */
  const inlineSection = (
    <section
      className={`overflow-hidden border-b ${
        isDark ? "bg-gray-900 border-white/8" : "bg-white border-gray-100"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[#00B8A9]/10 text-[#00B8A9] flex items-center justify-center">
            <FaChartLine size={15} />
          </span>
          <div className="min-w-0">
            <p
              className={`text-sm font-bold truncate ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Rising Startups
            </p>
            <p
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Top 5 this week
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openPanel}
          className="flex-shrink-0 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#00B8A9] ml-2"
        >
          View All
          <FaArrowRight size={10} />
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="px-3 pb-3 space-y-2 sm:px-4 sm:pb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`h-14 rounded-2xl animate-pulse ${
                isDark ? "bg-white/5" : "bg-gray-100"
              }`}
            />
          ))}
        </div>
      ) : topFive.length > 0 ? (
        <div className="pb-1">
          {topFive.map((startup, index) => (
            <div
              key={startup.startupId}
              className={
                index !== 0
                  ? isDark
                    ? "border-t border-white/8"
                    : "border-t border-gray-100"
                  : ""
              }
            >
              <StartupRow
                startup={startup}
                onOpenProfile={openProfile}
                isDark={isDark}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <div
            className={`rounded-2xl px-4 py-5 text-center text-sm ${
              isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"
            }`}
          >
            No startups available yet.
          </div>
        </div>
      )}
    </section>
  );

  /* ── Full-screen panel (bottom-sheet on mobile, centered modal on sm+) ── */
  const panel = isOpen && (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Rising Startups"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closePanel}
      />

      {/* Sheet / Modal container
          Mobile  : bottom-sheet, slides up, max 88 vh, rounded top corners
          Desktop : centered card, max 560px wide, max 80vh, fully rounded      */}
      <div
        className={`
          relative w-full
          rounded-t-[24px]
          max-h-[88svh]
          sm:max-w-[560px] sm:rounded-[24px] sm:mx-auto sm:max-h-[80vh]
          flex flex-col
          ${isDark ? "bg-gray-900" : "bg-white"}
        `}
      >
        {/* Drag handle (mobile only) */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-1 sm:hidden">
          <div
            className={`h-1 w-12 rounded-full ${
              isDark ? "bg-white/15" : "bg-gray-200"
            }`}
          />
        </div>

        {/* Header */}
        <div
          className={`flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b ${
            isDark ? "border-white/8" : "border-gray-100"
          }`}
        >
          <div className="min-w-0">
            <p
              className={`text-base font-bold truncate ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Rising Startups
            </p>
            <p
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              Live ranking across EVOA
            </p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark
                ? "text-white hover:bg-white/10"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Close"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Scrollable list — min-h-0 is CRITICAL for flex-child scroll to work */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-transparent scrollbar-hide pb-4">
          {loading ? (
            <div className="px-3 pb-3 space-y-2 sm:px-4 sm:pb-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-14 rounded-2xl animate-pulse ${
                    isDark ? "bg-white/5" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>
          ) : startups.length > 0 ? (
            <div className="px-2 py-2 sm:px-3 sm:py-3 space-y-1.5">
              {startups.map((startup) => (
                <div
                  key={startup.startupId}
                  className={`rounded-2xl border ${
                    isDark
                      ? "border-white/8 bg-white/[0.03]"
                      : "border-gray-100 bg-gray-50/70"
                  }`}
                >
                  <StartupRow
                    startup={startup}
                    onOpenProfile={openProfile}
                    isDark={isDark}
                    detailed
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-10">
              <div
                className={`rounded-2xl px-4 py-8 text-center text-sm ${
                  isDark
                    ? "bg-white/5 text-gray-400"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                There are no ranked startups yet.
              </div>
            </div>
          )}
        </div>

        {/* Footer — refresh button + iOS home-bar spacing */}
        {onRefresh && (
          <div
            className={`flex-shrink-0 px-4 py-3 border-t pb-safe ${
              isDark ? "border-white/8" : "border-gray-100"
            }`}
            style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={onRefresh}
              className="w-full rounded-xl bg-[#00B8A9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#009f93] active:scale-[0.98] transition-all"
            >
              Refresh Ranking
            </button>
          </div>
        )}

        {/* iOS safe-area spacer when there's no refresh button */}
        {!onRefresh && (
          <div
            style={{ height: "env(safe-area-inset-bottom, 0px)" }}
            className="flex-shrink-0"
          />
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
