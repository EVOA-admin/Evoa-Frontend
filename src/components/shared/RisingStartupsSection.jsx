import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaChartLine, FaTimes } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { goToProfile } from "../../utils/profileNavigation";

const logoFallback = (name = "Startup") =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00B8A9&color=fff&size=72`;

const DOMAIN_SUFFIXES = new Set([
  "com", "io", "ai", "app", "co", "in", "net", "org", "tech", "dev", "xyz"
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
    (suffix) => lower.endsWith(suffix) && lower.length > suffix.length + 2
  );

  if (noisySuffix) {
    cleaned = cleaned.slice(0, -noisySuffix.length);
  }

  const lowerTrimmed = cleaned.toLowerCase();
  if (lowerTrimmed.length <= 3) {
    return lowerTrimmed.toUpperCase();
  }

  const brandSuffix = BRAND_SUFFIXES.find(
    (suffix) => lowerTrimmed.endsWith(suffix) && lowerTrimmed.length > suffix.length + 2
  );

  if (brandSuffix) {
    const prefix = lowerTrimmed.slice(0, -brandSuffix.length);
    return (
      prefix.charAt(0).toUpperCase() +
      prefix.slice(1) +
      brandSuffix.charAt(0).toUpperCase() +
      brandSuffix.slice(1)
    );
  }

  return lowerTrimmed.charAt(0).toUpperCase() + lowerTrimmed.slice(1);
}

function formatStartupDisplayName(startup) {
  const candidates = [startup?.name, startup?.username];

  for (const candidate of candidates) {
    if (!candidate || String(candidate).trim().toLowerCase() === "startup") continue;

    const withoutDomain = stripDomainBits(candidate);
    const normalized = withoutDomain.replace(/[_\-+.]+/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized) continue;

    const formatted = normalized
      .split(" ")
      .map(cleanToken)
      .filter(Boolean)
      .join(" ")
      .trim();

    if (formatted) {
      return formatted;
    }
  }

  return "Startup";
}

function StartupRow({ startup, onOpenProfile, isDark, detailed = false }) {
  const displayName = formatStartupDisplayName(startup);

  return (
    <button
      type="button"
      onClick={() => onOpenProfile(startup)}
      className={`w-full text-left px-4 py-3 transition-colors ${detailed ? "rounded-2xl hover:bg-black/5 dark:hover:bg-white/5" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-7 text-sm font-bold text-[#00B8A9]">#{startup.rank}</div>
        <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
          <img
            src={startup.logoUrl || logoFallback(displayName)}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = logoFallback(displayName);
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`truncate text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {displayName}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {startup.trendingScore}
          </p>
          <p className={`text-[10px] ${isDark ? "text-gray-500" : "text-gray-400"}`}>score</p>
        </div>
      </div>
    </button>
  );
}

export default function RisingStartupsSection({ startups = [], loading = false, onRefresh }) {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user: currentUser } = useAuth();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = React.useState(false);

  const openProfile = (startup) => {
    if (!startup?.founderId) return;
    goToProfile(startup.founderId, currentUser, navigate);
  };

  const topFive = startups.slice(0, 5);

  return (
    <>
      <section className={`overflow-hidden border-b ${isDark ? "bg-gray-900 border-white/8" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-full bg-[#00B8A9]/10 text-[#00B8A9] flex items-center justify-center">
              <FaChartLine size={16} />
            </span>
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Rising Startups</p>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Top 5 startups</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#00B8A9]"
          >
            View All
            <FaArrowRight size={11} />
          </button>
        </div>

        {loading ? (
          <div className="px-4 pb-4 space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={`h-14 rounded-2xl animate-pulse ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
            ))}
          </div>
        ) : topFive.length > 0 ? (
          <div>
            {topFive.map((startup, index) => (
              <div
                key={startup.startupId}
                className={index !== topFive.length - 1 ? (isDark ? "border-t border-white/8" : "border-t border-gray-100") : ""}
              >
                <StartupRow startup={startup} onOpenProfile={openProfile} isDark={isDark} />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 pb-4">
            <div className={`rounded-2xl px-4 py-5 text-center text-sm ${isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
              No startups available yet.
            </div>
          </div>
        )}
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute inset-x-0 top-0 bottom-0 sm:inset-6 sm:rounded-[28px] overflow-hidden">
            <div className={`flex h-full flex-col ${isDark ? "bg-gray-900" : "bg-white"}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}>
                <div>
                  <p className={`text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Rising Startups</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                >
                  <FaTimes size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {startups.length > 0 ? (
                  startups.map((startup, index) => (
                    <div
                      key={startup.startupId}
                      className={index !== startups.length - 1 ? (isDark ? "border-b border-white/8" : "border-b border-gray-100") : ""}
                    >
                      <StartupRow startup={startup} onOpenProfile={openProfile} isDark={isDark} detailed />
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-10">
                    <div className={`rounded-2xl px-4 py-8 text-center text-sm ${isDark ? "bg-white/5 text-gray-400" : "bg-gray-50 text-gray-500"}`}>
                      There are no ranked startups yet.
                    </div>
                  </div>
                )}
              </div>

              {onRefresh && (
                <div className={`px-4 py-3 border-t ${isDark ? "border-white/8" : "border-gray-100"}`}>
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="w-full rounded-xl bg-[#00B8A9] px-4 py-3 text-sm font-semibold text-white hover:bg-[#009f93]"
                  >
                    Refresh Ranking
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
