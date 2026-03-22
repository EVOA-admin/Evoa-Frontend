import { useEffect, useRef, useState } from 'react';

// How It Works Steps
const howItWorksSteps = [
  {
    step: '01',
    title: 'Create Your Account',
    desc: 'Sign up with email/phone, choose your role – Startup, Investor, Incubator, or Viewer.',
    iconName: 'HiUserGroup'
  },
  {
    step: '02',
    title: 'Complete Your Profile',
    desc: 'Startups: founder details, verification & pitch. Investors: ticket size, sector focus, verification. Incubators: program & documents.',
    iconName: 'HiClipboardDocumentCheck'
  },
  {
    step: '03',
    title: 'Pitch & Discover',
    desc: 'Discover pitches from Home feed, Explore page, and Battleground. Watch pitch reels, like, comment, share, and support.',
    iconName: 'HiMagnifyingGlass'
  },
  {
    step: '04',
    title: 'Connect & Close Deals',
    desc: 'Comments, messages, offers, battlegrounds – all lead you to real conversations and deals.',
    iconName: 'HiChatBubbleLeftRight'
  }
];

export default function HowItWorksSection({ isVisible, isDark, setRef, SectionTitle, getIcon }) {
  return (
    <section 
      ref={setRef('howItWorks')}
      className={`relative transition-all duration-1000 ease-out ${
        isVisible['howItWorks'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="text-center mb-6 sm:mb-10 md:mb-12 lg:mb-16 px-4">
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 sm:mb-6 backdrop-blur-xl border ${
          isDark 
            ? 'bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]' 
            : 'bg-[#00B8A9]/5 border-[#00B8A9]/20 text-[#00B8A9]'
        }`}>
          <span className="text-xs sm:text-sm font-bold tracking-wider uppercase">Simple Process</span>
        </div>
        <SectionTitle>How It Works</SectionTitle>
        <p className={`hidden sm:block text-base sm:text-lg md:text-xl max-w-2xl mx-auto mt-4 ${
          isDark ? 'text-white/70' : 'text-gray-600'
        }`}>
          Get started in four simple steps
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 relative z-10">
          {howItWorksSteps.map((step, index) => (
            <div
              key={index}
              className={`group relative p-4 sm:p-5 md:p-6 lg:p-8 rounded-xl sm:rounded-2xl transition-all duration-500 overflow-visible ${
                isVisible['howItWorks'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              } ${
                isDark 
                  ? 'bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-xl' 
                  : 'bg-gradient-to-br from-white/90 via-white/70 to-white/90 backdrop-blur-xl'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              {/* Starting line before card 01 with circle */}
              {index === 0 && (
                <div 
                  className="hidden lg:block absolute pointer-events-none"
                  style={{
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '2rem',
                    marginRight: '0.5rem'
                  }}
                >
                  <svg
                    width="100%"
                    height="12"
                    viewBox="0 0 32 12"
                    preserveAspectRatio="none"
                    style={{ display: 'block' }}
                  >
                    {/* Starting circle */}
                    <circle
                      cx="6"
                      cy="6"
                      r="5"
                      fill={isDark ? 'rgba(176, 255, 250, 0.8)' : 'rgba(0, 184, 169, 0.8)'}
                    />
                    {/* Line */}
                    <line
                      x1="11"
                      y1="6"
                      x2="32"
                      y2="6"
                      stroke={isDark ? 'rgba(176, 255, 250, 0.5)' : 'rgba(0, 184, 169, 0.5)'}
                      strokeWidth="2"
                      strokeDasharray="4 6"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              {/* Alternating upper and lower borders */}
              <div 
                className={`absolute -inset-1 rounded-2xl pointer-events-none ${
                  isDark 
                    ? 'border-2 border-dashed border-[#B0FFFA]/50' 
                    : 'border-2 border-dashed border-[#00B8A9]/50'
                }`}
                style={{
                  clipPath: index % 2 === 0 
                    ? 'polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)' 
                    : 'polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%)'
                }}
              />

              {/* Connecting lines between cards */}
              {index < 3 && (
                <>
                  {/* Desktop Horizontal Line */}
                  <div 
                    className="hidden lg:block absolute pointer-events-none"
                    style={{
                      left: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 'calc(2rem + 0.5rem)',
                      marginLeft: '0.5rem'
                    }}
                  >
                    <svg
                      width="100%"
                      height="12"
                      viewBox="0 0 32 12"
                      preserveAspectRatio="none"
                      style={{ display: 'block' }}
                    >
                      <line
                        x1="0"
                        y1="6"
                        x2="32"
                        y2="6"
                        stroke={isDark ? 'rgba(176, 255, 250, 0.5)' : 'rgba(0, 184, 169, 0.5)'}
                        strokeWidth="2"
                        strokeDasharray="4 6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  
                  {/* Mobile/Tablet Vertical Line */}
                  <div 
                    className="block lg:hidden absolute pointer-events-none"
                    style={{
                      top: '100%',
                      left: '2rem',
                      height: '1.25rem', // represents the gap
                      width: '2px',
                    }}
                  >
                    <svg
                      width="2"
                      height="100%"
                      preserveAspectRatio="none"
                      style={{ display: 'block' }}
                    >
                      <line
                        x1="1"
                        y1="0"
                        x2="1"
                        y2="100%"
                        stroke={isDark ? 'rgba(176, 255, 250, 0.5)' : 'rgba(0, 184, 169, 0.5)'}
                        strokeWidth="2"
                        strokeDasharray="4 6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </>
              )}

              {/* Ending line after card 04 with circle */}
              {index === 3 && (
                <div 
                  className="hidden lg:block absolute pointer-events-none"
                  style={{
                    left: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '2rem',
                    marginLeft: '0.5rem'
                  }}
                >
                  <svg
                    width="100%"
                    height="12"
                    viewBox="0 0 32 12"
                    preserveAspectRatio="none"
                    style={{ display: 'block' }}
                  >
                    {/* Line */}
                    <line
                      x1="0"
                      y1="6"
                      x2="21"
                      y2="6"
                      stroke={isDark ? 'rgba(176, 255, 250, 0.5)' : 'rgba(0, 184, 169, 0.5)'}
                      strokeWidth="2"
                      strokeDasharray="4 6"
                      strokeLinecap="round"
                    />
                    {/* Ending circle */}
                    <circle
                      cx="26"
                      cy="6"
                      r="5"
                      fill={isDark ? 'rgba(176, 255, 250, 0.8)' : 'rgba(0, 184, 169, 0.8)'}
                    />
                  </svg>
                </div>
              )}
              
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-2xl"></div>
              
              <div className="relative z-10">
                {/* Step number */}
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-4 md:mb-5 flex items-baseline">
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {step.step.charAt(0)}
                  </span>
                  <span
                    className={`bg-gradient-to-br ${
                      isDark
                        ? 'from-[#B0FFFA]/30 to-[#80E5FF]/30 bg-clip-text text-transparent'
                        : 'from-[#00B8A9] to-[#008C81] bg-clip-text text-transparent'
                    }`}
                  >
                    {step.step.charAt(1)}
                  </span>
                </div>

                {/* Center icon removed */}
                {/*
                <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mb-3 sm:mb-4 md:mb-5 rounded-xl sm:rounded-2xl transition-all duration-500 ${
                  isDark 
                    ? 'bg-gradient-to-br from-[#B0FFFA]/20 to-[#80E5FF]/20 shadow-lg shadow-[#B0FFFA]/10' 
                    : 'bg-gradient-to-br from-[#B0FFFA]/25 to-[#80E5FF]/25 shadow-lg shadow-[#00B8A9]/10'
                }`}>
                  <div className={`${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'} text-xl sm:text-2xl md:text-3xl transition-transform duration-300`}>
                    {getIcon(step.iconName, 'text-xl sm:text-2xl')}
                  </div>
                </div>
                */}

                {/* Title single line */}
                <h3
                  className={`text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 whitespace-nowrap transition-all duration-300 ${
                    isDark ? 'text-white group-hover:text-[#B0FFFA]' : 'text-gray-900 group-hover:text-[#00B8A9]'
                  }`}
                >
                  {step.title}
                </h3>
                
                <p
                  className={`text-sm sm:text-base md:text-lg leading-relaxed transition-colors duration-300 ${
                    isDark ? 'text-white/80' : 'text-gray-700'
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
