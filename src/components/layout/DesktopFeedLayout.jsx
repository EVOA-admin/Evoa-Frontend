import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaChartLine, FaArrowRight, FaFire, FaUsers, FaLightbulb } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import postsService from "../../services/postsService";
import exploreService from "../../services/exploreService";
import { goToProfile } from "../../utils/profileNavigation";

/* ─── CSS ─── */
const CSS = `
/* Mobile: single-column, right panel hidden, spacer hidden */
.dfl-root {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
}

.dfl-spacer { display: none; }
.dfl-feed   { flex: 1; min-width: 0; }
.dfl-right  { display: none; }

/*
  Desktop: feed is at the exact centre of the full viewport.

  How it works:
  • The sidebar takes up space on the left (72px at lg, 240px at xl).
  • Using margin-left: calc(50vw - 280px) places the feed’s LEFT edge at
    (viewport-centre − half-feed-width), so the feed’s centre lands exactly
    at 50vw — the true centre of the browser window — on every screen size.
  • The right panel is position:fixed so it never pushes the feed around.
*/
@media (min-width: 1024px) {
  .dfl-root {
    display: block;    /* simple block — no flex centering needed */
    width: 100%;
    position: relative;
  }

  .dfl-spacer { display: none; }

  .dfl-feed {
    width: 560px;
    min-width: 0;
    padding: 0 6px;
    /*
      Place feed centre at 50vw:
        left edge = 50vw - (560px / 2) = 50vw - 280px
      This is viewport-absolute and is unaffected by sidebar width.
    */
    margin-left: calc(50vw - 280px - 72px); /* lg: sidebar 72px */
  }

  /* Right panel — fixed to viewport right, scrolls independently */
  .dfl-right {
    display: flex;
    flex-direction: column;
    position: fixed;
    right: 20px;
    top: 0;
    bottom: 0;
    width: 300px;
    padding: 20px 0;
    gap: 12px;
    overflow-y: auto;
    scrollbar-width: none;
    z-index: 5;
  }
  .dfl-right::-webkit-scrollbar { display: none; }
}

@media (min-width: 1280px) {
  .dfl-feed {
    margin-left: calc(50vw - 280px - 240px); /* xl: sidebar 240px */
  }
}


/* ── Right panel glass cards ── */
.dfl-panel-card {
  border-radius: 20px;
  border: 1px solid;
  overflow: hidden;
  animation: card-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.dfl-panel-card.dark {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.09);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
}
.dfl-panel-card.light {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.9);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95);
}

/* Panel header */
.dfl-panel-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px;
}
.dfl-panel-hdr-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dfl-panel-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,184,169,0.14);
  border: 1px solid rgba(0,184,169,0.25);
  color: #00B8A9;
  flex-shrink: 0;
}

/* Panel divider */
.dfl-panel-div {
  height: 1px;
  margin: 0 14px;
}
.dfl-panel-card.dark  .dfl-panel-div { background: rgba(255,255,255,0.07); }
.dfl-panel-card.light .dfl-panel-div { background: rgba(0,0,0,0.06); }

/* Row items */
.dfl-panel-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 14px;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  transition: background .2s;
}
.dfl-panel-card.dark  .dfl-panel-row:hover { background: rgba(255,255,255,0.05); }
.dfl-panel-card.light .dfl-panel-row:hover { background: rgba(0,0,0,0.04); }

/* Avatar */
.dfl-panel-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid rgba(0,184,169,0.35);
  flex-shrink: 0;
}

/* Rank */
.dfl-rank {
  font-size: 11px;
  font-weight: 800;
  background: linear-gradient(135deg, #00E5D3, #00B8A9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* View all pill */
.dfl-view-all {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
  border: 1px solid rgba(0,184,169,0.3);
  background: rgba(0,184,169,0.10);
  color: #00B8A9;
  cursor: pointer;
  transition: background .2s;
  border: none;
}
.dfl-view-all:hover { background: rgba(0,184,169,0.18); }

/* Stats tile row */
.dfl-stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px 12px;
}
.dfl-stat-tile {
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid;
  text-align: center;
}
.dfl-panel-card.dark  .dfl-stat-tile { background: rgba(0,184,169,0.05); border-color: rgba(0,184,169,0.14); }
.dfl-panel-card.light .dfl-stat-tile { background: rgba(0,184,169,0.04); border-color: rgba(0,184,169,0.12); }
.dfl-stat-val {
  font-size: 18px;
  font-weight: 900;
  background: linear-gradient(135deg, #00E5D3, #00B8A9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
}
.dfl-stat-lbl {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 2px;
}
.dfl-panel-card.dark  .dfl-stat-lbl { color: rgba(255,255,255,0.35); }
.dfl-panel-card.light .dfl-stat-lbl { color: rgba(0,0,0,0.4); }

/* Footer links */
.dfl-footer {
  padding: 8px 4px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
}
.dfl-footer-link {
  font-size: 11px;
  text-decoration: none;
  cursor: pointer;
  transition: color .2s;
  background: transparent;
  border: none;
  padding: 0;
}
`;

function formatStartupName(s) {
  const raw = s?.name || s?.username || "Startup";
  if (raw.toLowerCase() === "startup") return "Startup";
  return raw.replace(/[_\-+.]+/g, " ").replace(/\s+/g, " ").trim()
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/**
 * DesktopFeedLayout — wraps any home feed page.
 *
 * Mobile/tablet: renders children as-is.
 * Desktop (≥1280px): 2-column layout.
 *   Left: children (feed, max-w 560px)
 *   Right: Rising Startups leaderboard + Suggested connections + Platform stats
 */
export default function DesktopFeedLayout({ children }) {
  const { theme } = useTheme();
  const { user: currentUser, userRole } = useAuth();
  const isDark = theme === "dark";
  const cls = isDark ? "dark" : "light";
  const navigate = useNavigate();

  const [risingStartups, setRisingStartups] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loadingRising, setLoadingRising] = useState(true);

  useEffect(() => {
    // Rising startups
    postsService.getRisingStartups()
      .then(res => {
        const data = res?.data?.data || res?.data || [];
        if (Array.isArray(data)) setRisingStartups(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoadingRising(false));

    // Suggested connections — investors for startup role, startups for others
    const fetchSuggested = userRole === "startup"
      ? exploreService.getInvestorSpotlight()
      : exploreService.getStartupsOfWeek();

    fetchSuggested
      .then(res => {
        const data = res?.data?.data || res?.data || [];
        if (Array.isArray(data)) setSuggested(data.slice(0, 4));
      })
      .catch(() => {});
  }, [userRole]);

  const logoFallback = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "S")}&background=00B8A9&color=fff&size=72`;

  // Right panel JSX
  const rightPanel = (
    <>
      {/* Rising Startups */}
      <div className={`dfl-panel-card ${cls}`}>
        <div className="dfl-panel-hdr">
          <div className="dfl-panel-hdr-left">
            <span className="dfl-panel-icon"><FaChartLine size={14} /></span>
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Rising Startups</p>
              <p className={`text-[10px] ${isDark ? "text-white/35" : "text-gray-500"}`}>Top 5 this week</p>
            </div>
          </div>
          <button className="dfl-view-all" onClick={() => navigate("/explore")}>
            All <FaArrowRight size={8} />
          </button>
        </div>

        <div className="dfl-panel-div" />

        <div className="py-1 px-1">
          {loadingRising ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-12 rounded-2xl animate-pulse mx-2 my-1 ${isDark ? "bg-white/5" : "bg-black/5"}`} />
            ))
          ) : risingStartups.length > 0 ? (
            risingStartups.map((s, i) => (
              <button
                key={s.startupId || i}
                className="dfl-panel-row"
                onClick={() => s.founderId && goToProfile(s.founderId, currentUser, navigate)}
              >
                <span className="dfl-rank">#{s.rank || i + 1}</span>
                <div className="dfl-panel-avatar">
                  <img
                    src={s.logoUrl || logoFallback(s.name)}
                    alt={s.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = logoFallback(s.name); }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                    {formatStartupName(s)}
                  </p>
                  <p className={`text-[10px] truncate ${isDark ? "text-white/40" : "text-gray-500"}`}>
                    Score: {s.trendingScore ?? 0}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <p className={`text-xs px-4 py-4 ${isDark ? "text-white/40" : "text-gray-400"}`}>No data yet.</p>
          )}
        </div>
      </div>

      {/* Suggested Connections */}
      {suggested.length > 0 && (
        <div className={`dfl-panel-card ${cls}`}>
          <div className="dfl-panel-hdr">
            <div className="dfl-panel-hdr-left">
              <span className="dfl-panel-icon"><FaUsers size={14} /></span>
              <div>
                <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {userRole === "startup" ? "Investor Spotlight" : "Startups to Watch"}
                </p>
                <p className={`text-[10px] ${isDark ? "text-white/35" : "text-gray-500"}`}>Suggested for you</p>
              </div>
            </div>
          </div>

          <div className="dfl-panel-div" />

          <div className="py-1 px-1">
            {suggested.map((item, i) => {
              const name = item.fullName || item.name || item.user?.fullName || "User";
              const avatar = item.avatarUrl || item.logoUrl || item.user?.avatarUrl;
              const sub = item.investorProfile?.investorType || item.tagline || item.sector || item.role || "";
              const userId = item.userId || item.user?.id || item.id;
              return (
                <button
                  key={item.id || i}
                  className="dfl-panel-row"
                  onClick={() => userId && goToProfile(userId, currentUser, navigate)}
                >
                  <div className="dfl-panel-avatar">
                    <img
                      src={avatar || logoFallback(name)}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = logoFallback(name); }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>{name}</p>
                      <MdVerified size={11} className="text-[#00B8A9] flex-shrink-0" />
                    </div>
                    {sub && <p className={`text-[10px] truncate ${isDark ? "text-white/40" : "text-gray-500"}`}>{sub}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Activity Stats */}
      <div className={`dfl-panel-card ${cls}`}>
        <div className="dfl-panel-hdr">
          <div className="dfl-panel-hdr-left">
            <span className="dfl-panel-icon"><FaLightbulb size={13} /></span>
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Platform Activity</p>
          </div>
        </div>
        <div className="dfl-panel-div" />
        <div className="dfl-stats-row">
          {[
            { val: `${risingStartups.length}`, lbl: "Rising Now" },
            { val: `${suggested.length}`, lbl: "Suggested" },
            { val: "Live", lbl: "Battlefield" },
            { val: "AI", lbl: "O21 Ready" },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="dfl-stat-tile">
              <p className="dfl-stat-val">{val}</p>
              <p className="dfl-stat-lbl">{lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );


  return (
    <div className="dfl-root">
      <style>{CSS}</style>
      {/* Left spacer — invisible, mirrors right panel width to centre the feed */}
      <div className="dfl-spacer" aria-hidden="true" />
      <div className="dfl-feed">{children}</div>
      <div className="dfl-right">{rightPanel}</div>
    </div>
  );
}
