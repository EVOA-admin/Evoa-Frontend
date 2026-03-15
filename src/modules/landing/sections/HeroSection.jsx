import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiRocketLaunch,
  HiCurrencyDollar,
  HiUsers,
  HiArrowRight,
  HiBolt,
  HiShieldCheck,
  HiAcademicCap,
} from 'react-icons/hi2';
import heroImage from '../../../assets/handshake.png';

// Typing words
const TYPING_WORDS = [
  'Next Unicorn',
  'Right Investors',
  'Top Startups',
  'Your Future',
  'Success Stories',
  'Dream Team',
];

export default function HeroSection({ isVisible, isDark, setRef, mousePosition }) {
  // Auto-typing state
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingText, setTypingText] = useState('');
  const typingTimeoutRef = useRef(null);
  const typingTextRef = useRef('');
  const isDeletingRef = useRef(false);
  const textIndexRef = useRef(0);
  const isFirstRender = useRef(true);

  // Counters
  const [fundedCount, setFundedCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [startupsCount, setStartupsCount] = useState(0);

  // Keep refs in sync
  useEffect(() => {
    typingTextRef.current = typingText;
    isDeletingRef.current = isDeleting;
    textIndexRef.current = textIndex;
  }, [typingText, isDeleting, textIndex]);

  // Reset when word index changes
  useEffect(() => {
    setTypingText('');
    setIsDeleting(false);
  }, [textIndex]);

  // Counter Animation Effect
  useEffect(() => {
    if (!isVisible['hero']) return;

    // Funded Counter (125 Cr)
    let fundedStart = 0;
    const fundedEnd = 125;
    const fundedTimer = setInterval(() => {
      fundedStart += 3;
      if (fundedStart >= fundedEnd) {
        setFundedCount(fundedEnd);
        clearInterval(fundedTimer);
      } else {
        setFundedCount(fundedStart);
      }
    }, 30);

    // Users Counter (10,000)
    let usersStart = 0;
    const usersEnd = 10000;
    const usersTimer = setInterval(() => {
      usersStart += 250;
      if (usersStart >= usersEnd) {
        setUsersCount(usersEnd);
        clearInterval(usersTimer);
      } else {
        setUsersCount(usersStart);
      }
    }, 30);

    // Startups Counter (2,800)
    let startupsStart = 0;
    const startupsEnd = 2800;
    const startupsTimer = setInterval(() => {
      startupsStart += 70;
      if (startupsStart >= startupsEnd) {
        setStartupsCount(startupsEnd);
        clearInterval(startupsTimer);
      } else {
        setStartupsCount(startupsStart);
      }
    }, 30);

    return () => {
      clearInterval(fundedTimer);
      clearInterval(usersTimer);
      clearInterval(startupsTimer);
    };
  }, [isVisible]);

  // Auto-typing effect
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const currentWord = TYPING_WORDS[textIndexRef.current];
    if (!currentWord) return;

    const typeSpeed = isDeletingRef.current ? 80 : 180;

    const type = () => {
      const currentText = typingTextRef.current;
      const currentWord = TYPING_WORDS[textIndexRef.current];
      const deleting = isDeletingRef.current;

      if (!deleting) {
        const newText = currentWord.substring(0, currentText.length + 1);

        if (newText.length === currentWord.length) {
          setTypingText(newText);
          setTimeout(() => {
            setIsDeleting(true);
          }, 2500);
          return;
        }

        setTypingText(newText);
        typingTimeoutRef.current = setTimeout(type, typeSpeed);
      } else {
        const newText = currentWord.substring(0, currentText.length - 1);

        if (newText.length === 0) {
          setTypingText('');
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % TYPING_WORDS.length);
          return;
        }

        setTypingText(newText);
        typingTimeoutRef.current = setTimeout(type, typeSpeed);
      }
    };

    const initialDelay = isFirstRender.current ? 500 : 0;
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }

    typingTimeoutRef.current = setTimeout(type, typeSpeed + initialDelay);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isDeleting, textIndex]);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <section
      ref={setRef('hero')}
      className={`
        relative overflow-hidden
        py-6 sm:py-10 lg:py-16
        px-4 sm:px-6 lg:px-8
        transition-all duration-1000 ease-out
        ${isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      <div className="max-w-6xl lg:max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* LEFT COLUMN - Content */}
          <div
            className={`
              relative z-10 space-y-6
              transition-all duration-1000 delay-200
              ${isVisible['hero'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
            `}
          >
            {/* Mobile-only background glow */}
            <div className={`absolute -inset-10 -z-10 rounded-[3rem] blur-3xl lg:hidden ${
              isDark ? 'bg-gradient-to-br from-[#B0FFFA]/10 to-transparent' : 'bg-gradient-to-br from-[#00B8A9]/10 to-transparent'
            }`} />

            {/* Tagline - Workflow Requirement - Enhanced Professional Styling */}
            <div className="mb-5 sm:mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full mb-4 backdrop-blur-xl border transition-all duration-500 ${
                isDark 
                  ? 'bg-[#B0FFFA]/10 border-[#B0FFFA]/30 hover:border-[#B0FFFA]/50 hover:bg-[#B0FFFA]/15' 
                  : 'bg-[#00B8A9]/10 border-[#00B8A9]/30 hover:border-[#00B8A9]/50 hover:bg-[#00B8A9]/15'
              }`}>
                <span className={`text-sm sm:text-base md:text-lg font-bold tracking-wide ${
                  isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'
                }`}>
                  Join the Future of Startup–Investor Ecosystem
                </span>
              </div>
            </div>

            {/* Heading + Typing */}
            <div>
              <h1
                className={`
                  text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold
                  tracking-tight leading-tight
                  ${isDark ? 'text-white' : 'text-gray-900'}
                `}
              >
                <span className="block mb-1 sm:mb-2">Connect with</span>
                <span
                  className={`
                    bg-gradient-to-r bg-clip-text text-transparent
                    block min-h-[1.2em]
                    ${
                      isDark
                        ? 'from-[#B0FFFA] via-white to-[#80E5FF]'
                        : 'from-[#043873] via-teal-600 to-[#043873]'
                    }
                  `}
                >
                  {typingText || '\u00A0'}
                  <span
                    className={`
                      inline-block w-0.5 sm:w-1 h-[0.9em] align-middle ml-1
                      animate-pulse
                      ${isDark ? 'bg-[#B0FFFA]' : 'bg-[#043873]'}
                    `}
                  />
                </span>
              </h1>
            </div>

            {/* Informational Section - Workflow Requirement */}
            <p
              className={`
                text-base sm:text-lg md:text-xl
                leading-relaxed max-w-2xl mt-1 font-medium
                ${isDark ? 'text-white' : 'text-gray-900'}
              `}
            >
              EVOA is Redefining Startup Investments
            </p>

            {/* Subheading */}
            <p
              className={`
                hidden sm:block
                text-base sm:text-lg md:text-xl
                leading-relaxed max-w-2xl mt-3
                ${isDark ? 'text-gray-300' : 'text-gray-600'}
              `}
            >
              India&apos;s most trusted platform where{' '}
              <span
                className={isDark ? 'text-white font-semibold' : 'text-black font-semibold'}
              >
                startups meet investors
              </span>
              , incubators showcase talent, and{' '}
              <span
                className={isDark ? 'text-white font-semibold' : 'text-black font-semibold'}
              >
                dreams turn into reality
              </span>
              .
            </p>

            {/* Features + Counters */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 max-w-lg">
              {/* Feature 1 */}
              <div
                className={`
                  flex items-start gap-3 p-3 sm:p-4 rounded-xl
                  transition-all duration-300 hover:scale-105 active:scale-95
                  ${isDark ? 'bg-gray-800/40 hover:bg-gray-800/60' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                <div
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                    ${isDark ? 'bg-[#043873]/20' : 'bg-[#043873]/10'}
                  `}
                >
                  <HiBolt className="w-4 h-4 sm:w-5 sm:h-5 text-[#043873]" />
                </div>
                <div className="min-w-0">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Instant Matching
                  </h4>
                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    AI-powered connections
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div
                className={`
                  flex items-start gap-3 p-3 sm:p-4 rounded-xl
                  transition-all duration-300 hover:scale-105 active:scale-95
                  ${isDark ? 'bg-gray-800/40 hover:bg-gray-800/60' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                <div
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                    ${isDark ? 'bg-purple-500/20' : 'bg-purple-500/10'}
                  `}
                >
                  <HiShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    100% Secure
                  </h4>
                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Bank-level encryption
                  </p>
                </div>
              </div>

              {/* Feature 3 - Funded */}
              <div
                className={`
                  flex items-start gap-3 p-3 sm:p-4 rounded-xl
                  transition-all duration-300 hover:scale-105 active:scale-95
                  ${isDark ? 'bg-gray-800/40 hover:bg-gray-800/60' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                <div
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                    ${isDark ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}
                  `}
                >
                  <HiCurrencyDollar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-500" />
                </div>
                <div className="min-w-0">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    ₹{fundedCount}Cr+ Funded
                  </h4>
                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    {formatNumber(startupsCount)}+ startups
                  </p>
                </div>
              </div>

              {/* Feature 4 - Users */}
              <div
                className={`
                  flex items-start gap-3 p-3 sm:p-4 rounded-xl
                  transition-all duration-300 hover:scale-105 active:scale-95
                  ${isDark ? 'bg-gray-800/40 hover:bg-gray-800/60' : 'bg-gray-50 hover:bg-gray-100'}
                `}
              >
                <div
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                    ${isDark ? 'bg-pink-500/20' : 'bg-pink-500/10'}
                  `}
                >
                  <HiUsers className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                </div>
                <div className="min-w-0">
                  <h4
                    className={`text-xs sm:text-sm font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {formatNumber(usersCount)}+ Users
                  </h4>
                  <p
                    className={`text-[11px] sm:text-xs mt-0.5 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Active community
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Buttons - Workflow Requirements - Enhanced Professional Styling */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-5">
              <Link
                to="/register"
                className={`
                  group relative inline-flex items-center justify-center gap-2
                  px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl
                  font-bold text-base sm:text-lg
                  shadow-2xl hover:shadow-[0_0_50px_rgba(176,255,250,0.6)]
                  transition-all duration-300 hover:scale-105 active:scale-95
                  bg-gradient-to-r from-[#B0FFFA] via-[#80E5FF] to-[#B0FFFA] text-black
                  overflow-hidden
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
                  before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
                `}
              >
                <span className="relative z-10">Create Your Account</span>
                <HiArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform relative z-10" />
              </Link>

              <Link
                to="/login"
                className={`
                  relative inline-flex items-center justify-center
                  px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl
                  font-semibold text-base sm:text-lg border-2
                  transition-all duration-300 hover:scale-105 active:scale-95
                  overflow-hidden
                  ${
                    isDark
                      ? 'border-[#B0FFFA]/60 text-[#B0FFFA] hover:bg-[#B0FFFA]/10 hover:border-[#B0FFFA] hover:shadow-[0_0_30px_rgba(176,255,250,0.3)]'
                      : 'border-[#043873] text-[#043873] hover:bg-[#00B8A9]/10 hover:border-[#00B8A9] hover:shadow-[0_0_30px_rgba(0,184,169,0.3)]'
                  }
                `}
              >
                <span className="relative z-10">Sign in with Email</span>
              </Link>
            </div>

            {/* Mobile Down Arrow Indicator */}
            <div className="flex justify-center mt-8 lg:hidden animate-bounce pt-4">
              <svg
                className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-[#B0FFFA]/50' : 'text-[#00B8A9]/50'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>

          {/* RIGHT COLUMN - Illustration + Bubbles */}
          <div
            className={`
              hidden lg:flex relative h-[600px]
              items-center justify-center
              transition-all duration-1000 delay-400
              ${isVisible['hero'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
            `}
          >
            {/* CONNECTION LINES SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-5 hidden md:block">
              {/* Line to Bubble 1 (Top Right) */}
              <line
                x1="50%"
                y1="50%"
                x2="88%"
                y2="12%"
                stroke={isDark ? 'rgba(0,184,169,0.4)' : 'rgba(0,184,169,0.25)'}
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-dash"
              />

              {/* Line to Bubble 2 (Bottom Right) */}
              <line
                x1="50%"
                y1="50%"
                x2="88%"
                y2="88%"
                stroke={isDark ? 'rgba(147,51,234,0.4)' : 'rgba(147,51,234,0.25)'}
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-dash"
                style={{ animationDelay: '0.5s' }}
              />

              {/* Line to Bubble 3 (Bottom Left) */}
              <line
                x1="50%"
                y1="50%"
                x2="12%"
                y2="88%"
                stroke={isDark ? 'rgba(6,182,212,0.4)' : 'rgba(6,182,212,0.25)'}
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-dash"
                style={{ animationDelay: '1s' }}
              />

              {/* Line to Bubble 4 (Top Left) */}
              <line
                x1="50%"
                y1="50%"
                x2="12%"
                y2="12%"
                stroke={isDark ? 'rgba(236,72,153,0.4)' : 'rgba(236,72,153,0.25)'}
                strokeWidth="2"
                strokeDasharray="8,8"
                className="animate-dash"
                style={{ animationDelay: '1.5s' }}
              />
            </svg>

            {/* Center Hero Image - Smaller Size */}
            <div className="relative z-40 text-center group cursor-pointer">
              <img
                src={heroImage}
                alt="EVO-A Platform"
                fetchpriority="high"
                loading="eager"
                className="w-[320px] h-[320px] object-contain transition-all duration-500 group-hover:scale-105 drop-shadow-2xl mx-auto"
              />
            </div>

            {/* Floating Bubbles - Better Positioned */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Bubble 1 - Top Right */}
              <div
                className={`
                  hidden lg:flex absolute w-[110px] h-[110px] xl:w-[130px] xl:h-[130px] rounded-full
                  ${isDark ? 'bg-gradient-to-br from-[#043873]/15 to-[#B0FFFA]/8' : 'bg-white/95'}
                  backdrop-blur-md border-2
                  ${isDark ? 'border-[#043873]/30' : 'border-[#043873]/20'}
                  shadow-2xl animate-float1 flex-col items-center justify-center
                  p-2 xl:p-3 group cursor-pointer hover:scale-110 transition-all duration-300
                  pointer-events-auto
                `}
                style={{
                  top: '2%',
                  right: '0%',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(0, 184, 169, 0.25)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  className={`
                    w-9 h-9 xl:w-10 xl:h-10 rounded-full
                    ${isDark ? 'bg-[#043873]/25' : 'bg-[#043873]/15'}
                    flex items-center justify-center mb-1.5
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <HiRocketLaunch className="w-5 h-5 xl:w-6 xl:h-6 text-[#043873]" />
                </div>
                <h3
                  className={`text-[11px] xl:text-xs font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } text-center leading-tight`}
                >
                  For Startups
                </h3>
                <p
                  className={`text-[9px] xl:text-[10px] text-center mt-0.5 leading-tight ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Pitch & get funded
                </p>
              </div>

              {/* Bubble 2 - Bottom Right */}
              <div
                className={`
                  hidden lg:flex absolute w-[110px] h-[110px] xl:w-[130px] xl:h-[130px] rounded-full
                  ${isDark ? 'bg-gradient-to-br from-purple-500/15 to-blue-500/8' : 'bg-white/95'}
                  backdrop-blur-md border-2
                  ${isDark ? 'border-purple-500/30' : 'border-purple-500/20'}
                  shadow-2xl animate-float2 flex-col items-center justify-center
                  p-2 xl:p-3 group cursor-pointer hover:scale-110 transition-all duration-300
                  pointer-events-auto
                `}
                style={{
                  bottom: '2%',
                  right: '0%',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(147, 51, 234, 0.25)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  className={`
                    w-9 h-9 xl:w-10 xl:h-10 rounded-full
                    ${isDark ? 'bg-purple-500/25' : 'bg-purple-500/15'}
                    flex items-center justify-center mb-1.5
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <HiCurrencyDollar className="w-5 h-5 xl:w-6 xl:h-6 text-purple-500" />
                </div>
                <h3
                  className={`text-[11px] xl:text-xs font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } text-center leading-tight`}
                >
                  For Investors
                </h3>
                <p
                  className={`text-[9px] xl:text-[10px] text-center mt-0.5 leading-tight ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Discover unicorns
                </p>
              </div>

              {/* Bubble 3 - Bottom Left */}
              <div
                className={`
                  hidden lg:flex absolute w-[110px] h-[110px] xl:w-[130px] xl:h-[130px] rounded-full
                  ${isDark ? 'bg-gradient-to-br from-cyan-500/15 to-emerald-500/8' : 'bg-white/95'}
                  backdrop-blur-md border-2
                  ${isDark ? 'border-cyan-500/30' : 'border-cyan-500/20'}
                  shadow-2xl animate-float3 flex-col items-center justify-center
                  p-2 xl:p-3 group cursor-pointer hover:scale-110 transition-all duration-300
                  pointer-events-auto
                `}
                style={{
                  bottom: '2%',
                  left: '0%',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(6, 182, 212, 0.25)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  className={`
                    w-9 h-9 xl:w-10 xl:h-10 rounded-full
                    ${isDark ? 'bg-cyan-500/25' : 'bg-cyan-500/15'}
                    flex items-center justify-center mb-1.5
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <HiAcademicCap className="w-5 h-5 xl:w-6 xl:h-6 text-cyan-500" />
                </div>
                <h3
                  className={`text-[11px] xl:text-xs font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } text-center leading-tight`}
                >
                  For Incubators
                </h3>
                <p
                  className={`text-[9px] xl:text-[10px] text-center mt-0.5 leading-tight ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Nurture startups
                </p>
              </div>

              {/* Bubble 4 - Top Left */}
              <div
                className={`
                  hidden lg:flex absolute w-[110px] h-[110px] xl:w-[130px] xl:h-[130px] rounded-full
                  ${isDark ? 'bg-gradient-to-br from-pink-500/15 to-rose-500/8' : 'bg-white/95'}
                  backdrop-blur-md border-2
                  ${isDark ? 'border-pink-500/30' : 'border-pink-500/20'}
                  shadow-2xl animate-float4 flex-col items-center justify-center
                  p-2 xl:p-3 group cursor-pointer hover:scale-110 transition-all duration-300
                  pointer-events-auto
                `}
                style={{
                  top: '2%',
                  left: '0%',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(236, 72, 153, 0.25)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  className={`
                    w-9 h-9 xl:w-10 xl:h-10 rounded-full
                    ${isDark ? 'bg-pink-500/25' : 'bg-pink-500/15'}
                    flex items-center justify-center mb-1.5
                    group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <HiUsers className="w-5 h-5 xl:w-6 xl:h-6 text-pink-500" />
                </div>
                <h3
                  className={`text-[11px] xl:text-xs font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  } text-center leading-tight`}
                >
                  For Viewers
                </h3>
                <p
                  className={`text-[9px] xl:text-[10px] text-center mt-0.5 leading-tight ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  Explore daily
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
