import React from 'react';
import {
  HiSparkles,
  HiQuestionMarkCircle,
  HiLightBulb,
  HiCheckCircle,
} from 'react-icons/hi2';

export default function PurposeBuiltSection({ isVisible, isDark, setRef }) {
  const features = [
    {
      icon: HiQuestionMarkCircle,
      title: 'The Problem',
      items: [
        'Startups struggle to find the right investors.',
        'Investors miss genuine opportunities.',
        'Incubators fail to highlight real success stories.',
      ],
      color: isDark ? '#FF6B6B' : '#DC2626',
      bgColor: isDark
        ? 'rgba(255, 107, 107, 0.1)'
        : 'rgba(220, 38, 38, 0.1)',
      type: 'problem',
    },
    {
      icon: HiLightBulb,
      title: 'The Solution',
      items: [
        'EVO-A connects startups, investors, and incubators on one smart platform.',
        'Pitch confidently. Discover verified deals. Showcase proven success.',
      ],
      color: isDark ? '#B0FFFA' : '#00B8A9',
      bgColor: isDark
        ? 'rgba(176, 255, 250, 0.1)'
        : 'rgba(0, 184, 169, 0.1)',
      type: 'solution',
    },
    {
      icon: HiCheckCircle,
      title: 'Why EVO-A',
      items: [
        'Verified startups',
        'Trusted investors',
        'Real incubator portfolios',
      ],
      color: isDark ? '#B0FFFA' : '#00B8A9',
      bgColor: isDark
        ? 'rgba(176, 255, 250, 0.1)'
        : 'rgba(0, 184, 169, 0.1)',
      type: 'why',
      cta: true,
    },
  ];

  return (
    <section
      ref={setRef?.('purposeBuilt')}
      className={`relative py-10 sm:py-16 md:py-24 transition-all duration-1000 ${
        isVisible?.transformJourney
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible?.transformJourney
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <h2
            className={`text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            style={{ whiteSpace: 'nowrap', lineHeight: '1.2' }}
          >
            Purpose-Built Tools. One Growing{' '}
            <span
              className="relative inline-block"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #B0FFFA 0%, #80E5FF 50%, #B0FFFA 100%)'
                  : 'linear-gradient(135deg, #00B8A9 0%, #00C9B7 50%, #00B8A9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: isVisible?.transformJourney
                  ? 'gradient-shift 4s ease infinite'
                  : 'none',
              }}
            >
              Ecosystem.
            </span>
          </h2>

          <p
            className={`hidden sm:block text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}
          >
            From engagement to management, everything you need in one place.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Vertical Dividers */}
          <div className="hidden md:block absolute inset-y-0 left-1/3 w-px bg-gray-200 dark:bg-white/10" />
          <div className="hidden md:block absolute inset-y-0 left-2/3 w-px bg-gray-200 dark:bg-white/10" />

          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`transition-all duration-700 ${
                  isVisible?.transformJourney
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + idx * 150}ms` }}
              >
                <div
                  className={`relative h-full p-5 sm:p-8 rounded-2xl text-center transition-all duration-300   ${
                    isDark
                      ? 'bg-white/5  border border-white/10'
                      : 'bg-white  border border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className="mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-transform duration-300 "
                    style={{ backgroundColor: feature.bgColor }}
                  >
                    <Icon
                      className="text-3xl"
                      style={{ color: feature.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3
                    className={`text-xl sm:text-2xl font-bold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {feature.title}
                  </h3>

                  <div className="space-y-2 mb-6">
                    {feature.items.map((item, i) => (
                      <p
                        key={i}
                        className={`text-sm sm:text-base ${
                          isDark ? 'text-white/80' : 'text-gray-700'
                        }`}
                      >
                        {item}
                      </p>
                    ))}
                  </div>

                  {feature.cta && (
                    <div
                      className="mt-6 pt-6 border-t"
                      style={{
                        borderColor: isDark
                          ? 'rgba(176,255,250,0.15)'
                          : 'rgba(0,184,169,0.15)',
                      }}
                    >
                      <p
                        className={`flex justify-center items-center gap-2 text-sm font-bold ${
                          isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'
                        }`}
                      >
                        <HiSparkles className="animate-pulse" />
                        All verified. All trusted. All in one place.
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isDark ? 'text-white/60' : 'text-gray-600'
                        }`}
                      >
                        Join thousands transforming the funding ecosystem
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </section>
  );
}
