import { useState } from 'react';

/* =========================
   WHY EVO-A FEATURES (SHORT)
========================= */
const whyEvoaFeatures = [
  {
    iconName: 'HiCheckBadge',
    title: 'Verified Profiles',
    description:
      'CIN, GST, Udyam & SEBI verified profiles to build instant trust.',
  },
  {
    iconName: 'HiVideoCamera',
    title: 'Investor-First Pitch',
    description:
      'Pitch video, deck, and deal terms — all in one clear view.',
  },
  {
    iconName: 'HiMagnifyingGlass',
    title: 'Smart Matching',
    description:
      'Find the right startups or investors using intelligent filters.',
  },
  {
    iconName: 'HiUserGroup',
    title: 'Multi-Role Platform',
    description:
      'Tailored dashboards for Startups, Investors & Incubators.',
  },
];

/* =========================
   ANIMATED GIF ICON
========================= */
function AnimatedGifIcon({ src, alt = '', className = '', fallbackIcon }) {
  const [hasError, setHasError] = useState(false);

  if (hasError && fallbackIcon) {
    return <div className={className}>{fallbackIcon}</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} ${hasError ? 'hidden' : ''}`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

/* =========================
   FEATURE CARD
========================= */
function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  isVisible,
  isDark,
  gifIcon = null,
}) {
  return (
    <div
      className={`
        group relative p-5 md:p-6 rounded-2xl border text-left transition-all duration-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${
          isDark
            ? 'bg-black/50 border-white/10 hover:border-[#B0FFFA]/60 hover:bg-black/70'
            : 'bg-white border-slate-200 hover:border-[#00B8A9]/60 hover:bg-white'
        }
        hover:-translate-y-1 hover:shadow-xl
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Gradient hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-[#B0FFFA]/5 via-transparent to-[#80E5FF]/5 rounded-2xl" />

      <div className="relative z-10">
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-full ${
              isDark
                ? 'bg-[#B0FFFA]/10 text-[#B0FFFA]'
                : 'bg-[#00B8A9]/10 text-[#00B8A9]'
            }`}
          >
            {gifIcon ? (
              <AnimatedGifIcon
                src={gifIcon}
                alt={title}
                className="w-4 h-4"
                fallbackIcon={icon}
              />
            ) : (
              icon
            )}
          </span>

          <h3
            className={`text-lg sm:text-xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </h3>
        </div>

        {/* Description */}
        <p
          className={`text-sm sm:text-base leading-relaxed ${
            isDark ? 'text-white/75' : 'text-gray-700'
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================
   MAIN SECTION
========================= */
export default function WhyEvoaSection({
  isVisible,
  isDark,
  setRef,
  SectionTitle,
  getIcon,
}) {
  return (
    <section
      ref={setRef('whyEvoa')}
      className={`relative py-10 sm:py-20 transition-all duration-1000 ${
        isVisible['whyEvoa']
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-14">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 border backdrop-blur ${
              isDark
                ? 'bg-[#B0FFFA]/5 border-[#B0FFFA]/20 text-[#B0FFFA]'
                : 'bg-[#00B8A9]/5 border-[#00B8A9]/20 text-[#00B8A9]'
            }`}
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider">
              Key Features
            </span>
          </div>

          <SectionTitle>Why EVO-A?</SectionTitle>

          <p
            className={`hidden sm:block text-base sm:text-lg md:text-xl max-w-2xl mx-auto mt-4 ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}
          >
            One platform built for trust, speed, and real business outcomes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {whyEvoaFeatures.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={getIcon(feature.iconName, 'text-base')}
              title={feature.title}
              description={feature.description}
              delay={index * 100}
              isVisible={isVisible['whyEvoa']}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
