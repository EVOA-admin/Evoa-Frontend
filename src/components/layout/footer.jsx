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

const FOOTER_CSS = `
.evoa-footer {
  position: relative;
  margin-top: 6rem;
  background: var(--bg-alt);
  color: var(--text);
  border-top: 1px solid var(--border);
  transition: all 0.5s;
}
.evoa-footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 3.5rem 1rem;
}
@media (min-width: 640px) {
  .evoa-footer-inner { padding-left: 1.5rem; padding-right: 1.5rem; }
}
@media (min-width: 768px) {
  .evoa-footer-inner { padding-left: 2.5rem; padding-right: 2.5rem; padding-top: 4.5rem; padding-bottom: 4.5rem; }
}
.evoa-footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}
@media (min-width: 768px) {
  .evoa-footer-grid { grid-template-columns: repeat(4, 1fr); gap: 3.5rem; }
}
.evoa-footer-brand {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--text), var(--blue));
  -webkit-background-clip: text;
  color: transparent;
}
.evoa-footer-text {
  font-size: 0.875rem;
  color: var(--text-sub);
  line-height: 1.6;
  max-width: 28rem;
}
.evoa-footer-socials {
  display: flex;
  gap: 1.25rem;
  margin-top: 1.5rem;
}
.evoa-footer-social {
  color: var(--text-mute);
  transition: all 0.3s;
  display: block;
}
.evoa-footer-social:hover {
  color: var(--blue);
  transform: scale(1.15);
}
.evoa-footer-heading {
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text);
}
.evoa-footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.evoa-footer-link {
  font-size: 0.875rem;
  color: var(--text-sub);
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
}
.evoa-footer-link:hover {
  color: var(--blue);
  transform: translateX(4px);
}
.evoa-footer-bottom {
  margin-top: 3.5rem;
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.025em;
  color: var(--text-mute);
}

/* Modals */
.evoa-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
.evoa-modal-content {
  position: relative;
  width: 100%;
  max-width: 56rem;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  border-radius: 1rem;
  background: var(--bg-card);
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
@media (min-width: 768px) {
  .evoa-modal-content { width: 60vw; }
}
.evoa-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
}
.evoa-modal-title {
  font-size: 1.25rem;
  font-weight: 700;
}
.evoa-modal-close {
  padding: 0.5rem;
  border-radius: 9999px;
  background: transparent;
  color: var(--text-mute);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.evoa-modal-close:hover {
  background: var(--bg-deep);
  color: var(--text);
}
.evoa-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  font-size: 0.875rem;
  line-height: 1.625;
  color: var(--text-sub);
}
@media (min-width: 640px) {
  .evoa-modal-body { font-size: 1rem; }
}
.evoa-modal-h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text);
}
.evoa-modal-h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  color: var(--text);
}
.evoa-modal-list {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
.evoa-modal-link {
  color: var(--blue);
  text-decoration: none;
  transition: color 0.2s;
}
.evoa-modal-link:hover {
  text-decoration: underline;
}
.evoa-modal-alert {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--bg-deep);
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}
`;

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
      <style>{FOOTER_CSS}</style>
      <footer className="evoa-footer">
        <div className="evoa-footer-inner">
          <div className="evoa-footer-grid">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="evoa-footer-brand">EVO-A</h3>
              <p className="evoa-footer-text">
                Revolutionizing the startup–investor ecosystem. Connect, invest,
                and grow together in the future of entrepreneurship.
              </p>
              <div className="evoa-footer-socials">
                {[
                  { icon: FaLinkedin, link: "https://www.linkedin.com/company/evo-a" },
                  { icon: FaInstagram, link: "https://instagram.com/evoaofficial" }
                ].map(({ icon: Icon, link }, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="evoa-footer-social"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="evoa-footer-heading">Quick Links</h4>
              <ul className="evoa-footer-links">
                {[
                  ['Home', '/'],
                  ['Sign In', '/login'],
                  ['Sign Up', '/register'],
                  ['About Us', '/about'],
                ].map(([label, path]) => (
                  <li key={label}>
                    <Link to={path} className="evoa-footer-link">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="evoa-footer-heading">Support</h4>
              <ul className="evoa-footer-links">
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
                      className="evoa-footer-link"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="evoa-footer-bottom">
            © {new Date().getFullYear()} EVO-A. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {isPrivacyOpen && (
        <div className="evoa-modal-overlay">
          <div className="evoa-modal-content">
            <div className="evoa-modal-header">
              <h2 className="evoa-modal-title">Privacy Policy</h2>
              <button onClick={closeModal} className="evoa-modal-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="evoa-modal-body">
              <p>
                <strong>Evoa Technology Private Limited</strong> ("Evoa", "Company", "we", "us", or "our") respects your privacy and is committed to protecting your personal data.
              </p>
              <p>
                This Privacy Policy explains how we collect, use, store, and protect your information when you use:
              </p>
              <ul className="evoa-modal-list">
                <li>The Evoa platform</li>
                <li>Investor AI</li>
                <li>021 AI (Zero to One AI Startup Assistant)</li>
                <li>Our website <strong>evoa.co.in</strong></li>
                <li>Any related services, applications, or tools</li>
              </ul>
              <p style={{ fontStyle: 'italic' }}>
                By using Evoa services, you agree to the collection and use of information in accordance with this policy.
              </p>

              <h3 className="evoa-modal-h3">1. About Evoa</h3>
              <p>Evoa is a digital platform designed to connect:</p>
              <ul className="evoa-modal-list">
                <li>Startup founders</li>
                <li>Investors</li>
                <li>Builders</li>
                <li>Startup enthusiasts</li>
              </ul>
              <p>
                Users can pitch startup ideas through short video reels, explore startups, validate ideas using AI tools, and connect with investors.
              </p>
              <p>Evoa integrates artificial intelligence systems including:</p>
              <ul className="evoa-modal-list">
                <li><strong>Investor AI</strong> — an AI assistant that helps evaluate startup pitches and investment insights.</li>
                <li><strong>021 AI</strong> — an AI startup assistant that helps transform ideas into startups through guided workflows and AI-powered roles.</li>
              </ul>

              <h3 className="evoa-modal-h3">2. Information We Collect</h3>
              <p>We collect different types of information depending on how you interact with the platform.</p>

              <h4 className="evoa-modal-h4">2.1 Personal Information</h4>
              <p>When you register or use our services, we may collect:</p>
              <ul className="evoa-modal-list">
                <li>Full name</li>
                <li>Username</li>
                <li>Email address</li>
                <li>Profile photo</li>
                <li>Password (encrypted)</li>
                <li>Country / location</li>
                <li>Startup information</li>
                <li>Investor profile information</li>
              </ul>

              <h4 className="evoa-modal-h4">2.2 Startup Information</h4>
              <p>If you upload a pitch or startup information, we may collect:</p>
              <ul className="evoa-modal-list">
                <li>Startup name & description</li>
                <li>Pitch videos</li>
                <li>Business model information</li>
                <li>Financial insights (if voluntarily provided)</li>
                <li>Market & product information</li>
              </ul>
              <p style={{ fontStyle: 'italic' }}>This data may be displayed publicly depending on your settings.</p>

              <h4 className="evoa-modal-h4">2.3 AI Interaction Data</h4>
              <p>When you interact with Investor AI or 021 AI, we may collect:</p>
              <ul className="evoa-modal-list">
                <li>Startup ideas you submit</li>
                <li>AI prompts and responses</li>
                <li>Feedback and ratings</li>
                <li>AI generated outputs</li>
                <li>Chat logs with AI assistants</li>
              </ul>
              <p>This data is used to improve AI performance and service quality.</p>

              <h4 className="evoa-modal-h4">2.4 Usage Data</h4>
              <p>We automatically collect usage data including:</p>
              <ul className="evoa-modal-list">
                <li>IP address, browser type, and device type</li>
                <li>Operating system</li>
                <li>Pages visited & time spent</li>
                <li>Click interactions & engagement with startup pitches</li>
              </ul>

              <h4 className="evoa-modal-h4">2.5 Cookies and Tracking</h4>
              <p>We may use cookies, analytics tools, and performance tracking technologies to improve user experience, security, and platform performance. Users can disable cookies through browser settings.</p>

              <h3 className="evoa-modal-h3">3. How We Use Your Information</h3>
              <p>We use collected information to:</p>
              <ul className="evoa-modal-list">
                <li><strong>Platform Operations:</strong> Create/manage accounts, display pitches, enable networking, provide messaging.</li>
                <li><strong>AI Services:</strong> Operate Investor AI & 021 AI, improve AI responses, and train AI systems.</li>
                <li><strong>Platform Improvement:</strong> Enhance features, understand user behavior, optimize experience.</li>
                <li><strong>Security:</strong> Prevent fraud, detect suspicious activity, protect users.</li>
                <li><strong>Communication:</strong> Send updates, notify about changes, provide support.</li>
              </ul>

              <h3 className="evoa-modal-h3">4. AI System Usage (Investor AI & 021 AI)</h3>
              <p>Evoa provides AI-powered tools that assist with startup idea validation, market analysis, business models, pitch feedback, and investor insights.</p>
              <p><strong>Important considerations:</strong></p>
              <ul className="evoa-modal-list">
                <li>AI responses are informational only.</li>
                <li>AI output does <strong>not</strong> constitute financial, legal, or investment advice.</li>
                <li>Users should independently verify any AI-generated insights.</li>
              </ul>
              <p style={{ fontStyle: 'italic' }}>Evoa is not responsible for business decisions made based on AI outputs.</p>

              <h3 className="evoa-modal-h3">5. Public Content</h3>
              <p>Some information may be publicly visible, including pitch videos, descriptions, profiles, and comments. Users are responsible for ensuring they do not upload confidential or proprietary information.</p>

              <h3 className="evoa-modal-h3">6. Data Sharing & Security</h3>
              <p>We do not sell user data. We may share data with service providers (cloud, payment, analytics, AI infrastructure) and if required by Indian law.</p>
              <p>We implement security measures including encryption and secure authentication. However, no system is 100% secure. Users must protect their credentials.</p>

              <h3 className="evoa-modal-h3">7. Retention, Your Rights & Minors</h3>
              <p>We retain data as long as necessary. Users may access data, update profiles, or request account deletion via <strong>support@evoa.co.in</strong>.</p>
              <p>Evoa services are not intended for users under 14 years of age.</p>

              <h3 className="evoa-modal-h3">8. Contact Information</h3>
              <p>
                <strong>Evoa Technology Private Limited</strong><br />
                Email: <a href="mailto:admin@evoa.co.in" className="evoa-modal-link">support@evoa.co.in</a><br />
                Website: <a href="https://evoa.co.in" target="_blank" rel="noopener noreferrer" className="evoa-modal-link">https://evoa.co.in</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {isTermsOpen && (
        <div className="evoa-modal-overlay">
          <div className="evoa-modal-content">
            <div className="evoa-modal-header">
              <h2 className="evoa-modal-title">Terms of Service</h2>
              <button onClick={closeModal} className="evoa-modal-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="evoa-modal-body">
              <p>
                These Terms of Service govern your use of the Evoa platform, Investor AI, 021 AI, and our website <strong>evoa.co.in</strong>.
              </p>
              <p style={{ fontStyle: 'italic' }}>By accessing Evoa services, you agree to these terms.</p>

              <h3 className="evoa-modal-h3">1. Eligibility</h3>
              <p>To use Evoa, you must:</p>
              <ul className="evoa-modal-list">
                <li>Be at least 14 years old</li>
                <li>Provide accurate information</li>
                <li>Comply with all applicable laws</li>
              </ul>

              <h3 className="evoa-modal-h3">2. User Accounts</h3>
              <p>Users must maintain accurate profile information, keep login credentials secure, and be responsible for activities on their account. Evoa reserves the right to suspend accounts for violations.</p>

              <h3 className="evoa-modal-h3">3. Platform Purpose</h3>
              <p>Evoa is designed to enable startup pitching, help investors discover startups, and assist founders through AI tools.</p>
              <p style={{ fontWeight: 600 }}>Evoa does not guarantee funding, investment, or business success.</p>

              <h3 className="evoa-modal-h3">4. AI Services Disclaimer</h3>
              <p>Investor AI and 021 AI provide automated insights. They do <strong>not</strong> provide:</p>
              <ul className="evoa-modal-list">
                <li>Investment advice</li>
                <li>Legal advice</li>
                <li>Financial guarantees</li>
              </ul>
              <p>Users should perform independent research before making decisions.</p>

              <h3 className="evoa-modal-h3">5. Startup Pitches</h3>
              <p>Founders are responsible for ensuring that:</p>
              <ul className="evoa-modal-list">
                <li>Their pitches are truthful</li>
                <li>They have rights to the information they share</li>
                <li>They do not upload misleading or fraudulent information</li>
              </ul>
              <p style={{ fontStyle: 'italic' }}>Evoa does not verify every startup claim.</p>

              <h3 className="evoa-modal-h3">6. Intellectual Property</h3>
              <p>Users retain ownership of their startup ideas, pitch videos, and uploaded content. However, by uploading content, users grant Evoa a license to display, distribute, and promote the content within the platform.</p>

              <h3 className="evoa-modal-h3">7. Prohibited Activities</h3>
              <p>Users must not:</p>
              <ul className="evoa-modal-list">
                <li>Upload illegal content</li>
                <li>Impersonate others</li>
                <li>Spread misinformation</li>
                <li>Attempt platform hacking</li>
                <li>Use bots to manipulate engagement</li>
              </ul>
              <p style={{ fontStyle: 'italic', color: 'var(--blue)' }}>Violation may result in account suspension.</p>

              <h3 className="evoa-modal-h3">8. Payments and Subscriptions</h3>
              <p>Evoa may offer premium services (startup promotion, analytics, premium AI features). Payments may be processed through third-party payment providers. All fees are non-refundable unless required by law.</p>

              <h3 className="evoa-modal-h3">9. Limitation of Liability</h3>
              <p>Evoa is not liable for investment losses, business failures, decisions based on AI outputs, or interactions between users. <strong>Users participate on the platform at their own risk.</strong></p>

              <h3 className="evoa-modal-h3">10. Governing Law & Contact</h3>
              <p>These Terms are governed by the laws of India. We may update these Terms periodically.</p>
              <p>
                <strong>Contact for legal or support queries:</strong><br />
                Evoa Technology Private Limited<br />
                Email: <a href="mailto:support@evoa.co.in" className="evoa-modal-link">support@evoa.co.in</a>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Disclaimer Modal */}
      {isAiDisclaimerOpen && (
        <div className="evoa-modal-overlay">
          <div className="evoa-modal-content">
            <div className="evoa-modal-header">
              <h2 className="evoa-modal-title">AI Disclaimer</h2>
              <button onClick={closeModal} className="evoa-modal-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="evoa-modal-body">
              <p>
                Evoa provides AI-powered tools including <strong>Investor AI</strong> and <strong>021 AI</strong> to assist users with startup insights, idea validation, and informational analysis.
              </p>

              <div className="evoa-modal-alert">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <svg style={{ width: '24px', height: '24px', flexShrink: 0, color: 'var(--blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--text)' }}>Important AI Limitations</h4>
                    <p style={{ fontSize: '0.875rem' }}>These AI systems generate responses automatically and may contain inaccuracies.</p>
                  </div>
                </div>
              </div>

              <h3 className="evoa-modal-h3">The information provided by AI tools:</h3>
              <ul className="evoa-modal-list">
                <li>Does <strong>not</strong> constitute financial advice</li>
                <li>Does <strong>not</strong> constitute legal advice</li>
                <li>Does <strong>not</strong> constitute investment advice</li>
                <li>Should <strong>not</strong> be solely relied upon for business decisions</li>
              </ul>

              <p style={{ fontWeight: 'bold', marginTop: '1.5rem' }}>
                Users are responsible for independently verifying any information before making decisions.
              </p>
              <p style={{ fontStyle: 'italic', fontSize: '0.875rem' }}>
                Evoa Technology Private Limited is not responsible for any actions taken based on AI-generated content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Community Guidelines Modal */}
      {isCommunityOpen && (
        <div className="evoa-modal-overlay">
          <div className="evoa-modal-content">
            <div className="evoa-modal-header">
              <h2 className="evoa-modal-title">Community Guidelines</h2>
              <button onClick={closeModal} className="evoa-modal-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="evoa-modal-body">
              <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                <svg style={{ width: '48px', height: '48px', margin: '0 auto 1rem', color: 'var(--blue)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <p style={{ maxWidth: '42rem', margin: '0 auto' }}>
                  We are building a trusted ecosystem for founders and investors. Respect, honesty, and professionalism are our core values.
                </p>
              </div>

              <h3 className="evoa-modal-h3">Prohibited Content & Actions</h3>
              <p>Users must <strong>not</strong> upload or share:</p>
              <ul className="evoa-modal-list">
                <li>Fraudulent startup claims or fake traction</li>
                <li>Misleading financial information or manipulated metrics</li>
                <li>Illegal content of any kind</li>
                <li>Hate speech, harassment, or abusive language</li>
                <li>Copyrighted material without explicit permission</li>
                <li>Confidential or proprietary business information they do not have the rights to share</li>
              </ul>

              <div className="evoa-modal-alert">
                <p style={{ fontWeight: 'bold', color: 'var(--blue)' }}>
                  Evoa reserves the right to remove any content that violates these guidelines.
                </p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Accounts involved in fraudulent activities may be suspended or permanently banned without prior notice.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

