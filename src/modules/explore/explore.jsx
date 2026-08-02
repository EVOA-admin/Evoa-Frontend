import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { useDataCache } from "../../contexts/DataCacheContext";
import { FaSearch, FaFire, FaTrophy, FaEye, FaPlay, FaCalendarAlt } from "react-icons/fa";
import AppHeader from "../../components/layout/AppHeader";
import exploreService from "../../services/exploreService";
import VideoThumbnail from "../../components/shared/VideoThumbnail";
import { goToProfile } from "../../utils/profileNavigation";

/* ─── Desktop Explore CSS ─── */
const EXPLORE_DESKTOP_CSS = `
/* Desktop page header — only shown at lg+ (AppHeader is hidden) */
.exp-desktop-header {
  display: none;
}
@media (min-width: 1024px) {
  .exp-desktop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px 8px;
    gap: 16px;
  }
  .exp-page-wrap {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 16px;
  }
  .exp-search-wrap {
    position: sticky;
    top: 0;
    z-index: 20;
    padding: 12px 16px;
    margin: 0;
  }
  /* 2-column search results on desktop */
  .exp-search-people-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  /* Wider pitch grid on desktop */
  .exp-pitch-grid-lg {
    grid-template-columns: repeat(4, 1fr) !important;
  }
  /* Larger aspect ratio for desktop pitch tiles */
  .exp-pitch-tile-lg {
    aspect-ratio: 9/14 !important;
  }
  .exp-startup-grid-lg {
    grid-template-columns: repeat(4, 1fr) !important;
  }
  .exp-investor-grid-lg {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
`;


// Debounce helper — avoids API call on every keystroke
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function getPitchViewCount(pitch) {
  const rawCount = pitch?.viewCount ?? pitch?.view_count ?? pitch?.views ?? 0;
  const numericCount = typeof rawCount === 'number' ? rawCount : Number(rawCount);
  return Number.isFinite(numericCount) ? numericCount : 0;
}

export default function Explore() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { user: currentUser, userRole } = useAuth();
  const cache = useDataCache();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [topPitches, setTopPitches] = useState(() => {
    try {
      const cached = localStorage.getItem("evoa_explore_top_pitches_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return cache.get("explore_topPitches") || [];
  });
  const [startupsOfWeek, setStartupsOfWeek] = useState(() => {
    try {
      const cached = localStorage.getItem("evoa_explore_startups_week_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return cache.get("explore_startupsOfWeek") || [];
  });
  const [investorSpotlight, setInvestorSpotlight] = useState(() => {
    try {
      const cached = localStorage.getItem("evoa_explore_investors_spotlight_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return cache.get("explore_investorSpotlight") || [];
  });
  const [showAllInvestors, setShowAllInvestors] = useState(false);
  const [loadingData, setLoadingData] = useState(() => {
    return topPitches.length === 0 && startupsOfWeek.length === 0 && investorSpotlight.length === 0;
  });

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Fetch all explore sections on mount with background refresh
  useEffect(() => {
    const fetchExploreData = async () => {
      try {
        if (topPitches.length === 0) setLoadingData(true);

        const [topRes, weekRes, spotlightRes] = await Promise.allSettled([
          exploreService.getTopPitches(),
          exploreService.getStartupsOfWeek(),
          exploreService.getInvestorSpotlight(),
        ]);

        if (topRes.status === "fulfilled" && topRes.value?.data) {
          const pitches = topRes.value.data?.data || topRes.value.data;
          const parsed = Array.isArray(pitches) ? pitches : [];
          setTopPitches(parsed);
          cache.set("explore_topPitches", parsed);
          try {
            localStorage.setItem("evoa_explore_top_pitches_cache", JSON.stringify(parsed));
          } catch (_) {}
        }
        if (weekRes.status === "fulfilled" && weekRes.value?.data) {
          const startups = weekRes.value.data?.data || weekRes.value.data;
          const parsed = Array.isArray(startups) ? startups : [];
          setStartupsOfWeek(parsed);
          cache.set("explore_startupsOfWeek", parsed);
          try {
            localStorage.setItem("evoa_explore_startups_week_cache", JSON.stringify(parsed));
          } catch (_) {}
        }
        if (spotlightRes.status === "fulfilled" && spotlightRes.value?.data) {
          const investors = spotlightRes.value.data?.data || spotlightRes.value.data;
          const parsed = Array.isArray(investors) ? investors : [];
          setInvestorSpotlight(parsed);
          cache.set("explore_investorSpotlight", parsed);
          try {
            localStorage.setItem("evoa_explore_investors_spotlight_cache", JSON.stringify(parsed));
          } catch (_) {}
        }
      } catch (err) {
        console.error("Failed to fetch explore data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchExploreData();
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults(null);
      return;
    }
    const doSearch = async () => {
      setSearchLoading(true);
      try {
        const res = await exploreService.search({ q: debouncedSearch });
        const body = res?.data ?? {};
        const data = (body?.users !== undefined || body?.startups !== undefined) ? body : (body?.data ?? body);
        const normalized = {
          users: Array.isArray(data.users) ? data.users : [],
          startups: Array.isArray(data.startups) ? data.startups : [],
          investors: Array.isArray(data.investors) ? data.investors : [],
          incubators: Array.isArray(data.incubators) ? data.incubators : [],
          reels: Array.isArray(data.reels) ? data.reels : [],
          hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
        };
        setSearchResults(normalized);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults({ users: [], startups: [], investors: [], incubators: [], reels: [], hashtags: [] });
      } finally {
        setSearchLoading(false);
      }
    };
    doSearch();
  }, [debouncedSearch]);

  return (
    <>
      <style>{EXPLORE_DESKTOP_CSS}</style>
      <AppHeader title="Explore" />

      {/* Desktop-only page title (AppHeader hidden on desktop) */}
      <div className="exp-desktop-header">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Explore</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Discover startups, investors & pitches</p>
        </div>
      </div>

      <div className="exp-page-wrap">
        <div className="px-3 py-4">

          {/* Search Bar */}
          <div className="exp-search-wrap mb-5">
            <div className="relative">
              <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/50' : 'text-gray-500'}`} size={15} />
              <input
                type="text"
                placeholder="Search investors, startups, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-1 ${isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-evoa focus:ring-evoa/30'
                  : 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-evoa focus:ring-evoa/30 shadow-sm'
                  }`}
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-evoa border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>


          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mb-8 space-y-5">
              <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Search Results
              </h2>

              {searchLoading ? (
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Searching...</div>
              ) : searchResults && !searchResults.users?.length && !searchResults.startups?.length && !searchResults.investors?.length && !searchResults.incubators?.length && !searchResults.reels?.length && !searchResults.hashtags?.length ? (
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                  No results for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : searchResults ? (
                <>
                  {/* Hashtag Pills */}
                  {searchResults.hashtags?.length > 0 && (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Hashtags</p>
                      <div className="flex flex-wrap gap-2">
                        {searchResults.hashtags.map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => navigate(`/pitch/hashtag?hashtag=${encodeURIComponent(tag)}`)}
                            className="px-4 py-1.5 rounded-full text-sm font-medium bg-evoa/20 text-evoa hover:bg-evoa/30 transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reels */}
                  {searchResults.reels?.length > 0 && (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Pitch Reels</p>
                      <div className="grid grid-cols-2 gap-3">
                        {searchResults.reels.map((reel) => (
                          <div
                            key={reel.id}
                            onClick={() => navigate(`/pitch/${reel.id}`)}
                            className={`rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'}`}
                          >
                            <div className="relative h-28 bg-gray-800">
                              {reel.thumbnailUrl
                                ? <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-evoa/30 to-gray-800 flex items-center justify-center"><FaPlay className="text-white/40" size={22} /></div>
                              }
                            </div>
                            <div className="p-2.5">
                              <p className={`font-semibold text-xs truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{reel.title}</p>
                              <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{reel.startup?.name || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Startups */}
                  {searchResults.startups?.length > 0 && (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Startups</p>
                      <div className="exp-search-people-grid space-y-0 gap-2">
                        {searchResults.startups.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => goToProfile(item.founder?.id || item.id, currentUser, navigate)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01] ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              {item.logoUrl
                                ? <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-evoa to-evoa-hover flex items-center justify-center text-white font-bold text-sm">{(item.name || 'U')[0].toUpperCase()}</div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                              {item.tagline && <p className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{item.tagline}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Investors */}
                  {searchResults.investors?.length > 0 && (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-3 mt-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Investors</p>
                      <div className="exp-search-people-grid gap-2">
                        {searchResults.investors.map((item) => {
                          const avatarSrc = item.logoUrl || item.user?.avatarUrl;
                          const displayName = item.name || item.user?.fullName || 'Investor';
                          return (
                            <div
                              key={item.id}
                              onClick={() => goToProfile(item.userId || item.user?.id || item.id, currentUser, navigate)}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01] ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                {avatarSrc
                                  ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full bg-gradient-to-br from-evoa to-evoa-hover flex items-center justify-center text-white font-bold text-sm">{displayName[0].toUpperCase()}</div>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                                {item.companyName && <p className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{item.companyName}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Incubators */}
                  {searchResults.incubators?.length > 0 && (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-3 mt-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Incubators</p>
                      <div className="space-y-2">
                        {searchResults.incubators.map((item) => {
                          const displayName = item.user?.fullName || item.organizationType || 'Incubator';
                          const avatarSrc = item.logoUrl || item.user?.avatarUrl;
                          return (
                            <div
                              key={item.id}
                              onClick={() => goToProfile(item.userId || item.user?.id || item.id, currentUser, navigate)}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                {avatarSrc
                                  ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                                  : <div className="w-full h-full bg-gradient-to-br from-evoa to-evoa-hover flex items-center justify-center text-white font-bold text-sm">{displayName[0].toUpperCase()}</div>
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                                {item.tagline && <p className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{item.tagline}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* People */}
                  {searchResults.users?.length > 0 && (
                    <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-3 mt-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>People</p>
                      <div className="space-y-2">
                        {searchResults.users.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => goToProfile(item.id, currentUser, navigate)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              {item.avatarUrl
                                ? <img src={item.avatarUrl} alt={item.fullName} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-evoa to-evoa-hover flex items-center justify-center text-white font-bold text-sm">{(item.fullName || 'U')[0].toUpperCase()}</div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.fullName}</p>
                              <p className={`text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                <span className="capitalize">{item.role || 'User'}</span>
                                {item.company && ` at ${item.company}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Trending section — shown when not searching */}
          {!searchQuery.trim() && (
            <>

              {/*
              -----------------------------------------------------------------
              TEMPORARILY DISABLED: Battleground Spotlight
              Uncomment below to re-enable Battleground Spotlight
              -----------------------------------------------------------------
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <FaFire className={isDark ? 'text-orange-400' : 'text-orange-600'} size={16} />
                  <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Battleground Spotlight
                  </h2>
                </div>
                <div className={`rounded-2xl p-6 transition-all ${isDark
                  ? 'bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/20'
                  : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 shadow-md'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Live Pitch Battle
                    </h3>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-[#E8341A]/15 text-[#ff9c8f] border border-[#E8341A]/20' : 'bg-[#E8341A]/10 text-[#E8341A] border border-[#E8341A]/15'
                      }`}>
                      Open Now
                    </div>
                  </div>
                  <p className={`text-sm mb-4 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                    Watch startups compete for investment in real-time
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/battlefield')}
                    className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 text-sm transition-all ${isDark ? 'bg-[#E8341A] text-white hover:bg-[#c92a13]' : 'bg-[#E8341A] text-white hover:bg-[#c92a13]'
                      }`}
                  >
                    {userRole === 'startup' ? 'Enter Battlefield' : 'Watch Here'}
                  </button>
                </div>
              </div>
            */}



              {/* Top Performing Pitches */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Top Performing Pitches
                  </h2>
                </div>
                {loadingData ? (
                  <div className="grid grid-cols-3 exp-pitch-grid-lg gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`rounded-xl aspect-[9/16] exp-pitch-tile-lg animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                ) : topPitches.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No top pitches yet.</p>
                ) : (
                  <div className="grid grid-cols-3 exp-pitch-grid-lg gap-2">
                    {topPitches.map((pitch) => (
                      <div
                        key={pitch.id}
                        onClick={() => navigate(`/pitch/${pitch.id}`)}
                        className={`relative rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.03] hover:shadow-2xl aspect-[9/16] exp-pitch-tile-lg ${isDark
                          ? 'bg-white/5 border border-white/10'
                          : 'bg-white border border-gray-200 shadow-sm'
                          }`}
                      >
                        <div className="absolute inset-0">
                          {pitch.thumbnailUrl || pitch.image ? (
                            <img
                              src={pitch.thumbnailUrl || pitch.image}
                              alt={pitch.title || pitch.name}
                              className="w-full h-full object-cover"
                            />
                          ) : pitch.videoUrl ? (
                            <VideoThumbnail
                              videoUrl={pitch.videoUrl}
                              alt={pitch.title || pitch.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800" />
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2 pb-2.5">
                          <div className="w-full">
                            <h3 className="text-white font-bold text-[11px] leading-tight line-clamp-2 mb-0.5">{pitch.title || pitch.name}</h3>
                            <p className="text-white/80 text-[9px] truncate">{pitch.startup?.name || pitch.company}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <FaEye className="text-white/70" size={9} />
                              <span className="text-white/70 text-[9px] font-medium">{getPitchViewCount(pitch).toLocaleString()} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-1.5 right-1.5">
                          <div className="bg-black/50 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                            <FaPlay className="text-white" size={12} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Startups of the Week */}
              <div className="mb-8">
                <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Startups of the Week
                </h2>
                {loadingData ? (
                  <div className="grid grid-cols-2 exp-startup-grid-lg gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`rounded-xl h-28 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                ) : startupsOfWeek.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No featured startups this week.</p>
                ) : (
                  <div className="grid grid-cols-2 exp-startup-grid-lg gap-3">
                    {startupsOfWeek.map((startup) => (
                      <div
                        key={startup.id}
                        onClick={() => navigate(`/profile/${startup.id}`)}
                        className={`rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${isDark
                          ? 'bg-white/5 border border-white/10'
                          : 'bg-white border border-gray-200 shadow-sm'
                          }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 bg-gradient-to-br from-evoa to-evoa-hover">
                          {startup.logoUrl ? (
                            <img src={startup.logoUrl} alt={startup.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                              {(startup.name || 'S')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className={`text-center font-bold text-xs mb-0.5 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {startup.name}
                        </h3>
                        <p className={`text-center text-[10px] truncate ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          {startup.sector || startup.industry}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Investor Spotlight */}
              <div className="mb-8">
                <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Investor Spotlight
                </h2>
                {loadingData ? (
                  <div className="grid grid-cols-2 exp-investor-grid-lg gap-3">
                    {[1, 2].map((i) => (
                      <div key={i} className={`rounded-xl h-36 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                ) : investorSpotlight.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No investor spotlight this week.</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 exp-investor-grid-lg gap-3">
                      {(showAllInvestors ? investorSpotlight : investorSpotlight.slice(0, 4)).map((investor) => (
                        <div
                          key={investor.id}
                          className={`rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-xl cursor-pointer ${isDark
                            ? 'bg-white/5 border border-white/10'
                            : 'bg-white border border-gray-200 shadow-sm'
                            }`}
                          onClick={() => goToProfile(investor.userId || investor.id, currentUser, navigate)}
                        >
                          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3">
                            {investor.avatarUrl ? (
                              <img src={investor.avatarUrl} alt={investor.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-evoa to-evoa-hover flex items-center justify-center text-white font-bold text-xl">
                                {(investor.fullName || 'I')[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <h3 className={`text-center font-bold text-xs mb-0.5 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {investor.fullName}
                          </h3>
                          <p className={`text-center text-[10px] ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                            {investor.investorProfile?.investorType || 'Investor'}
                          </p>
                        </div>
                      ))}
                    </div>
                    {investorSpotlight.length > 4 && (
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={() => setShowAllInvestors(!showAllInvestors)}
                          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${isDark
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
                        >
                          {showAllInvestors ? 'Show Less' : 'Show More'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
