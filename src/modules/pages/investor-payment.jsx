import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingNav from "../../components/layout/LandingNav";
import Footer from "../../components/layout/footer";
import { useAuth } from "../../contexts/AuthContext";
import { openRazorpayCheckout } from "../../utils/razorpay";

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&display=swap');

.ip-root { min-height: 100vh; background:#060607; color:#F4F0E8; font-family:'Cormorant Garamond', serif; }
.ip-shell { max-width: 980px; margin: 0 auto; padding: 140px 20px 100px; }
.ip-head { text-align:center; margin-bottom: 48px; }
.ip-kicker { display:inline-block; font-family:'DM Mono', monospace; font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:#E8341A; margin-bottom:18px; }
.ip-title { font-family:'Bebas Neue', sans-serif; font-size: clamp(44px, 8vw, 88px); letter-spacing:.04em; line-height:.92; margin:0 0 16px; }
.ip-sub { max-width: 560px; margin: 0 auto; font-size: 18px; line-height:1.7; color:rgba(244,240,232,.58); }
.ip-card { background:#0f0f10; border:1px solid rgba(244,240,232,.08); padding:32px 28px; display:grid; grid-template-columns:1.15fr .85fr; gap:28px; }
.ip-block-title { font-family:'Bebas Neue', sans-serif; font-size:28px; letter-spacing:.04em; margin:0 0 12px; }
.ip-copy { font-size:16px; line-height:1.75; color:rgba(244,240,232,.62); margin:0 0 24px; }
.ip-price { font-family:'Bebas Neue', sans-serif; font-size:54px; color:#C9A84C; line-height:1; margin-bottom:16px; }
.ip-list { list-style:none; padding:0; margin:0; display:grid; gap:12px; }
.ip-list li { display:flex; gap:12px; font-size:15px; line-height:1.6; color:rgba(244,240,232,.84); }
.ip-list li::before { content:'✦'; color:#E8341A; margin-top:2px; }
.ip-side { border-left:1px solid rgba(244,240,232,.08); padding-left:28px; display:flex; flex-direction:column; justify-content:space-between; }
.ip-note { font-family:'DM Mono', monospace; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:rgba(244,240,232,.38); }
.ip-error { margin-top:18px; border:1px solid rgba(232,52,26,.28); background:rgba(232,52,26,.08); color:#F1B3AA; padding:12px 14px; font-family:'DM Mono', monospace; font-size:10px; letter-spacing:.08em; text-transform:uppercase; }
.ip-btn { min-height:50px; padding:0 20px; border:none; cursor:pointer; font-family:'DM Mono', monospace; font-size:11px; letter-spacing:.16em; text-transform:uppercase; transition:transform .2s, background .2s; }
.ip-btn:hover:not(:disabled) { transform:translateY(-2px); }
.ip-btn.primary { background:#E8341A; color:#060607; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); }
.ip-btn.secondary { background:transparent; color:#F4F0E8; border:1px solid rgba(244,240,232,.14); }
.ip-actions { display:grid; gap:12px; }
@media (max-width: 900px) {
  .ip-card { grid-template-columns:1fr; }
  .ip-side { border-left:none; border-top:1px solid rgba(244,240,232,.08); padding-left:0; padding-top:24px; }
}
`;

export default function InvestorPaymentPage() {
  const navigate = useNavigate();
  const { user, refreshUserProfile } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const alreadyUnlocked = useMemo(() => {
    return !!(user?.isLegacyUser || (user?.isPremium && !user?.isPaymentPending));
  }, [user]);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");
      await openRazorpayCheckout({
        planType: "investor_premium",
        user,
        onSuccess: async () => {
          await refreshUserProfile();
          navigate("/investor", { replace: true });
        },
      });
    } catch (err) {
      setError(err?.message || "Unable to complete payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ip-root">
      <style>{PAGE_CSS}</style>
      <LandingNav />
      <div className="ip-shell">
        <div className="ip-head">
          <div className="ip-kicker">Investor Access</div>
          <h1 className="ip-title">Unlock Investor Access 💼</h1>
          <p className="ip-sub">Access startups, connect with founders, and explore insights.</p>
        </div>

        <section className="ip-card">
          <div>
            <h2 className="ip-block-title">Investor Premium</h2>
            <p className="ip-copy">Discover the next big thing before everyone else.</p>
            <div className="ip-price">₹4999/month</div>
            <ul className="ip-list">
              <li>Full access to all startup data</li>
              <li>Direct messaging with founders</li>
              <li>Early access to top startups</li>
              <li>Investor analytics dashboard</li>
            </ul>
          </div>

          <div className="ip-side">
            <div className="ip-note">New investor registrations require payment before premium tools are unlocked.</div>
            <div className="ip-actions">
              <button className="ip-btn primary" onClick={handlePayment} disabled={loading || alreadyUnlocked}>
                {alreadyUnlocked ? "Access Unlocked" : loading ? "Processing..." : "Continue to Payment – ₹4999/month"}
              </button>
              <button className="ip-btn secondary" onClick={() => navigate("/pricing")}>
                View Pricing
              </button>
            </div>
          </div>
        </section>

        {error ? <div className="ip-error">{error}</div> : null}
      </div>
      <Footer />
    </div>
  );
}
