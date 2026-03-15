// Product Dashboard Mockup Illustration
function DashboardIllustration({ isDark }) {
  return (
    <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 opacity-10 pointer-events-none z-0">
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <defs>
          <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? '#B0FFFA' : '#00B8A9'} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isDark ? '#80E5FF' : '#008C81'} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {/* Dashboard frame */}
        <rect x="20" y="20" width="360" height="260" rx="8" fill={isDark ? 'rgba(176,255,250,0.1)' : 'rgba(0,184,169,0.1)'} stroke={isDark ? '#B0FFFA' : '#00B8A9'} strokeWidth="2" opacity="0.3" />
        {/* Dashboard elements */}
        <rect x="40" y="50" width="120" height="80" rx="4" fill={isDark ? 'rgba(176,255,250,0.15)' : 'rgba(0,184,169,0.15)'} />
        <rect x="180" y="50" width="120" height="80" rx="4" fill={isDark ? 'rgba(176,255,250,0.15)' : 'rgba(0,184,169,0.15)'} />
        <rect x="320" y="50" width="40" height="80" rx="4" fill={isDark ? 'rgba(176,255,250,0.15)' : 'rgba(0,184,169,0.15)'} />
        <rect x="40" y="150" width="320" height="100" rx="4" fill={isDark ? 'rgba(176,255,250,0.1)' : 'rgba(0,184,169,0.1)'} />
        {/* Chart lines */}
        <polyline
          points="60,200 100,180 140,190 180,170 220,175 260,165 300,160 340,155"
          fill="none"
          stroke={isDark ? '#B0FFFA' : '#00B8A9'}
          strokeWidth="2"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}

export default function PowerfulFeaturesSection({ isVisible, isDark, setRef }) {
  const features = [
    { title: 'Instant AI-Powered Matching', desc: 'AI-powered connections match startups with the right investors and incubators effortlessly.', side: 'right' },
    { title: 'Secure Enterprise-Grade Platform', desc: 'Robust security and verification systems keep your data protected and reliable at every scale.', side: 'left' },
    { title: 'Instant & Reliable Pitch Creation', desc: 'Generate high-quality pitch videos and decks instantly with consistent performance you can trust.', side: 'right' },
    { title: 'Smart Discovery & Search', desc: 'Find hundreds of quality startups, investors, and opportunities at once to save time.', side: 'left' },
    { title: 'Real-Time Notifications & Updates', desc: 'Stay connected with instant alerts for offers, messages, battlegrounds, and trending updates.', side: 'right' },
    { title: 'Analytics & Performance Insights', desc: 'Access detailed engagement insights anytime with easy-to-track performance metrics and reports.', side: 'left' }
  ];

  return (
    <section 
      ref={setRef('powerfulFeatures')}
      className={`relative transition-all duration-1000 ease-out ${
        isVisible['powerfulFeatures'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-center mb-4 sm:mb-8 md:mb-10 lg:mb-12 px-4">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 sm:mb-6 backdrop-blur-xl border ${
          isDark 
            ? 'bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]' 
            : 'bg-[#00B8A9]/5 border-[#00B8A9]/20 text-[#00B8A9]'
        }`}>
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">Powerful Features</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          One Platform.  {' '}
          <span className={`underline decoration-2 underline-offset-4 ${
            isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'
          }`}>
           Zero Noise.
          </span>
        </h2>
        <p className={`hidden sm:block text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          A powerful platform designed to simplify startup-investor connections, pitch management, and deal tracking.
        </p>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <DashboardIllustration isDark={isDark} />
        {/* Vertical Dashed Timeline */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 transform -translate-x-1/2 z-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke={isDark ? 'rgba(176, 255, 250, 0.4)' : 'rgba(0, 184, 169, 0.4)'}
              strokeWidth="2"
              strokeDasharray="8,8"
              className="animate-dash"
            />
            
            <circle
              r="5"
              cx="50%"
              cy="0%"
              fill={isDark ? '#B0FFFA' : '#00B8A9'}
              opacity="0.9"
            >
              <animate
                attributeName="cy"
                from="0%"
                to="100%"
                dur="8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="8s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>

        {/* Mobile: Card-based layout */}
        <div className="md:hidden space-y-4 relative">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative p-4 sm:p-5 rounded-xl transition-all duration-700 transform ${
                isVisible['powerfulFeatures'] 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-6 scale-95'
              } ${
                isDark 
                  ? 'bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl border border-[#B0FFFA]/20' 
                  : 'bg-gradient-to-br from-white/90 via-white/80 to-white/90 backdrop-blur-xl border border-[#B0FFFA]/30'
              } shadow-lg`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Animated gradient overlay */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-xl"></div>
              
              <div className="relative z-10">
                {/* Number indicator */}
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-3 ${
                  isDark ? 'bg-[#B0FFFA]/20 text-[#B0FFFA]' : 'bg-[#00B8A9]/20 text-[#00B8A9]'
                } text-sm font-bold`}>
                  {index + 1}
                </div>
                
                {/* Visual SVG Block mimicking abstract UI */}
                <div className={`w-full h-24 mb-4 rounded-lg flex items-center justify-center border ${
                  isDark ? 'bg-black/30 border-[#B0FFFA]/10' : 'bg-gray-50 border-[#00B8A9]/10'
                }`}>
                  <svg className={`w-12 h-12 opacity-80 ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} fill="currentColor" viewBox="0 0 24 24">
                    {/* Abstract illustration relying on index to slightly vary the icon look */}
                    {index % 3 === 0 && <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h5v2H8v-2z" />}
                    {index % 3 === 1 && <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.8l5.5 5.2H16v7h-3v-6H11v6H8v-7H6.5L12 5.8z" />}
                    {index % 3 === 2 && <path d="M11 2v4.3c-2.8.5-5 2.7-5.5 5.5H1v2h4.5c.5 2.8 2.7 5 5.5 5.5V23h2v-3.7c2.8-.5 5-2.7 5.5-5.5H23v-2h-4.5c-.5-2.8-2.7-5-5.5-5.5V2h-2zm1 6.3c1.9 0 3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5S8.5 13.7 8.5 11.8s1.6-3.5 3.5-3.5z" />}
                  </svg>
                </div>
                
                <h3 className={`text-lg sm:text-xl font-bold mb-3 transition-all duration-300 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Timeline layout */}
        <div className="hidden md:block space-y-12 md:space-y-16 lg:space-y-20 relative">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`relative flex flex-col md:flex-row items-start md:items-center transition-all duration-700 ${
                isVisible['powerfulFeatures'] 
                  ? 'opacity-100 translate-x-0' 
                  : feature.side === 'right' ? 'opacity-0 translate-x-8' : 'opacity-0 -translate-x-8'
              }`} 
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              {feature.side === 'left' ? (
                <>
                  <div className="w-full md:w-1/2 md:pr-8 md:text-right mb-4 md:mb-0">
                    <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-base sm:text-lg md:text-xl leading-relaxed ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {feature.desc}
                    </p>
                  </div>
                  <div className={`hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 z-10 ${
                    isDark ? 'bg-black border-[#B0FFFA]' : 'bg-white border-[#00B8A9]'
                  }`}></div>
                  <div className="hidden md:block md:w-1/2 md:pl-8"></div>
                </>
              ) : (
                <>
                  <div className="hidden md:block md:w-1/2 md:pr-8"></div>
                  <div className={`hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 z-10 ${
                    isDark ? 'bg-black border-[#B0FFFA]' : 'bg-white border-[#00B8A9]'
                  }`}></div>
                  <div className="w-full md:w-1/2 md:pl-8 md:text-left">
                    <h3 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-base sm:text-lg md:text-xl leading-relaxed ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {feature.desc}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
