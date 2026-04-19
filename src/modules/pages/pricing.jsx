import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/footer";
import LandingNav from "../../components/layout/LandingNav";
import pricingService from "../../services/pricingService";

const PRICING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');

@keyframes pr-fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes pr-cardIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes pr-pulse { 0%,100%{ opacity:.5; transform:scale(1); } 50%{ opacity:1; transform:scale(1.04); } }

.pr-root {
  background: #060607;
  color: #F4F0E8;
  font-family: 'Cormorant Garamond', Georgia, serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

.pr-root::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 14% 18%, rgba(232,52,26,.08), transparent 26%),
    radial-gradient(circle at 82% 14%, rgba(201,168,76,.06), transparent 26%),
    linear-gradient(rgba(244,240,232,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(244,240,232,.018) 1px, transparent 1px);
  background-size: auto, auto, 56px 56px, 56px 56px;
  opacity: .55;
}

.pr-hero {
  position: relative;
  padding: 140px 80px 100px;
  text-align: center;
  overflow: hidden;
}

.pr-hero-ghost {
  position: absolute;
  left: 50%;
  top: -10px;
  transform: translateX(-50%);
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(140px, 22vw, 340px);
  color: rgba(244,240,232,.018);
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.pr-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: #E8341A;
  border: 1px solid rgba(232,52,26,.3);
  padding: 6px 18px;
  border-radius: 40px;
  margin-bottom: 28px;
  opacity: 0;
  animation: pr-fadeUp .7s ease forwards .06s;
}

.pr-pill::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #E8341A;
  display: inline-block;
  animation: pr-pulse 2s ease-in-out infinite;
}

.pr-hero h1 {
  position: relative;
  z-index: 1;
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(56px, 8vw, 118px);
  letter-spacing: .04em;
  line-height: .9;
  margin: 0 0 24px;
  opacity: 0;
  animation: pr-fadeUp .82s ease forwards .14s;
}

.pr-hero h1 em {
  display: block;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-weight: 300;
  color: #C9A84C;
  font-size: .64em;
  line-height: 1.28;
  letter-spacing: .02em;
}

.pr-hero-sub {
  position: relative;
  z-index: 1;
  max-width: 580px;
  margin: 0 auto 48px;
  font-size: clamp(16px, 2vw, 20px);
  font-weight: 300;
  line-height: 1.75;
  color: rgba(244,240,232,.55);
  opacity: 0;
  animation: pr-fadeUp .9s ease forwards .22s;
}

.pr-divider {
  width: 80px;
  height: 1px;
  margin: 0 auto 56px;
  background: linear-gradient(90deg, transparent, rgba(232,52,26,.5), rgba(201,168,76,.42), transparent);
}

.pr-section {
  position: relative;
  padding: 0 80px 120px;
}

.pr-section-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 64px;
}

.pr-stag {
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: #E8341A;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.pr-stag::before {
  content: '';
  width: 22px;
  height: 1px;
  background: #E8341A;
  flex-shrink: 0;
}

.pr-section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(38px, 5vw, 58px);
  letter-spacing: .04em;
  color: #C9A84C;
  margin: 0 0 12px;
}

.pr-section-sub {
  font-size: clamp(15px, 1.8vw, 18px);
  font-weight: 300;
  color: rgba(244,240,232,.55);
  line-height: 1.7;
  margin: 0;
}

.pr-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.pr-card {
  position: relative;
  background: #0f0f10;
  border: 1px solid rgba(244,240,232,.07);
  padding: 30px 28px 28px;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  transition: border-color .3s, transform .35s;
  animation: pr-cardIn .48s ease both;
}

.pr-card:hover {
  border-color: rgba(232,52,26,.25);
  transform: translateY(-6px);
}

.pr-card.pro {
  box-shadow: inset 0 0 0 1px rgba(232,52,26,.12);
  border-color: rgba(232,52,26,.26);
}

.pr-card-tag {
  align-self: flex-start;
  margin-bottom: 18px;
  padding: 5px 12px;
  background: rgba(6,6,7,.72);
  border: 1px solid rgba(232,52,26,.3);
  color: #E8341A;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.pr-card-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(24px, 2.2vw, 32px);
  letter-spacing: .04em;
  line-height: 1.04;
  color: #F4F0E8;
  margin: 0 0 14px;
}

.pr-card-copy {
  font-size: 15px;
  font-weight: 300;
  line-height: 1.75;
  color: rgba(244,240,232,.55);
  margin: 0 0 24px;
}

.pr-price-block {
  margin-bottom: 22px;
}

.pr-price-label {
  display: block;
  margin-bottom: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(244,240,232,.34);
}

.pr-price {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 42px;
  letter-spacing: .04em;
  line-height: 1;
  color: #C9A84C;
}

.pr-list-title {
  margin: 22px 0 14px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: .18em;
  text-transform: uppercase;
  color: rgba(244,240,232,.42);
}

.pr-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.pr-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 15px;
  line-height: 1.65;
  color: rgba(244,240,232,.82);
}

.pr-list li::before {
  content: '✦';
  color: #E8341A;
  font-size: 11px;
  margin-top: 6px;
  flex-shrink: 0;
}

.pr-rule {
  height: 1px;
  margin: 22px 0;
  background: linear-gradient(90deg, transparent, rgba(244,240,232,.08), transparent);
}

.pr-actions {
  margin-top: auto;
  padding-top: 28px;
  display: grid;
  gap: 12px;
}

.pr-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 20px;
  text-decoration: none;
  background: transparent;
  border: 1px solid rgba(244,240,232,.14);
  color: rgba(244,240,232,.82);
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: .16em;
  text-transform: uppercase;
  transition: background .28s, border-color .28s, color .28s, transform .28s;
}

.pr-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(244,240,232,.28);
  background: rgba(244,240,232,.06);
  color: #F4F0E8;
}

.pr-btn.primary {
  background: #E8341A;
  border-color: #E8341A;
  color: #060607;
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
}

.pr-btn.primary:hover {
  background: #C9A84C;
  border-color: #C9A84C;
  color: #060607;
}

.pr-meta {
  margin-top: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 9px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: rgba(244,240,232,.28);
}

.pr-state {
  text-align: center;
  padding: 80px 24px;
  color: rgba(244,240,232,.4);
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  letter-spacing: .1em;
  text-transform: uppercase;
}

@media (max-width: 1180px) {
  .pr-grid {
    grid-template-columns: 1fr;
    max-width: 760px;
  }
}

@media (max-width: 768px) {
  .pr-hero {
    padding: 120px 20px 80px;
  }
  .pr-section {
    padding: 0 20px 100px;
  }
}
`;

const defaultPricing = {
  startups: {
    title: "For Startups 🚀",
    description: "Turn your ideas into opportunities. Pitch, grow, and get discovered.",
    features: [
      "Pitch your startup using reels",
      "Access investor insights",
      "Engagement analytics (basic)",
      "Build visibility",
    ],
    freePlan: {
      price: "₹0/month",
      cta: "Get Started",
    },
    proPlan: {
      price: "₹999/month",
      cta: "Upgrade to Pro",
      features: [
        "upload more than one pitch videos",
        "Priority visibility to investors",
        "Featured placement in feeds",
        "Access to premium investor network",
      ],
    },
  },
  investors: {
    title: "For Investors 💼",
    description: "Discover the next big thing before everyone else.",
    features: [
      "Get advanced analytics",
      "Get recomendations and analysis with Investor AI.",
      "Discover curated pitches",
      "Save and track startup",
    ],
    freePlan: {
      price: "Free Browsing (limited access)",
      cta: "Explore Startups",
    },
    premiumPlan: {
      price: "₹4999/month",
      cta: "Go Premium",
      features: [
        "Full access to all startup data",
        "Direct messaging with founders",
        "Early access to top startups",
        "Investor analytics dashboard",
      ],
    },
  },
  ambassador: {
    title: "Ambassador Program 🌟",
    description: "Be the voice of Evoa. Grow with us and earn along the way.",
    features: [
      "Represent Evoa in your network",
      "Earn money on successful referrals",
    ],
    price: "Free to join",
    benefits: [
      "Incentives per referral",
      "Exclusive community access",
      "Recognition & leaderboard",
    ],
    cta: "Join Program",
  },
};

export default function PricingPage() {
  const [pricing, setPricing] = useState(defaultPricing);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadPricing = async () => {
      try {
        const response = await pricingService.getPricing();
        if (mounted && response?.data?.data) {
          setPricing(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load pricing:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPricing();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="pr-root">
      <style>{PRICING_CSS}</style>
      <LandingNav />

      <section className="pr-hero">
        <div className="pr-hero-ghost">PLANS</div>
        <div className="pr-pill">Pricing</div>
        <h1>
          Simple, Transparent
          <em>Pricing</em>
        </h1>
        <p className="pr-hero-sub">Choose the plan that fits your journey on Evoa.</p>
        <div className="pr-divider" />
      </section>

      <section className="pr-section">
        <div className="pr-section-head">
          <div className="pr-stag">Plans for Every Journey</div>
          <h2 className="pr-section-title">Built for founders, investors, and growth champions</h2>
          <p className="pr-section-sub">
            Clear plans, no clutter, and a structure that helps each side of the Evoa ecosystem move faster.
          </p>
        </div>

        {loading ? (
          <div className="pr-state">Loading Pricing</div>
        ) : (
          <div className="pr-grid">
            <article className="pr-card" style={{ animationDelay: ".08s" }}>
              <div className="pr-card-tag">Startups</div>
              <h3 className="pr-card-title">{pricing.startups.title}</h3>
              <p className="pr-card-copy">{pricing.startups.description}</p>

              <div className="pr-price-block">
                <span className="pr-price-label">Free Plan</span>
                <div className="pr-price">{pricing.startups.freePlan.price}</div>
              </div>

              <ul className="pr-list">
                {pricing.startups.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="pr-rule" />

              <div className="pr-price-block">
                <span className="pr-price-label">Pro Plan</span>
                <div className="pr-price">{pricing.startups.proPlan.price}</div>
              </div>

              <div className="pr-list-title">Pro Features</div>
              <ul className="pr-list">
                {pricing.startups.proPlan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="pr-actions">
                <Link to="/register" className="pr-btn">{pricing.startups.freePlan.cta}</Link>
                <Link to="/login" className="pr-btn primary">{pricing.startups.proPlan.cta}</Link>
                <div className="pr-meta">Pitch, grow, and get discovered.</div>
              </div>
            </article>

            <article className="pr-card pro" style={{ animationDelay: ".16s" }}>
              <div className="pr-card-tag">Investors</div>
              <h3 className="pr-card-title">{pricing.investors.title}</h3>
              <p className="pr-card-copy">{pricing.investors.description}</p>

              <div className="pr-price-block">
                <span className="pr-price-label">Free Browsing</span>
                <div className="pr-price">{pricing.investors.freePlan.price}</div>
              </div>

              <ul className="pr-list">
                {pricing.investors.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="pr-rule" />

              <div className="pr-price-block">
                <span className="pr-price-label">Premium</span>
                <div className="pr-price">{pricing.investors.premiumPlan.price}</div>
              </div>

              <div className="pr-list-title">Premium Features</div>
              <ul className="pr-list">
                {pricing.investors.premiumPlan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="pr-actions">
                <Link to="/explore" className="pr-btn">{pricing.investors.freePlan.cta}</Link>
                <Link to="/login" className="pr-btn primary">{pricing.investors.premiumPlan.cta}</Link>
                <div className="pr-meta">Discover the next big thing before everyone else.</div>
              </div>
            </article>

            <article className="pr-card" style={{ animationDelay: ".24s" }}>
              <div className="pr-card-tag">Ambassador</div>
              <h3 className="pr-card-title">{pricing.ambassador.title}</h3>
              <p className="pr-card-copy">{pricing.ambassador.description}</p>

              <div className="pr-price-block">
                <span className="pr-price-label">Access</span>
                <div className="pr-price">{pricing.ambassador.price}</div>
              </div>

              <ul className="pr-list">
                {pricing.ambassador.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="pr-rule" />

              <div className="pr-list-title">Benefits</div>
              <ul className="pr-list">
                {pricing.ambassador.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>

              <div className="pr-actions">
                <Link to="/ambassador-program" className="pr-btn primary">{pricing.ambassador.cta}</Link>
                <div className="pr-meta">Grow with us and earn along the way.</div>
              </div>
            </article>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
