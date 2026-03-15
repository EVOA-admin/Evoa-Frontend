import React from 'react';
import { HiSparkles, HiShoppingBag, HiUsers, HiBriefcase, HiTicket } from 'react-icons/hi2';

// Industries Data
const industriesData = [
  {
    id: 1,
    title: 'Early-Stage Innovation',
    icon: HiSparkles,
  },
  {
    id: 2,
    title: 'Growth-Stage Ventures',
    icon: HiShoppingBag,
  },
  {
    id: 3,
    title: 'Enterprise & Corporates',
    icon: HiUsers,
  },
  {
    id: 4,
    title: 'Investors & Funds',
    icon: HiBriefcase,
  },
  {
    id: 5,
    title: 'Accelerators & Hubs',
    icon: HiTicket,
  },
];

export default function OnePlatformSection({ isVisible, isDark, setRef }) {
  return (
    <section
  ref={setRef?.('userJourney')}
  className={`relative py-10 md:py-20 transition-all duration-1000
    ${isVisible?.userJourney ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
  `}
>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            One Platform for <span style={{ color: '#00B8A9' }}>Powering the Startup Economy.</span>
          </h2>
          <p className={`hidden sm:block text-base md:text-lg max-w-3xl mx-auto ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            EVO-A is designed to support every layer of the startup journey — from idea discovery to funded growth — across sectors, stages, and communities.
          </p>
        </div>

        {/* Trusted Box with connecting line */}
        <div className="flex justify-center mb-0">
          <div className="relative inline-block">
            {/* Teal Box */}
            <div 
              className="rounded-2xl px-6 py-4 md:px-10 md:py-6 shadow-xl transform transition-all duration-300 hover:scale-105 relative z-10"
              style={{
                background: 'linear-gradient(to right, #00B8A9, #009688)'
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <HiUsers className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg whitespace-nowrap">
                  Active Across the Startup Landscape
                </h3>
              </div>
            </div>

            {/* Vertical Dotted Line from box to horizontal line */}
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 top-full w-0.5 h-24 hidden lg:block"
              style={{
                borderLeft: `2px dashed ${isDark ? '#374151' : '#D1D5DB'}`
              }}
            ></div>
          </div>
        </div>

        {/* Industry Cards Container */}
        <div className="relative mt-12 lg:mt-24 max-w-6xl mx-auto">
          
          {/* Cards Grid Wrapper with Horizontal Line */}
          <div className="relative">
            
            {/* Horizontal Dotted Line */}
            <div 
              className="absolute hidden lg:block z-0"
              style={{
                borderTop: `2px dashed ${isDark ? '#374151' : '#D1D5DB'}`,
                left: '9.1%',
                right: '9.1%',
                top: '0'
              }}
            ></div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative pt-0 lg:pt-24">
              {industriesData.map((industry, index) => {
                const Icon = industry.icon;
                return (
                  <div key={industry.id} className="relative flex flex-col items-center">
                    
                    {/* Vertical Line from horizontal line to card */}
                    <div 
                      className="absolute left-1/2 transform -translate-x-1/2 w-0.5 hidden lg:block"
                      style={{
                        borderLeft: `2px dashed ${isDark ? '#374151' : '#D1D5DB'}`,
                        height: '96px',
                        top: '-96px'
                      }}
                    ></div>
                    
                    {/* Industry Card - Fully Transparent */}
                    <div 
                      className={`w-full border-2 rounded-xl p-6 transform transition-all duration-300 hover:scale-105 cursor-pointer group card-transparent ${
                        isDark 
                          ? 'border-gray-800' 
                          : 'border-gray-200'
                      }`}
                      style={{
                        animation: isVisible?.userJourney ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00B8A9'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = isDark ? '#1f2937' : '#e5e7eb'}
                    >
                      <div className="flex flex-col items-center text-center gap-4">
                        {/* Icon Circle */}
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                          style={{
                            backgroundColor: isDark ? 'rgba(0, 184, 169, 0.2)' : 'rgba(0, 184, 169, 0.15)'
                          }}
                        >
                          <Icon className="w-8 h-8" style={{ color: '#00B8A9' }} />
                        </div>
                        
                        {/* Title */}
                        <h4 className={`font-semibold text-sm leading-tight ${
                          isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {industry.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-transparent {
          background-color: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </section>
  );
}
