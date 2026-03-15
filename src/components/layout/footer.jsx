import { Link } from 'react-router-dom';
import { FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

// X (Twitter) Icon
const XIcon = ({ size = 20, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer
      className={`relative mt-24 transition-all duration-500 backdrop-blur-xl ${isDark
        ? 'bg-black/70 text-white'
        : 'bg-white/70 text-black'
        }`}
    >
      {/* Soft top glow */}
      <div
        className={`absolute inset-x-0 -top-px h-px ${isDark
          ? 'bg-gradient-to-r from-transparent via-[#B0FFFA]/30 to-transparent'
          : 'bg-gradient-to-r from-transparent via-[#00B8A9]/30 to-transparent'
          }`}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 py-14 md:py-18">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14">

          {/* Brand */}
          <div className="md:col-span-2">
            <h3
              className={`text-2xl font-bold mb-4 bg-gradient-to-r ${isDark
                ? 'from-white via-[#B0FFFA] to-white bg-clip-text text-transparent'
                : 'from-black via-[#00B8A9] to-black bg-clip-text text-transparent'
                }`}
            >
              EVO-A
            </h3>

            <p
              className={`text-sm leading-relaxed max-w-md ${isDark ? 'text-white/60' : 'text-black/60'
                }`}
            >
              Revolutionizing the startup–investor ecosystem. Connect, invest,
              and grow together in the future of entrepreneurship.
            </p>

            {/* Social Icons */}
            <div className="flex gap-5 mt-6">
              {[
                { icon: FaLinkedin, link: "https://www.linkedin.com/company/evo-a" },
                // { icon: XIcon, link: "https://x.com/evoa" },
                // { icon: FaFacebook, link: "https://facebook.com/evoa" },
                { icon: FaInstagram, link: "https://instagram.com/evoaofficial" }
              ].map(({ icon: Icon, link }, i) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-all duration-300 hover:scale-125 active:scale-95 ${isDark
                    ? "text-white/50 hover:text-[#B0FFFA]"
                    : "text-black/50 hover:text-[#00B8A9]"
                    }`}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {[
                ['Home', '/'],
                ['Sign In', '/login'],
                ['Sign Up', '/register'],
                ['About Us', '/about'],
              ].map(([label, path]) => (
                <li key={label}>
                  <Link
                    to={path}
                    className={`transition-all duration-300 hover:translate-x-1 ${isDark
                      ? 'text-white/60 hover:text-[#B0FFFA]'
                      : 'text-black/60 hover:text-[#00B8A9]'
                      }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-sm">
              {[
                'Help Center',
                'Contact Us',
                'Privacy Policy',
                'Terms of Service',
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className={`transition-all duration-300 hover:translate-x-1 ${isDark
                      ? 'text-white/60 hover:text-[#B0FFFA]'
                      : 'text-black/60 hover:text-[#00B8A9]'
                      }`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-14 text-center">
          <p
            className={`text-xs tracking-wide ${isDark ? 'text-white/40' : 'text-black/40'
              }`}
          >
            © {new Date().getFullYear()} EVO-A. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
