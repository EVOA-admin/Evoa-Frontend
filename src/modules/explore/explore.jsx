import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { FaSearch, FaFire, FaTrophy, FaEye, FaPlay } from "react-icons/fa";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import exploreService from "../../services/exploreService";

// Debounce helper — avoids API call on every keystroke
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Explore() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [topPitches, setTopPitches] = useState([]);
  const [startupsOfWeek, setStartupsOfWeek] = useState([]);
  const [investorSpotlight, setInvestorSpotlight] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Fetch all explore sections on mount
  useEffect(() => {
    const fetchExploreData = async () => {
      setLoadingData(true);
      try {
        const [hashtagsRes, topRes, weekRes, spotlightRes] = await Promise.allSettled([
          exploreService.getTrendingHashtags(),
          exploreService.getTopStartups(),
          exploreService.getStartupsOfWeek(),
          exploreService.getInvestorSpotlight(),
        ]);

        if (hashtagsRes.status === 'fulfilled' && hashtagsRes.value?.data) {
          const tags = hashtagsRes.value.data?.data || hashtagsRes.value.data;
          setTrendingHashtags(Array.isArray(tags) ? tags : []);
        }
        if (topRes.status === 'fulfilled' && topRes.value?.data) {
          const pitches = topRes.value.data?.data || topRes.value.data;
          setTopPitches(Array.isArray(pitches) ? pitches : []);
        }
        if (weekRes.status === 'fulfilled' && weekRes.value?.data) {
          const startups = weekRes.value.data?.data || weekRes.value.data;
          setStartupsOfWeek(Array.isArray(startups) ? startups : []);
        }
        if (spotlightRes.status === 'fulfilled' && spotlightRes.value?.data) {
          const investors = spotlightRes.value.data?.data || spotlightRes.value.data;
          setInvestorSpotlight(Array.isArray(investors) ? investors : []);
        }
      } catch (err) {
        console.error('Failed to fetch explore data:', err);
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
    <AppShell>
      <AppHeader title="Explore" />
      <div className="px-3 py-4">

        {/* Search Bar */}
        <div className="relative mb-5">
          <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/50' : 'text-gray-500'}`} size={15} />
          <input
            type="text"
            placeholder="Search investors, startups, hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm border transition-all focus:outline-none focus:ring-1 ${isDark
              ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30'
              : 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30 shadow-sm'
              }`}
          />
          {searchLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
          )}
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
                          className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#00B8A9]/20 text-[#00B8A9] hover:bg-[#00B8A9]/30 transition-colors"
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
                              : <div className="w-full h-full bg-gradient-to-br from-[#00B8A9]/30 to-gray-800 flex items-center justify-center"><FaPlay className="text-white/40" size={22} /></div>
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
                    <div className="space-y-2">
                      {searchResults.startups.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => navigate(`/u/${item.founder?.id || item.id}`)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                        >
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                            {item.logoUrl
                              ? <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-sm">{(item.name || 'U')[0].toUpperCase()}</div>
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
                    <div className="space-y-2">
                      {searchResults.investors.map((item) => {
                        const avatarSrc = item.logoUrl || item.user?.avatarUrl;
                        const displayName = item.name || item.user?.fullName || 'Investor';
                        return (
                          <div
                            key={item.id}
                            onClick={() => navigate(`/u/${item.userId || item.user?.id || item.id}`)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              {avatarSrc
                                ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-sm">{displayName[0].toUpperCase()}</div>
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
                            onClick={() => navigate(`/u/${item.userId || item.user?.id || item.id}`)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              {avatarSrc
                                ? <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-sm">{displayName[0].toUpperCase()}</div>
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
                          onClick={() => navigate(`/u/${item.id}`)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'}`}
                        >
                          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                            {item.avatarUrl
                              ? <img src={item.avatarUrl} alt={item.fullName} className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-sm">{(item.fullName || 'U')[0].toUpperCase()}</div>
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
            {/* Trending Tags */}
            <div className="mb-8">
              <h2 className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Trending Tags
              </h2>
              <div className="flex flex-wrap gap-2">
                {(trendingHashtags.length > 0
                  ? trendingHashtags.map((t) => typeof t === 'string' ? t : `#${t.tag || t.name}`)
                  : ['#AI', '#HealthTech', '#BharatFirst', '#FinTech', '#EdTech', '#GreenTech']
                ).map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const raw = tag.replace(/^#/, '');
                      navigate(`/pitch/hashtag?hashtag=${encodeURIComponent(raw)}`);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isDark
                      ? 'bg-white/10 text-white hover:bg-[#00B8A9]/20 hover:text-[#00B8A9]'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#00B8A9]/10 hover:text-[#00B8A9]'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Top Performing Pitches */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <FaTrophy className={isDark ? 'text-yellow-400' : 'text-yellow-600'} size={16} />
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Top Performing Pitch
                </h2>
              </div>
              {loadingData ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className={`rounded-2xl h-44 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                  ))}
                </div>
              ) : topPitches.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No top pitches yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {topPitches.map((pitch) => (
                    <div
                      key={pitch.id}
                      onClick={() => navigate(`/pitch/${pitch.id}`)}
                      className={`rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] ${isDark
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-white border border-gray-200 shadow-md'
                        }`}
                    >
                      <div className="relative h-44">
                        <img
                          src={pitch.thumbnailUrl || pitch.image || 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={pitch.title || pitch.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-4">
                          <div className="w-full">
                            <h3 className="text-white font-bold text-base mb-0.5">{pitch.title || pitch.name}</h3>
                            <p className="text-white/80 text-xs">{pitch.startup?.name || pitch.company}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <FaEye className="text-white/70" size={11} />
                              <span className="text-white/70 text-xs">{(pitch.viewCount || pitch.views || 0).toLocaleString()} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-3 right-3">
                          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <FaPlay className="text-white" size={12} />
                          </div>
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
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`rounded-xl h-28 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                  ))}
                </div>
              ) : startupsOfWeek.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No featured startups this week.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {startupsOfWeek.map((startup) => (
                    <div
                      key={startup.id}
                      onClick={() => navigate(`/profile/${startup.id}`)}
                      className={`rounded-xl p-4 cursor-pointer transition-all hover:scale-105 ${isDark
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 bg-gradient-to-br from-[#00B8A9] to-[#00A89A]">
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
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((i) => (
                    <div key={i} className={`rounded-xl h-36 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                  ))}
                </div>
              ) : investorSpotlight.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No investor spotlight this week.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {investorSpotlight.map((investor) => (
                    <div
                      key={investor.id}
                      className={`rounded-xl p-4 transition-all ${isDark
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-white border border-gray-200 shadow-sm'
                        }`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-3">
                        {investor.avatarUrl ? (
                          <img src={investor.avatarUrl} alt={investor.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-xl">
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
              )}
            </div>

            {/* Battleground Spotlight */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <FaFire className={isDark ? 'text-orange-400' : 'text-orange-600'} size={16} />
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Battleground Spotlight
                </h2>
              </div>
              <div className={`rounded-2xl p-6 cursor-pointer transition-all ${isDark
                ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/40'
                : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 shadow-md'
                }`}>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Live Pitch Battle
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  Watch startups compete for investment in real-time
                </p>
                <button
                  onClick={() => navigate('/battleground')}
                  className="px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all bg-[#00B8A9] text-white hover:bg-[#00A89A] text-sm"
                >
                  <FaPlay size={12} />
                  Watch Live
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
