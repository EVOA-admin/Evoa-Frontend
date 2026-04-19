import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';

/* ─── EVOA Modal CSS — matches home page PolicyModal exactly ─── */
const FOOTER_MODAL_CSS = `
.ft-modal-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.75);backdrop-filter:blur(10px);cursor:default}
.ft-modal-box{position:relative;width:100%;max-width:760px;max-height:80vh;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;background:#111;border:1px solid rgba(244,240,232,.1);box-shadow:0 40px 120px rgba(0,0,0,.8)}
.ft-modal-hdr{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(244,240,232,.08)}
.ft-modal-hdr h2{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:.06em;color:#F4F0E8;margin:0}
.ft-modal-close{background:none;border:none;cursor:pointer!important;color:rgba(244,240,232,.5);padding:8px;display:flex;transition:color .2s;border-radius:4px}
.ft-modal-close:hover{color:#F4F0E8}
.ft-modal-body{padding:24px;overflow-y:auto;font-family:'Cormorant Garamond',serif;font-size:15px;font-weight:300;line-height:1.8;color:rgba(244,240,232,.7)}
.ft-modal-body h3{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.05em;color:#C9A84C;margin:24px 0 8px}
.ft-modal-body h4{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(244,240,232,.7);margin:16px 0 6px}
.ft-modal-body ul{padding-left:20px;margin:8px 0}
.ft-modal-body li{margin-bottom:4px}
.ft-modal-body p{margin-bottom:12px}
.ft-modal-body a{color:#E8341A;text-decoration:none}
.ft-modal-body a:hover{text-decoration:underline}
.ft-modal-warn{background:rgba(232,52,26,.08);border:1px solid rgba(232,52,26,.2);border-radius:6px;padding:14px 18px;margin:12px 0;display:flex;gap:12px;align-items:flex-start}
.ft-modal-warn-icon{color:#E8341A;flex-shrink:0;margin-top:2px}
.ft-modal-warn strong{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#E8341A;display:block;margin-bottom:6px}
.ft-modal-community-icon{color:#C9A84C;display:block;margin:0 auto 16px;opacity:.8}
`;

/* ─── Reusable PolicyModal (dark EVOA style) ─── */
function PolicyModal({ title, children, onClose }) {
  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="ft-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ft-modal-box">
        <div className="ft-modal-hdr">
          <h2>{title}</h2>
          <button className="ft-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="ft-modal-body">{children}</div>
      </div>
    </div>
  );
}

const XIcon = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/* ─── Footer styles (dark EVOA — no Tailwind) ─── */
const FOOTER_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600&family=DM+Mono:wght@300;400&display=swap');

.evoa-footer {
  background:#0A0A0A;
  border-top:1px solid rgba(244,240,232,.06);
  padding:64px 80px 32px;
  font-family:'Cormorant Garamond',serif;
  position:relative;
}
.evoa-footer-grid {
  display:grid;
  grid-template-columns:1.8fr 1fr 1fr;
  gap:48px;
  margin-bottom:52px;
}
.evoa-footer-brand-name {
  font-family:'Bebas Neue',sans-serif;
  font-size:26px;letter-spacing:.12em;
  color:#F4F0E8;margin-bottom:16px;
}
.evoa-footer-tagline {
  font-size:15px;font-weight:300;line-height:1.75;
  color:rgba(244,240,232,.45);max-width:340px;margin-bottom:24px;
}
.evoa-footer-socials { display:flex;align-items:center;gap:14px; }
.evoa-footer-social-btn {
  width:34px;height:34px;border-radius:50%;
  border:1px solid rgba(244,240,232,.12);
  background:transparent;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  color:rgba(244,240,232,.55);transition:all .25s;text-decoration:none;
}
.evoa-footer-social-btn:hover { border-color:rgba(232,52,26,.4);color:#E8341A; }
.evoa-footer-col-title {
  font-family:'DM Mono',monospace;font-size:9px;
  letter-spacing:.22em;text-transform:uppercase;
  color:#E8341A;margin-bottom:20px;
}
.evoa-footer-links { list-style:none;padding:0;margin:0; }
.evoa-footer-links li { margin-bottom:12px; }
.evoa-footer-links a, .evoa-footer-links button {
  font-family:'Cormorant Garamond',serif;
  font-size:15px;font-weight:300;
  color:rgba(244,240,232,.5);
  text-decoration:none;background:none;border:none;
  cursor:pointer;padding:0;transition:color .2s;
  display:inline-block;
}
.evoa-footer-links a:hover, .evoa-footer-links button:hover { color:#F4F0E8; }
.evoa-footer-bottom {
  border-top:1px solid rgba(244,240,232,.06);
  padding-top:28px;text-align:center;
  font-family:'DM Mono',monospace;font-size:9px;
  letter-spacing:.12em;text-transform:uppercase;
  color:rgba(244,240,232,.25);
}
@media(max-width:1024px){
  .evoa-footer { padding:48px 40px 28px; }
  .evoa-footer-grid { grid-template-columns:1fr 1fr;gap:36px; }
}
@media(max-width:640px){
  .evoa-footer { padding:40px 20px 24px; }
  .evoa-footer-grid { grid-template-columns:1fr;gap:32px; }
}
`;

export default function Footer() {
  const [modal, setModal] = useState(null);
  const close = () => setModal(null);

  return (
    <>
      <style>{FOOTER_CSS}</style>
      <style>{FOOTER_MODAL_CSS}</style>

      <footer className="evoa-footer">
        <div className="evoa-footer-grid">

          {/* Brand */}
          <div>
            <div className="evoa-footer-brand-name">EVO-A</div>
            <p className="evoa-footer-tagline">
              Revolutionizing the startup–investor ecosystem. Connect, invest, and grow together in the future of entrepreneurship.
            </p>
            <div className="evoa-footer-socials">
              <a href="https://www.linkedin.com/company/evo-a" target="_blank" rel="noopener noreferrer" className="evoa-footer-social-btn" aria-label="LinkedIn">
                <FaLinkedin size={15} />
              </a>
              <a href="https://instagram.com/evoaofficial" target="_blank" rel="noopener noreferrer" className="evoa-footer-social-btn" aria-label="Instagram">
                <FaInstagram size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="evoa-footer-col-title">Quick Links</div>
            <ul className="evoa-footer-links">
              {[['Home', '/'], ['Pricing', '/pricing'], ['Sign In', '/login'], ['Sign Up', '/register'], ['About Us', '/about']].map(([label, path]) => (
                <li key={label}><Link to={path}>{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="evoa-footer-col-title">Support</div>
            <ul className="evoa-footer-links">
              {[
                ['Privacy Policy',       'privacy'],
                ['Terms of Service',     'terms'],
                ['AI Disclaimer',        'ai'],
                ['Community Guidelines', 'community'],
              ].map(([label, key]) => (
                <li key={key}>
                  <button onClick={() => setModal(key)}>{label}</button>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="evoa-footer-bottom">
          © {new Date().getFullYear()} EVO-A · Evoa Technology Private Limited · All rights reserved.
        </div>
      </footer>

      {/* ── PRIVACY POLICY ── */}
      {modal === 'privacy' && (
        <PolicyModal title="Privacy Policy" onClose={close}>
          <p><strong>Evoa Technology Private Limited</strong> ("Evoa") respects your privacy and is committed to protecting your personal data.</p>
          <p>This Privacy Policy explains how we collect, use, store, and protect your information when you use the Evoa platform, Investor AI, 021 AI, and our website <strong>evoa.co.in</strong>.</p>
          <h3>1. About Evoa</h3>
          <p>Evoa is a digital platform connecting startup founders, investors, builders, and startup enthusiasts. Users can pitch startup ideas through short video reels, explore startups, validate ideas using AI tools, and connect with investors. Evoa integrates AI systems including <strong>Investor AI</strong> and <strong>021 AI</strong>.</p>
          <h3>2. Information We Collect</h3>
          <h4>2.1 Personal Information</h4>
          <p>When you register or use our services, we may collect full name, username, email address, profile photo, password (encrypted), country/location, startup information, and investor profile information.</p>
          <h4>2.2 Startup Information</h4>
          <p>If you upload a pitch, we may collect startup name &amp; description, pitch videos, business model information, financial insights (if voluntarily provided), and market &amp; product information.</p>
          <h4>2.3 AI Interaction Data</h4>
          <p>When you interact with Investor AI or 021 AI, we may collect startup ideas, AI prompts and responses, feedback and ratings, AI generated outputs, and chat logs.</p>
          <h4>2.4 Usage Data &amp; Cookies</h4>
          <p>We automatically collect IP address, browser/device type, operating system, pages visited, and engagement metrics. We may use cookies to improve user experience and security.</p>
          <h3>3. How We Use Your Information</h3>
          <p>Platform operations, AI services improvement, platform enhancement, security &amp; fraud prevention, and communication about updates.</p>
          <h3>4. AI System Usage</h3>
          <div className="ft-modal-warn">
            <svg className="ft-modal-warn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div>
              <strong>Important</strong>
              AI responses are informational only and do not constitute financial, legal, or investment advice. Evoa is not responsible for business decisions made based on AI outputs.
            </div>
          </div>
          <h3>5. Data Sharing &amp; Security</h3>
          <p>We do not sell user data. We may share data with service providers and if required by Indian law. We implement encryption and secure authentication.</p>
          <h3>6. Retention &amp; Your Rights</h3>
          <p>We retain data as long as necessary. Users may access data, update profiles, or request account deletion via <a href="mailto:support@evoa.co.in">support@evoa.co.in</a>. Evoa services are not intended for users under 14 years of age.</p>
          <h3>7. Contact</h3>
          <p><strong>Evoa Technology Private Limited</strong><br />Email: <a href="mailto:support@evoa.co.in">support@evoa.co.in</a><br />Website: <a href="https://evoa.co.in" target="_blank" rel="noopener noreferrer">evoa.co.in</a></p>
        </PolicyModal>
      )}

      {/* ── TERMS OF SERVICE ── */}
      {modal === 'terms' && (
        <PolicyModal title="Terms of Service" onClose={close}>
          <p>These Terms govern your use of the Evoa platform, Investor AI, 021 AI, and our website <strong>evoa.co.in</strong>.</p>
          <h3>1. Eligibility</h3>
          <p>To use Evoa you must be at least 14 years old, provide accurate information, and comply with all applicable laws.</p>
          <h3>2. User Accounts</h3>
          <p>Users must maintain accurate profile information, keep login credentials secure, and be responsible for activities on their account. Evoa reserves the right to suspend accounts for violations.</p>
          <h3>3. Platform Purpose</h3>
          <p>Evoa enables startup pitching, helps investors discover startups, and assists founders through AI tools. <strong>Evoa does not guarantee funding, investment, or business success.</strong></p>
          <h3>4. AI Services</h3>
          <div className="ft-modal-warn">
            <svg className="ft-modal-warn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div>
              <strong>Disclaimer</strong>
              Investor AI and 021 AI do not provide investment, legal, or financial advice. Users should perform independent research before making decisions.
            </div>
          </div>
          <h3>5. Startup Pitches</h3>
          <p>Founders are responsible for ensuring pitches are truthful, they have rights to the information shared, and they do not upload misleading or fraudulent information. Evoa does not verify every startup claim.</p>
          <h3>6. Intellectual Property</h3>
          <p>Users retain ownership of their content. By uploading, users grant Evoa a license to display, distribute, and promote content within the platform.</p>
          <h3>7. Prohibited Activities</h3>
          <p>Users must not upload illegal content, impersonate others, spread misinformation, attempt platform hacking, or use bots to manipulate engagement. Violation may result in account suspension.</p>
          <h3>8. Limitation of Liability</h3>
          <p>Evoa is not liable for investment losses, business failures, decisions based on AI outputs, or interactions between users. <strong>Users participate at their own risk.</strong></p>
          <h3>9. Governing Law</h3>
          <p>These Terms are governed by the laws of India. Contact: <a href="mailto:support@evoa.co.in">support@evoa.co.in</a></p>
        </PolicyModal>
      )}

      {/* ── AI DISCLAIMER ── */}
      {modal === 'ai' && (
        <PolicyModal title="AI Disclaimer" onClose={close}>
          <p>Evoa provides AI-powered tools including <strong>Investor AI</strong> and <strong>021 AI</strong> to assist users with startup insights, idea validation, and informational analysis.</p>
          <div className="ft-modal-warn">
            <svg className="ft-modal-warn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div>
              <strong>Important AI Limitations</strong>
              These AI systems generate responses automatically and may contain inaccuracies. Always verify independently.
            </div>
          </div>
          <h3>The AI tools do NOT provide:</h3>
          <ul>
            <li>Financial advice</li>
            <li>Legal advice</li>
            <li>Investment advice</li>
            <li>Guarantees of business success</li>
          </ul>
          <p>Users are responsible for independently verifying any information before making decisions.</p>
          <p><em>Evoa Technology Private Limited is not responsible for any actions taken based on AI-generated content.</em></p>
        </PolicyModal>
      )}

      {/* ── COMMUNITY GUIDELINES ── */}
      {modal === 'community' && (
        <PolicyModal title="Community Guidelines" onClose={close}>
          <div style={{ textAlign:'center', marginBottom:24, paddingBottom:20, borderBottom:'1px solid rgba(244,240,232,.08)' }}>
            <svg className="ft-modal-community-icon" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p>We are building a trusted ecosystem for founders and investors. Respect, honesty, and professionalism are our core values.</p>
          </div>
          <h3>Prohibited Content &amp; Actions</h3>
          <p>Users must <strong>not</strong> upload or share:</p>
          <ul>
            <li>Fraudulent startup claims or fake traction</li>
            <li>Misleading financial information or manipulated metrics</li>
            <li>Illegal content of any kind</li>
            <li>Hate speech, harassment, or abusive language</li>
            <li>Copyrighted material without explicit permission</li>
            <li>Confidential or proprietary information they do not have the rights to share</li>
          </ul>
          <div className="ft-modal-warn">
            <svg className="ft-modal-warn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
            <div>
              <strong>Enforcement</strong>
              Evoa reserves the right to remove any content that violates these guidelines. Accounts involved in fraudulent activities may be suspended or permanently banned without prior notice.
            </div>
          </div>
        </PolicyModal>
      )}
    </>
  );
}
