import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { FaSearch, FaFire, FaTrophy, FaEye, FaPlay, FaArrowLeft } from "react-icons/fa";
import { HiSun, HiMoon } from "react-icons/hi";
import logo from "../../assets/logo.avif";
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
  const { theme, toggleTheme } = useTheme();
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
        const res = await exploreService.search({ q: debouncedSearch, type: 'startups' });
        const results = res?.data?.data || res?.data || [];
        setSearchResults(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    doSearch();
  }, [debouncedSearch]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
      <div className="pt-4 sm:pt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => navigate(-1)}
                  className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all active:scale-95 ${isDark
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  title="Go Back"
                >
                  <FaArrowLeft size={18} className="sm:hidden" />
                  <FaArrowLeft size={20} className="hidden sm:block" />
                </button>
                <img src={logo} alt="EVO-A" className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-xl flex-shrink-0" />
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${isDark ? 'text-white' : 'text-black'}`}>
                  Explore
                </h1>
              </div>

              <button
                onClick={toggleTheme}
                className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 hover:scale-110 flex-shrink-0 ml-2 ${isDark
                  ? 'text-white/70 hover:text-[#B0FFFA] hover:bg-white/10 border border-[#B0FFFA]/20'
                  : 'text-gray-600 hover:text-[#00B8A9] hover:bg-gray-100 border border-[#00B8A9]/20'
                  }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <>
                    <HiSun size={20} className="sm:hidden" style={{ animation: 'spin-slow 3s linear infinite' }} />
                    <HiSun size={22} className="hidden sm:block" style={{ animation: 'spin-slow 3s linear infinite' }} />
                  </>
                ) : (
                  <>
                    <HiMoon size={20} className="sm:hidden" />
                    <HiMoon size={22} className="hidden sm:block" />
                  </>
                )}
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-white/50' : 'text-gray-500'}`} size={18} />
              <input
                type="text"
                placeholder="Search investors, startups, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm border transition-all focus:outline-none focus:ring-1 ${isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30 focus:bg-white/10'
                  : 'bg-white border-gray-200 text-black placeholder-gray-400 focus:border-[#00B8A9] focus:ring-[#00B8A9]/30 focus:shadow-md'
                  }`}
              />
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="mb-10">
              <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Search Results
              </h2>
              {searchLoading ? (
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Searching...</div>
              ) : searchResults && searchResults.length === 0 ? (
                <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No results for "{searchQuery}"</div>
              ) : searchResults ? (
                <div className="space-y-3">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/profile/${item.id}`)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                        {item.logoUrl ? (
                          <img src={item.logoUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-sm">
                            {(item.name || 'U')[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                        {item.tagline && <p className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{item.tagline}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Trending Hash Tags */}
          {!searchQuery.trim() && (
            <>
              <div className="mb-10">
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Trending Tags
                </h2>
                <div className="flex flex-wrap gap-3">
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
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${isDark
                        ? 'bg-white/10 text-white hover:bg-[#00B8A9]/20 hover:text-[#00B8A9] hover:border hover:border-[#00B8A9]/30 hover:scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-[#00B8A9]/10 hover:text-[#00B8A9] hover:border hover:border-[#00B8A9]/30 hover:scale-105'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Top Performing Pitches */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <FaTrophy className={isDark ? 'text-yellow-400' : 'text-yellow-600'} size={20} />
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Top Performing Pitch
                  </h2>
                </div>
                {loadingData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2].map((i) => (
                      <div key={i} className={`rounded-2xl h-56 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                ) : topPitches.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No top pitches yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {topPitches.map((pitch) => (
                      <div
                        key={pitch.id}
                        onClick={() => navigate(`/pitch/${pitch.id}`)}
                        className={`rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl ${isDark
                          ? 'bg-white/5 border border-white/10 hover:border-[#00B8A9]/30'
                          : 'bg-white border border-gray-200 hover:border-[#00B8A9]/30 shadow-md'
                          }`}
                      >
                        <div className="relative h-56">
                          <img
                            src={pitch.thumbnailUrl || pitch.image || 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800'}
                            alt={pitch.title || pitch.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end p-5">
                            <div className="w-full">
                              <h3 className="text-white font-bold text-lg mb-1">{pitch.title || pitch.name}</h3>
                              <p className="text-white/90 text-sm mb-2">{pitch.startup?.name || pitch.company}</p>
                              <div className="flex items-center gap-2">
                                <FaEye className="text-white/70" size={14} />
                                <span className="text-white/70 text-xs font-medium">
                                  {(pitch.viewCount || pitch.views || 0).toLocaleString()} views
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="absolute top-4 right-4">
                            <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                              <FaPlay className="text-white" size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Startups of the Week */}
              <div className="mb-10">
                <h2 className={`text-xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Startups of the Week
                </h2>
                {loadingData ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`rounded-xl h-32 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                ) : startupsOfWeek.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No featured startups this week.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {startupsOfWeek.map((startup) => (
                      <div
                        key={startup.id}
                        onClick={() => navigate(`/profile/${startup.id}`)}
                        className={`rounded-xl p-5 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${isDark
                          ? 'bg-white/5 border border-white/10 hover:border-[#00B8A9]/30'
                          : 'bg-white border border-gray-200 hover:border-[#00B8A9]/30 shadow-sm'
                          }`}
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 ring-2 ring-offset-2 ring-offset-transparent ring-gray-300/20 bg-gradient-to-br from-[#00B8A9] to-[#00A89A]">
                          {startup.logoUrl ? (
                            <img src={startup.logoUrl} alt={startup.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                              {(startup.name || 'S')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className={`text-center font-bold text-sm mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {startup.name}
                        </h3>
                        <p className={`text-center text-xs truncate ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          {startup.sector || startup.industry}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Investor Spotlight */}
              <div className="mb-10">
                <h2 className={`text-xl font-bold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Investor Spotlight
                </h2>
                {loadingData ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`rounded-xl h-40 animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                ) : investorSpotlight.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>No investor spotlight this week.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {investorSpotlight.map((investor) => (
                      <div
                        key={investor.id}
                        className={`rounded-xl p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${isDark
                          ? 'bg-white/5 border border-white/10 hover:border-[#00B8A9]/30'
                          : 'bg-white border border-gray-200 hover:border-[#00B8A9]/30 shadow-sm'
                          }`}
                      >
                        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-offset-2 ring-offset-transparent ring-gray-300/20">
                          {investor.avatarUrl ? (
                            <img src={investor.avatarUrl} alt={investor.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#00B8A9] to-[#00A89A] flex items-center justify-center text-white font-bold text-2xl">
                              {(investor.fullName || 'I')[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <h3 className={`text-center font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {investor.fullName}
                        </h3>
                        <p className={`text-center text-sm mb-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                          {investor.investorProfile?.investorType || 'Investor'}
                        </p>
                        {investor.investorProfile?.totalInvestments > 0 && (
                          <p className={`text-center text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {investor.investorProfile.totalInvestments} Investments
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Battleground Spotlight */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-5">
                  <FaFire className={isDark ? 'text-orange-400' : 'text-orange-600'} size={20} />
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Battleground Spotlight
                  </h2>
                </div>
                <div className={`rounded-2xl p-8 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xl ${isDark
                  ? 'bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/40'
                  : 'bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 shadow-md'
                  }`}>
                  <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Live Pitch Battle
                  </h3>
                  <p className={`text-base mb-6 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    Watch startups compete for investment in real-time
                  </p>
                  <button
                    onClick={() => navigate('/battleground')}
                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all bg-[#00B8A9] text-white hover:bg-[#00A89A] shadow-lg shadow-[#00B8A9]/30 transform hover:scale-105 hover:shadow-xl hover:shadow-[#00B8A9]/40 active:scale-95"
                  >
                    <FaPlay size={16} />
                    Watch Live
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
