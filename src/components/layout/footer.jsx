import { useState } from 'react';
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

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAiDisclaimerOpen, setIsAiDisclaimerOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  const handleSupportLinkClick = (e, label) => {
    e.preventDefault();
    if (label === 'Privacy Policy') setIsPrivacyOpen(true);
    if (label === 'Terms of Service') setIsTermsOpen(true);
    if (label === 'AI Disclaimer') setIsAiDisclaimerOpen(true);
    if (label === 'Community Guidelines') setIsCommunityOpen(true);
  };

  const closeModal = () => {
    setIsPrivacyOpen(false);
    setIsTermsOpen(false);
    setIsAiDisclaimerOpen(false);
    setIsCommunityOpen(false);
  };

  return (
    <>
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
                  'Privacy Policy',
                  'Terms of Service',
                  'AI Disclaimer',
                  'Community Guidelines',
                ].map((label) => (
                  <li key={label}>
                    <a
                      href="#"
                      onClick={(e) => handleSupportLinkClick(e, label)}
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

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-4xl md:w-[60vw] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900 text-white border border-white/10' : 'bg-white text-gray-900 border border-gray-200'}`}>
            <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold">Privacy Policy</h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className={`space-y-6 text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  <strong>Evoa Technology Private Limited</strong> ("Evoa", "Company", "we", "us", or "our") respects your privacy and is committed to protecting your personal data.
                </p>
                <p>
                  This Privacy Policy explains how we collect, use, store, and protect your information when you use:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The Evoa platform</li>
                  <li>Investor AI</li>
                  <li>021 AI (Zero to One AI Startup Assistant)</li>
                  <li>Our website <strong>evoa.co.in</strong></li>
                  <li>Any related services, applications, or tools</li>
                </ul>
                <p className="italic">
                  By using Evoa services, you agree to the collection and use of information in accordance with this policy.
                </p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>1. About Evoa</h3>
                <p>Evoa is a digital platform designed to connect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Startup founders</li>
                  <li>Investors</li>
                  <li>Builders</li>
                  <li>Startup enthusiasts</li>
                </ul>
                <p>
                  Users can pitch startup ideas through short video reels, explore startups, validate ideas using AI tools, and connect with investors.
                </p>
                <p>Evoa integrates artificial intelligence systems including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Investor AI</strong> — an AI assistant that helps evaluate startup pitches and investment insights.</li>
                  <li><strong>021 AI</strong> — an AI startup assistant that helps transform ideas into startups through guided workflows and AI-powered roles (CEO, CTO, CMO, etc.).</li>
                </ul>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>2. Information We Collect</h3>
                <p>We collect different types of information depending on how you interact with the platform.</p>

                <h4 className={`text-md font-semibold mt-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>2.1 Personal Information</h4>
                <p>When you register or use our services, we may collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Full name</li>
                  <li>Username</li>
                  <li>Email address</li>
                  <li>Profile photo</li>
                  <li>Password (encrypted)</li>
                  <li>Country / location</li>
                  <li>Startup information</li>
                  <li>Investor profile information</li>
                </ul>

                <h4 className={`text-md font-semibold mt-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>2.2 Startup Information</h4>
                <p>If you upload a pitch or startup information, we may collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Startup name & description</li>
                  <li>Pitch videos</li>
                  <li>Business model information</li>
                  <li>Financial insights (if voluntarily provided)</li>
                  <li>Market & product information</li>
                </ul>
                <p className="italic">This data may be displayed publicly depending on your settings.</p>

                <h4 className={`text-md font-semibold mt-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>2.3 AI Interaction Data</h4>
                <p>When you interact with Investor AI or 021 AI, we may collect:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Startup ideas you submit</li>
                  <li>AI prompts and responses</li>
                  <li>Feedback and ratings</li>
                  <li>AI generated outputs</li>
                  <li>Chat logs with AI assistants</li>
                </ul>
                <p>This data is used to improve AI performance and service quality.</p>

                <h4 className={`text-md font-semibold mt-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>2.4 Usage Data</h4>
                <p>We automatically collect usage data including:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>IP address, browser type, and device type</li>
                  <li>Operating system</li>
                  <li>Pages visited & time spent</li>
                  <li>Click interactions & engagement with startup pitches</li>
                </ul>

                <h4 className={`text-md font-semibold mt-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>2.5 Cookies and Tracking</h4>
                <p>We may use cookies, analytics tools, and performance tracking technologies to improve user experience, security, and platform performance. Users can disable cookies through browser settings.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>3. How We Use Your Information</h3>
                <p>We use collected information to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Platform Operations:</strong> Create/manage accounts, display pitches, enable networking, provide messaging.</li>
                  <li><strong>AI Services:</strong> Operate Investor AI & 021 AI, improve AI responses, and train AI systems.</li>
                  <li><strong>Platform Improvement:</strong> Enhance features, understand user behavior, optimize experience.</li>
                  <li><strong>Security:</strong> Prevent fraud, detect suspicious activity, protect users.</li>
                  <li><strong>Communication:</strong> Send updates, notify about changes, provide support.</li>
                </ul>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>4. AI System Usage (Investor AI & 021 AI)</h3>
                <p>Evoa provides AI-powered tools that assist with startup idea validation, market analysis, business models, pitch feedback, and investor insights.</p>
                <p><strong>Important considerations:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>AI responses are informational only.</li>
                  <li>AI output does <strong>not</strong> constitute financial, legal, or investment advice.</li>
                  <li>Users should independently verify any AI-generated insights.</li>
                </ul>
                <p className="italic">Evoa is not responsible for business decisions made based on AI outputs.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>5. Public Content</h3>
                <p>Some information may be publicly visible, including pitch videos, descriptions, profiles, and comments. Users are responsible for ensuring they do not upload confidential or proprietary information.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>6. Data Sharing & Security</h3>
                <p>We do not sell user data. We may share data with service providers (cloud, payment, analytics, AI infrastructure) and if required by Indian law.</p>
                <p>We implement security measures including encryption and secure authentication. However, no system is 100% secure. Users must protect their credentials.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>7. Retention, Your Rights & Minors</h3>
                <p>We retain data as long as necessary. Users may access data, update profiles, or request account deletion via <strong>support@evoa.co.in</strong>.</p>
                <p>Evoa services are not intended for users under 14 years of age.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>8. Contact Information</h3>
                <p>
                  <strong>Evoa Technology Private Limited</strong><br />
                  Email: <a href="mailto:admin@evoa.co.in" className={`transition-colors hover:underline ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`}>support@evoa.co.in</a><br />
                  Website: <a href="https://evoa.co.in" target="_blank" rel="noopener noreferrer" className={`transition-colors hover:underline ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`}>https://evoa.co.in</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-4xl md:w-[60vw] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900 text-white border border-white/10' : 'bg-white text-gray-900 border border-gray-200'}`}>
            <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold">Terms of Service</h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className={`space-y-6 text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  These Terms of Service govern your use of the Evoa platform, Investor AI, 021 AI, and our website <strong>evoa.co.in</strong>.
                </p>
                <p className="italic">By accessing Evoa services, you agree to these terms.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>1. Eligibility</h3>
                <p>To use Evoa, you must:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Be at least 14 years old</li>
                  <li>Provide accurate information</li>
                  <li>Comply with all applicable laws</li>
                </ul>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>2. User Accounts</h3>
                <p>Users must maintain accurate profile information, keep login credentials secure, and be responsible for activities on their account. Evoa reserves the right to suspend accounts for violations.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>3. Platform Purpose</h3>
                <p>Evoa is designed to enable startup pitching, help investors discover startups, and assist founders through AI tools.</p>
                <p className="font-semibold">Evoa does not guarantee funding, investment, or business success.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>4. AI Services Disclaimer</h3>
                <p>Investor AI and 021 AI provide automated insights. They do <strong>not</strong> provide:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Investment advice</li>
                  <li>Legal advice</li>
                  <li>Financial guarantees</li>
                </ul>
                <p>Users should perform independent research before making decisions.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>5. Startup Pitches</h3>
                <p>Founders are responsible for ensuring that:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Their pitches are truthful</li>
                  <li>They have rights to the information they share</li>
                  <li>They do not upload misleading or fraudulent information</li>
                </ul>
                <p className="italic">Evoa does not verify every startup claim.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>6. Intellectual Property</h3>
                <p>Users retain ownership of their startup ideas, pitch videos, and uploaded content. However, by uploading content, users grant Evoa a license to display, distribute, and promote the content within the platform.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>7. Prohibited Activities</h3>
                <p>Users must not:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Upload illegal content</li>
                  <li>Impersonate others</li>
                  <li>Spread misinformation</li>
                  <li>Attempt platform hacking</li>
                  <li>Use bots to manipulate engagement</li>
                </ul>
                <p className={`italic ${isDark ? 'text-red-400' : 'text-red-500'}`}>Violation may result in account suspension.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>8. Payments and Subscriptions</h3>
                <p>Evoa may offer premium services (startup promotion, analytics, premium AI features). Payments may be processed through third-party payment providers. All fees are non-refundable unless required by law.</p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>9. Limitation of Liability</h3>
                <p>Evoa is not liable for investment losses, business failures, decisions based on AI outputs, or interactions between users. <strong>Users participate on the platform at their own risk.</strong></p>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>10. Governing Law & Contact</h3>
                <p>These Terms are governed by the laws of India. We may update these Terms periodically.</p>
                <p>
                  <strong>Contact for legal or support queries:</strong><br />
                  Evoa Technology Private Limited<br />
                  Email: <a href="mailto:support@evoa.co.in" className={`transition-colors hover:underline ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`}>support@evoa.co.in</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Disclaimer Modal */}
      {isAiDisclaimerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-4xl md:w-[60vw] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900 text-white border border-white/10' : 'bg-white text-gray-900 border border-gray-200'}`}>
            <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold">AI Disclaimer</h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className={`space-y-6 text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>
                  Evoa provides AI-powered tools including <strong>Investor AI</strong> and <strong>021 AI</strong> to assist users with startup insights, idea validation, and informational analysis.
                </p>

                <div className={`p-4 rounded-lg border flex items-start gap-4 ${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'}`}>
                  <svg className={`w-6 h-6 shrink-0 mt-0.5 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                    <h4 className={`font-bold mb-2 ${isDark ? 'text-orange-200' : 'text-orange-900'}`}>Important AI Limitations</h4>
                    <p className={`text-sm ${isDark ? 'text-orange-200/80' : 'text-orange-800'}`}>These AI systems generate responses automatically and may contain inaccuracies.</p>
                  </div>
                </div>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>The information provided by AI tools:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Does <strong>not</strong> constitute financial advice</li>
                  <li>Does <strong>not</strong> constitute legal advice</li>
                  <li>Does <strong>not</strong> constitute investment advice</li>
                  <li>Should <strong>not</strong> be solely relied upon for business decisions</li>
                </ul>

                <p className="font-semibold mt-4">
                  Users are responsible for independently verifying any information before making decisions.
                </p>
                <p className="italic text-sm">
                  Evoa Technology Private Limited is not responsible for any actions taken based on AI-generated content.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Guidelines Modal */}
      {isCommunityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`relative w-full max-w-4xl md:w-[60vw] max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-gray-900 text-white border border-white/10' : 'bg-white text-gray-900 border border-gray-200'}`}>
            <div className={`flex justify-between items-center px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <h2 className="text-xl font-bold">Community Guidelines</h2>
              <button
                onClick={closeModal}
                className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className={`space-y-6 text-sm sm:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <div className={`text-center mb-8 pb-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <svg className={`w-12 h-12 mx-auto mb-4 opacity-80 ${isDark ? 'text-[#B0FFFA]' : 'text-[#00B8A9]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  <p className="max-w-2xl mx-auto">
                    We are building a trusted ecosystem for founders and investors. Respect, honesty, and professionalism are our core values.
                  </p>
                </div>

                <h3 className={`text-lg font-bold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Prohibited Content & Actions</h3>
                <p>Users must <strong>not</strong> upload or share:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Fraudulent startup claims or fake traction</li>
                  <li>Misleading financial information or manipulated metrics</li>
                  <li>Illegal content of any kind</li>
                  <li>Hate speech, harassment, or abusive language</li>
                  <li>Copyrighted material without explicit permission</li>
                  <li>Confidential or proprietary business information they do not have the rights to share</li>
                </ul>

                <div className={`p-4 rounded-lg mt-8 ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                  <p className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Evoa reserves the right to remove any content that violates these guidelines.
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-red-400/80' : 'text-red-600/80'}`}>
                    Accounts involved in fraudulent activities may be suspended or permanently banned without prior notice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
