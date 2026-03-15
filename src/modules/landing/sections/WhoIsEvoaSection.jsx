import { Link } from 'react-router-dom';
import { HiRocketLaunch, HiCurrencyDollar, HiAcademicCap, HiUsers } from 'react-icons/hi2';

export default function WhoIsEvoaSection({ isVisible, isDark, setRef, SectionTitle }) {
  
  // Function to save role to localStorage
  const handleRoleClick = (roleId, roleName) => {
    localStorage.setItem('userRole', roleId);
    localStorage.setItem('userRoleData', JSON.stringify({
      id: roleId,
      name: roleName,
      selectedAt: new Date().toISOString()
    }));
  };

  return (
    <section 
      ref={setRef('userRoles')}
      className={`relative transition-all duration-1000 ease-out ${
        isVisible['whoIsEvoa'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-center mb-6 sm:mb-10 md:mb-12 lg:mb-16 px-4">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 sm:mb-6 backdrop-blur-xl border ${
          isDark 
            ? 'bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]' 
            : 'bg-[#00B8A9]/5 border-[#00B8A9]/20 text-[#00B8A9]'
        }`}>
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">For Everyone</span>
        </div>
        
        <SectionTitle>Get Started - Join EVO-A</SectionTitle>
        
        <p className={`hidden sm:block text-base sm:text-lg md:text-xl max-w-2xl mx-auto mt-4 ${
          isDark ? 'text-white/70' : 'text-gray-600'
        }`}>
          Click on your category to register and join the ecosystem
        </p>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4">
        <div className="hidden md:block">
          <div className="relative mx-auto flex items-center justify-center" 
            style={{ 
              width: 'min(750px, 90vw)', 
              height: 'min(750px, 85vh)', 
              maxWidth: '100%',
              aspectRatio: '1/1'
            }}>
            
            {/* Center Circle */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20
              w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-48 xl:h-48 rounded-full flex flex-col items-center justify-center backdrop-blur-2xl border-3 md:border-4
              shadow-[0_0_60px_rgba(176,255,250,0.3)] ${
              isDark 
                ? 'bg-gradient-to-br from-black/80 via-black/60 to-black/80 border-[#B0FFFA]/40' 
                : 'bg-gradient-to-br from-white/90 via-white/80 to-white/90 border-[#B0FFFA]/50'
            }`}>
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 animate-pulse ${
                isDark ? 'bg-[#B0FFFA]/30' : 'bg-[#00B8A9]/20'
              }`}></div>
              
              <div className="relative z-10 text-center px-2 sm:px-3 md:px-4">
                <div className={`text-2xl md:text-3xl lg:text-4xl font-black mb-1 lg:mb-2 bg-gradient-to-r bg-clip-text text-transparent ${
                  isDark 
                    ? 'from-[#B0FFFA] via-white to-[#80E5FF]' 
                    : 'from-[#00B8A9] via-teal-600 to-[#008C81]'
                }`}>
                  EVO-A
                </div>
                <p className={`text-xs md:text-sm lg:text-base font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                  One Platform
                </p>
                <p className={`text-[10px] md:text-xs lg:text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Four Possibilities
                </p>
              </div>
            </div>

            {/* SVG Circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg 
                width="100%" 
                height="100%"
                viewBox="0 0 750 750"
                className="absolute"
                style={{ 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isDark ? '#B0FFFA' : '#00B8A9'} stopOpacity="0.4" />
                    <stop offset="50%" stopColor={isDark ? '#80E5FF' : '#00E5D0'} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={isDark ? '#B0FFFA' : '#00B8A9'} stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                
                <circle
                  cx="375"
                  cy="375"
                  r="300"
                  fill="none"
                  stroke="url(#circleGradient)"
                  strokeWidth="2.5"
                  strokeDasharray="12 8"
                  strokeLinecap="round"
                  className="animate-dash-rotate"
                  opacity="0.9"
                />
                
                <circle
                  r="5"
                  fill={isDark ? '#B0FFFA' : '#00B8A9'}
                  filter="url(#glow)"
                  opacity="0.8"
                >
                  <animateMotion
                    dur="10s"
                    repeatCount="indefinite"
                    path="M 375,75 a 300,300 0 1,1 0,600 a 300,300 0 1,1 0,-600"
                  />
                </circle>
                
                <circle
                  r="5"
                  fill={isDark ? '#80E5FF' : '#00E5D0'}
                  filter="url(#glow)"
                  opacity="0.8"
                >
                  <animateMotion
                    dur="10s"
                    repeatCount="indefinite"
                    path="M 375,75 a 300,300 0 1,1 0,600 a 300,300 0 1,1 0,-600"
                    begin="-5s"
                  />
                </circle>
                
                <circle
                  r="4"
                  fill={isDark ? '#FFFFFF' : '#008C81'}
                  filter="url(#glow)"
                  opacity="0.6"
                >
                  <animateMotion
                    dur="12s"
                    repeatCount="indefinite"
                    path="M 375,75 a 300,300 0 1,1 0,600 a 300,300 0 1,1 0,-600"
                    begin="-3s"
                  />
                </circle>
              </svg>
            </div>

            {/* Role Cards - Desktop */}
            {[
              { 
                icon: HiRocketLaunch, 
                title: 'For Startups', 
                desc: 'Pitch your vision &<br/>get funded', 
                link: '/register/startup', 
                roleId: 'startup',
                cta: 'Create Account', 
                position: { top: '12%', left: '50%', transform: 'translate(-50%, -50%)' }, 
                delay: '100ms' 
              },
              { 
                icon: HiCurrencyDollar, 
                title: 'For Investors', 
                desc: 'Discover & fund<br/>unicorns', 
                link: '/register/investor', 
                roleId: 'investor',
                cta: 'Join EVO-A', 
                position: { top: '50%', left: '88%', transform: 'translate(-50%, -50%)' }, 
                delay: '250ms' 
              },
              { 
                icon: HiAcademicCap, 
                title: 'For Incubators', 
                desc: 'Nurture & scale<br/>startups', 
                link: '/register/incubator', 
                roleId: 'incubator',
                cta: 'Get Started', 
                position: { top: '88%', left: '50%', transform: 'translate(-50%, -50%)' }, 
                delay: '400ms' 
              },
              { 
                icon: HiUsers, 
                title: 'For Viewers', 
                desc: 'Explore & learn<br/>daily', 
                link: '/register/viewer', 
                roleId: 'viewer',
                cta: 'Start Exploring', 
                position: { top: '50%', left: '12%', transform: 'translate(-50%, -50%)' }, 
                delay: '550ms' 
              }
            ].map((role, index) => (
              <Link 
                key={index}
                to={role.link}
                onClick={() => handleRoleClick(role.roleId, role.title)}
                className={`absolute transition-all duration-700 group/card ${
                  isVisible['whoIsEvoa'] ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{ 
                  ...role.position,
                  transitionDelay: role.delay
                }}
              >
                <div className={`relative rounded-full 
                  w-36 h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-52 xl:h-52
                  flex flex-col items-center justify-center
                  transition-all duration-500 cursor-pointer p-4 lg:p-5
                  hover:scale-110
                  ${
                  isDark 
                    ? 'bg-gradient-to-br from-black/90 to-black/70 backdrop-blur-xl border-2 border-[#B0FFFA]/30 hover:border-[#B0FFFA] shadow-[0_12px_40px_rgba(176,255,250,0.2)] hover:shadow-[0_20px_60px_rgba(176,255,250,0.6)]' 
                    : 'bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-xl border-2 border-[#B0FFFA]/40 hover:border-[#B0FFFA] shadow-[0_12px_40px_rgba(0,184,169,0.15)] hover:shadow-[0_20px_60px_rgba(0,184,169,0.5)]'
                }`}>
                  
                  <div className={`absolute inset-0 rounded-full blur-2xl opacity-0 group-hover/card:opacity-60 transition-opacity duration-500 ${
                    isDark ? 'bg-[#B0FFFA]/40' : 'bg-[#00B8A9]/30'
                  }`}></div>

                  <div className="relative z-10 text-center flex flex-col items-center justify-center gap-2 lg:gap-3 h-full w-full">
                    <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-18 xl:h-18 flex items-center justify-center rounded-full 
                      transition-all duration-500 group-hover/card:scale-110 flex-shrink-0 ${
                      isDark 
                        ? 'bg-[#B0FFFA]/20 group-hover/card:bg-[#B0FFFA]/30' 
                        : 'bg-[#B0FFFA]/30 group-hover/card:bg-[#B0FFFA]/40'
                    }`}>
                      <role.icon className={`text-2xl md:text-3xl lg:text-4xl transition-all ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <h3 className={`text-sm md:text-base lg:text-lg xl:text-xl font-bold transition-all duration-300 ${
                        isDark 
                          ? 'text-white group-hover/card:text-[#B0FFFA]' 
                          : 'text-black group-hover/card:text-[#00B8A9]'
                      }`}>
                        {role.title}
                      </h3>
                      
                      <p className={`text-[10px] md:text-xs lg:text-sm leading-relaxed transition-all duration-300 ${
                        isDark 
                          ? 'text-white/70 group-hover/card:text-white/90' 
                          : 'text-black/70 group-hover/card:text-black/90'
                      }`} dangerouslySetInnerHTML={{ __html: role.desc }} />
                    </div>

                    <div className={`transition-all duration-500 transform
                      opacity-0 scale-75 max-h-0 overflow-hidden
                      group-hover/card:opacity-100 group-hover/card:scale-100 group-hover/card:max-h-20`}>
                      <div className={`px-4 lg:px-5 py-1.5 lg:py-2 rounded-full text-[10px] md:text-xs lg:text-sm font-bold whitespace-nowrap ${
                        isDark 
                          ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black' 
                          : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white'
                      }`}>
                        {role.cta}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4 sm:space-y-6">
          {[
            { icon: HiRocketLaunch, title: 'For Startups', desc: 'Pitch your vision & get funded', link: '/register/startup', roleId: 'startup', cta: 'Create Account' },
            { icon: HiCurrencyDollar, title: 'For Investors', desc: 'Discover & fund unicorns', link: '/register/investor', roleId: 'investor', cta: 'Join EVO-A' },
            { icon: HiAcademicCap, title: 'For Incubators', desc: 'Nurture & scale startups', link: '/register/incubator', roleId: 'incubator', cta: 'Get Started' },
            { icon: HiUsers, title: 'For Viewers', desc: 'Explore & learn daily', link: '/register/viewer', roleId: 'viewer', cta: 'Start Exploring' }
          ].map((role, index) => (
            <div
              key={index}
              className={`group relative w-full max-w-sm mx-auto transition-all duration-700 ${
                isVisible['whoIsEvoa'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`relative p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-xl border-2 transition-all duration-500 hover:scale-105 active:scale-95 ${
                isDark 
                  ? 'bg-gradient-to-br from-black/80 via-black/60 to-black/80 border-[#B0FFFA]/30 hover:border-[#B0FFFA]/60 shadow-[0_12px_40px_rgba(176,255,250,0.2)]' 
                  : 'bg-gradient-to-br from-white/95 via-white/85 to-white/95 border-[#B0FFFA]/40 hover:border-[#B0FFFA]/70 shadow-[0_12px_40px_rgba(0,184,169,0.15)]'
              }`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl ${
                    isDark 
                      ? 'bg-gradient-to-br from-[#B0FFFA]/30 to-[#80E5FF]/30' 
                      : 'bg-gradient-to-br from-[#B0FFFA]/40 to-[#80E5FF]/40'
                  }`}>
                    <role.icon className={`text-2xl sm:text-2xl md:text-3xl ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                      {role.title}
                    </h3>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-white/70' : 'text-black/70'}`}>
                      {role.desc}
                    </p>
                  </div>
                </div>
                <Link 
                  to={role.link}
                  onClick={() => handleRoleClick(role.roleId, role.title)}
                  className={`mt-3 sm:mt-4 block w-full text-center px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                    isDark 
                      ? 'bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black' 
                      : 'bg-gradient-to-r from-[#00B8A9] to-[#008C81] text-white'
                  }`}
                >
                  {role.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
