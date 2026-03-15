import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Footer from '../../components/layout/footer';

// HeroSection is eagerly imported — it is the LCP element and must paint immediately
import HeroSection from './sections/HeroSection';

// Below-fold sections: lazy-loaded so they don’t block initial parse / FCP
const TransformJourneySection = lazy(() => import('./sections/TransformJourneySection'));
const WhyEvoaSection          = lazy(() => import('./sections/WhyEvoaSection'));
const WhoIsEvoaSection        = lazy(() => import('./sections/WhoIsEvoaSection'));
const HowItWorksSection       = lazy(() => import('./sections/HowItWorksSection'));
const PowerfulFeaturesSection = lazy(() => import('./sections/PowerfulFeaturesSection'));
const TrustDesignSection      = lazy(() => import('./sections/TrustDesignSection'));
const UserJourneySection      = lazy(() => import('./sections/UserJourneySection'));
const FAQSection              = lazy(() => import('./sections/FAQSection'));
import {
  HiRocketLaunch,
  HiSparkles,
  HiStar,
  HiCheckBadge,
  HiVideoCamera,
  HiMagnifyingGlass,
  HiUserGroup,
  HiHome,
  HiBell,
  HiShieldCheck,
  HiClipboardDocumentCheck,
  HiChatBubbleLeftRight,
  HiArrowRight
} from 'react-icons/hi2';


// Generate smoke particles - Reduced for better performance
const generateSmokeParticles = () => {
  const particles = [];
  for (let i = 0; i < 8; i++) { // Reduced from 20 to 8
    particles.push({
      id: i,
      width: 150 + Math.random() * 200,
      height: 150 + Math.random() * 200,
      opacity: 0.15 + Math.random() * 0.25, // More subtle
      top: 10 + Math.random() * 80,
      duration: 10 + Math.random() * 12, // Slower animations
      delay: i * 1.2,
      blur: 'blur-3xl',
    });
  }
  return particles;
};


// Floating Animated Icons Component - Simplified
function FloatingAnimatedIcons({ isDark }) {
  const icons = [
    { icon: <HiRocketLaunch className="text-xl" />, delay: 0, x: '8%', y: '15%' },
    { icon: <HiSparkles className="text-xl" />, delay: 1, x: '88%', y: '20%' },
    { icon: <HiStar className="text-lg" />, delay: 2, x: '12%', y: '75%' },
  ]; // Reduced from 6 to 3

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 hidden xl:block">
      {icons.map((item, index) => (
        <div
          key={index}
          className={`absolute ${isDark ? 'text-[#B0FFFA]/20' : 'text-[#00B8A9]/20'} animate-float`}
          style={{
            left: item.x,
            top: item.y,
            animationDelay: `${item.delay}s`,
            animationDuration: '8s',
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
}


// Icon mapping helper
const iconMap = {
  HiCheckBadge,
  HiVideoCamera,
  HiMagnifyingGlass,
  HiUserGroup,
  HiHome,
  HiBell,
  HiShieldCheck,
  HiClipboardDocumentCheck,
  HiChatBubbleLeftRight
};


const getIcon = (iconName, className = 'text-2xl') => {
  const IconComponent = iconMap[iconName];
  return IconComponent ? <IconComponent className={className} /> : null;
};


// Animation keyframes and utility classes are now in src/index.css
// (removed inline <style> injection to avoid runtime style recalculation)


export default function Landing() {
  const [isVisible, setIsVisible] = useState({});
  const [openFAQ, setOpenFAQ] = useState(null);
  const sectionRefs = useRef({});
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [smokeParticles] = useState(() => generateSmokeParticles());


  // Intersection Observer for scroll animations
  useEffect(() => {
    setIsVisible({ hero: true });
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.dataset.section]: true
          }));
        }
      });
    }, observerOptions);


    const timeoutId = setTimeout(() => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    }, 100);


    return () => {
      clearTimeout(timeoutId);
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);


  const setRef = (section) => (el) => {
    if (el) {
      sectionRefs.current[section] = el;
      el.dataset.section = section;
    }
  };


  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };


  // Improved Section Title Component
  const SectionTitle = ({ children }) => (
    <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 ${
      isDark ? 'text-white' : 'text-black'
    }`}>
      {children}
    </h2>
  );


  // Simplified Card Container
  const CardContainer = ({ children, className = '' }) => (
    <div className={`group relative p-6 md:p-8 lg:p-10 rounded-2xl transition-all duration-300 overflow-hidden ${
      isDark 
        ? 'bg-black/40 backdrop-blur-xl border border-[#B0FFFA]/20 hover:border-[#B0FFFA]/40 hover:shadow-lg hover:shadow-[#B0FFFA]/10' 
        : 'bg-white/90 backdrop-blur-xl border border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50 hover:shadow-xl hover:shadow-[#B0FFFA]/10'
    } ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );


  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      {/* Animation keyframes are in src/index.css — no runtime <style> injection needed */}
      
      <FloatingAnimatedIcons isDark={isDark} />


      {/* Simplified Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
    
        {/* Smoke particles - only on large screens */}
        {smokeParticles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute left-0 rounded-full blur-3xl hidden lg:block`}
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              background: `radial-gradient(circle, rgba(176, 255, 250, ${particle.opacity}) 0%, transparent 70%)`,
              top: `${particle.top}%`,
              animation: `smokeFlow ${particle.duration}s ease-out infinite`,
              animationDelay: `${particle.delay}s`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>


      <main className="mx-auto max-w-7xl pb-20 pt-0 overflow-x-hidden">
        {/* Hero Section */}
        <div className="relative">
          <HeroSection 
            isVisible={isVisible}
            isDark={isDark}
            setRef={setRef}
          />
        </div>


        {/* All sections with consistent spacing */}
        <div className="space-y-16 md:space-y-20 lg:space-y-24">
          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>


          {/* Transform Journey Section */}
          <div ref={setRef('transformJourney')} className={`transition-all duration-1000 ${
            isVisible['transformJourney'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <TransformJourneySection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
                SectionTitle={SectionTitle}
                CardContainer={CardContainer}
              />
            </Suspense>
          </div>


          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>


          {/* Why EVO-A Section */}
          <div ref={setRef('whyEvoa')} className={`transition-all duration-1000 ${
            isVisible['whyEvoa'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <WhyEvoaSection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
                SectionTitle={SectionTitle}
                getIcon={getIcon}
              />
            </Suspense>
          </div>


          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>


          {/* Who is EVO-A For Section */}
          <div ref={setRef('whoIsEvoa')} className={`transition-all duration-1000 ${
            isVisible['whoIsEvoa'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <WhoIsEvoaSection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
                SectionTitle={SectionTitle}
              />
            </Suspense>
          </div>


          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>


          {/* How It Works Section */}
          <div ref={setRef('howItWorks')} className={`transition-all duration-1000 ${
            isVisible['howItWorks'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <HowItWorksSection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
                SectionTitle={SectionTitle}
                getIcon={getIcon}
              />
            </Suspense>
          </div>


          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>


          {/* Powerful Features Section */}
          <div ref={setRef('powerfulFeatures')} className={`transition-all duration-1000 ${
            isVisible['powerfulFeatures'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <PowerfulFeaturesSection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
              />
            </Suspense>
          </div>


          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>


          {/* Trust Design Section */}
          <div ref={setRef('trustDesign')} className={`transition-all duration-1000 ${
            isVisible['trustDesign'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <TrustDesignSection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
                SectionTitle={SectionTitle}
                CardContainer={CardContainer}
              />
            </Suspense>
          </div>


          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>


          {/* User Journey Section */}
          <div ref={setRef('userJourney')} className={`transition-all duration-1000 ${
            isVisible['userJourney'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <UserJourneySection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
                SectionTitle={SectionTitle}
                CardContainer={CardContainer}
              />
            </Suspense>
          </div>


          {/* Section Divider - Top Border */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>
        </div>
      </main>

      {/* Final Call-to-Action - Full Width Section with Faded Edges - Outside Main Container */}
      <section 
        ref={setRef('finalCta')}
        className={`relative transition-all duration-1000 ease-out min-h-[400px] sm:min-h-[500px] md:min-h-[600px] w-full overflow-hidden flex flex-col justify-center py-8 sm:py-12 md:py-16 ${
          isVisible['finalCta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Grid Pattern Background - Full Coverage - Responsive */}
        <div 
          className="absolute w-full responsive-grid-pattern"
          style={{
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            backgroundImage: `
              linear-gradient(${isDark ? 'rgba(176, 255, 250, 0.06)' : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDark ? 'rgba(176, 255, 250, 0.06)' : 'rgba(0, 0, 0, 0.05)'} 1px, transparent 1px)
            `,
            backgroundPosition: '0 0',
            backgroundRepeat: 'repeat',
            maskImage: `
              linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%),
              linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)
            `,
            WebkitMaskImage: `
              linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%),
              linear-gradient(to right, transparent 0%, black 3%, black 97%, transparent 100%)
            `,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        />
        
        {/* Enhanced Faded Edge Masks - Pattern Fade Effect - Responsive */}
        {/* Top Fade - Responsive */}
        <div 
          className="absolute left-0 right-0 h-16 sm:h-24 md:h-32 pointer-events-none z-10"
          style={{
            top: '0',
            background: `linear-gradient(to bottom, ${
              isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            } 0%, ${
              isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
            } 25%, ${
              isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            } 50%, transparent 100%)`,
          }}
        />
        
        {/* Bottom Fade - Responsive */}
        <div 
          className="absolute left-0 right-0 h-16 sm:h-24 md:h-32 pointer-events-none z-10"
          style={{
            bottom: '0',
            background: `linear-gradient(to top, ${
              isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            } 0%, ${
              isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
            } 25%, ${
              isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            } 50%, transparent 100%)`,
          }}
        />
        
        {/* Left Fade - Responsive */}
        <div 
          className="absolute top-0 bottom-0 left-0 w-12 sm:w-20 md:w-32 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to right, ${
              isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            } 0%, ${
              isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
            } 25%, ${
              isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            } 50%, transparent 100%)`,
          }}
        />
        
        {/* Right Fade - Responsive */}
        <div 
          className="absolute top-0 bottom-0 right-0 w-12 sm:w-20 md:w-32 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to left, ${
              isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)'
            } 0%, ${
              isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'
            } 25%, ${
              isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
            } 50%, transparent 100%)`,
          }}
        />
        
        {/* Reduced overlay for better visibility */}
        <div 
          className={`absolute w-full pointer-events-none ${
            isDark ? 'bg-black/5' : 'bg-white/10'
          }`}
          style={{
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center z-20 my-auto py-4 sm:py-6 md:py-8">
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 px-2 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Ready to Transform Your Startup?
          </h2>
          
          <p className={`text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-2 ${
            isDark ? 'text-white/70' : 'text-black/60'
          }`}>
            Join thousands of founders, investors, and innovators building the future with EVO-A.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 justify-center items-stretch sm:items-center px-2">
            <Link 
              to="/register" 
              className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-[#B0FFFA] via-[#80E5FF] to-[#B0FFFA] text-black font-bold text-sm sm:text-base md:text-lg rounded-lg sm:rounded-xl md:rounded-2xl hover:shadow-2xl hover:shadow-[#B0FFFA]/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700 w-full sm:w-auto"
            >
              <span className="relative z-10">Create Your Account</span>
              <HiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform relative z-10" />
            </Link>
            
            <Link 
              to="/login" 
              className={`relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 border-2 rounded-lg sm:rounded-xl md:rounded-2xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 active:scale-95 text-center overflow-hidden w-full sm:w-auto ${
                isDark 
                  ? 'border-[#B0FFFA]/60 text-[#B0FFFA] hover:bg-[#B0FFFA]/10 hover:border-[#B0FFFA] hover:shadow-[0_0_30px_rgba(176,255,250,0.3)]' 
                  : 'border-[#00B8A9] text-[#00B8A9] hover:bg-[#00B8A9]/10 hover:border-[#00B8A9] hover:shadow-[0_0_30px_rgba(0,184,169,0.3)]'
              }`}
            >
              <span className="relative z-10">Sign in with Email</span>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Section Divider - Bottom Border Outside Section */}
      <div className={`h-px w-full mt-8 sm:mt-10 md:mt-12 lg:mt-16 ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>

      {/* FAQ Section - Back Inside Main Container */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-20 pt-0 overflow-x-hidden">
        <div className="space-y-16 md:space-y-20 lg:space-y-24">
          {/* Section Divider */}
          <div className={`h-px w-full ${isDark ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/20 to-transparent' : 'bg-gradient-to-r from-transparent via-[#00B8A9]/20 to-transparent'}`}></div>

          {/* FAQ Section */}
          <div ref={setRef('faq')} className={`transition-all duration-1000 ${
            isVisible['faq'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Suspense fallback={null}>
              <FAQSection 
                isVisible={isVisible}
                isDark={isDark}
                setRef={setRef}
                SectionTitle={SectionTitle}
                openFAQ={openFAQ}
                toggleFAQ={toggleFAQ}
              />
            </Suspense>
          </div>
        </div>
      </main>


      <Footer />
    </div>
  );
}
