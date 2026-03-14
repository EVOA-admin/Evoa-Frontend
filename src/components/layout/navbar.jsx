import { useState, useEffect } from 'react';
import { HiMenu, HiX, HiSun, HiMoon } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import logo from '../../assets/logo.avif';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 5);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl transition-all duration-500 ${isDark
            ? 'bg-black/60 text-white'
            : 'bg-white/70 text-gray-900'
          } ${isScrolled
            ? isDark
              ? 'shadow-[0_6px_30px_rgba(176,255,250,0.18)]'
              : 'shadow-[0_6px_30px_rgba(0,184,169,0.18)]'
            : 'shadow-none'
          }`}
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between py-3 md:py-4">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group transition-all hover:scale-110 active:scale-95"
            >
              <img src={logo} alt="EVO-A Logo" className="h-9 w-9 md:h-10 md:w-10" />
              <span
                className={`text-lg md:text-xl font-bold tracking-wide bg-gradient-to-r ${isDark
                    ? 'from-white via-[#B0FFFA] to-white bg-clip-text text-transparent'
                    : 'from-black via-[#00B8A9] to-black bg-clip-text text-transparent'
                  }`}
              >
                EVO-A
              </span>
            </Link>

            {/* ================= DESKTOP NAV ================= */}
            <nav className="hidden md:flex items-center gap-3 text-sm font-medium">
              {[
                ['Blog', '/blog'],
                ['Pitch Us', '/pitch-us'],
                ['Portfolio', '/portfolio'],
                ['About', '/about'],
                ['Contact', '/contact'],
              ].map(([label, path]) => (
                <Link
                  key={label}
                  to={path}
                  className={`px-3 py-1.5 transition-all duration-300 hover:scale-105 ${isDark
                      ? 'text-white/70 hover:text-[#B0FFFA]'
                      : 'text-black/70 hover:text-[#00B8A9]'
                    }`}
                >
                  {label}
                </Link>
              ))}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`border px-2.5 py-1.5 rounded cursor-pointer transition-all hover:scale-110 active:scale-95 ${isDark
                    ? 'border-[#B0FFFA]/40 hover:bg-[#B0FFFA]/10 hover:border-[#B0FFFA]'
                    : 'border-[#00B8A9]/40 hover:bg-[#00B8A9]/10 hover:border-[#00B8A9]'
                  }`}
              >
                {isDark ? <HiSun aria-hidden="true" /> : <HiMoon aria-hidden="true" />}
              </button>

              {/* Sign In */}
              <Link
                to="/login"
                className="px-4 py-1.5 font-semibold rounded-lg transition-all hover:scale-110 active:scale-95
                bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black
                hover:shadow-[0_0_30px_rgba(176,255,250,0.6)]"
              >
                Sign in
              </Link>
            </nav>

            {/* ================= MOBILE BUTTONS ================= */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`h-8 w-8 flex items-center justify-center rounded cursor-pointer ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  }`}
              >
                {isDark ? <HiSun aria-hidden="true" /> : <HiMoon aria-hidden="true" />}
              </button>

              <button
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-menu"
                className={`h-8 w-8 flex items-center justify-center ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
                  }`}
              >
                {isMobileMenuOpen ? <HiX aria-hidden="true" /> : <HiMenu aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Menu */}
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={`fixed top-0 right-0 h-full w-full z-[70] transition-all duration-500 ${isDark
                ? 'bg-black border-l border-[#B0FFFA]/20'
                : 'bg-white border-l border-[#00B8A9]/20'
              }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-bold text-xl">EVO-A</span>
              <button onClick={closeMobileMenu} aria-label="Close menu">
                <HiX className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col px-5 py-6 gap-1">
              {[
                ['Blog', '/blog'],
                ['Pitch Us', '/pitch-us'],
                ['Portfolio', '/portfolio'],
                ['About', '/about'],
                ['Contact', '/contact'],
              ].map(([label, path]) => (
                <Link
                  key={label}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`px-4 py-3 text-base font-semibold transition-all hover:scale-105 ${isDark
                      ? 'text-white hover:bg-white/10'
                      : 'text-black hover:bg-gray-100'
                    }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="px-5 py-5 border-t border-white/10 space-y-3">
              <button
                onClick={toggleTheme}
                className="w-full px-4 py-3 flex justify-between font-semibold rounded cursor-pointer"
              >
                Theme {isDark ? <HiSun /> : <HiMoon />}
              </button>

              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block text-center px-4 py-3 font-bold rounded-lg
                bg-gradient-to-r from-[#B0FFFA] to-[#80E5FF] text-black
                hover:shadow-[0_0_30px_rgba(176,255,250,0.6)]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
