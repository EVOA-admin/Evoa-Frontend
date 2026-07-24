import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import {
  IoCalendarOutline,
  IoTicketOutline,
  IoStarOutline,
  IoCheckmarkCircle,
  IoRocketOutline,
  IoChevronDown,
  IoChevronUp,
  IoFlashOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoArrowForward,
  IoSparkles,
  IoAlertCircleOutline,
  IoCloseCircle,
} from "react-icons/io5";
import { openRazorpayCheckout } from "../../utils/razorpay";
import pricingService from "../../services/pricingService";

export default function EventPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const { user } = useAuth();

  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Check query param for payment success redirect (legacy external URL flow)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("status") === "success" || params.get("payment") === "success") {
      setShowSuccessModal(true);
    }
  }, [location.search]);

  // Auto-dismiss error after 6 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 6000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  const handleJoinNow = async () => {
    if (isLoading) return;

    // Must be logged in
    if (!user) {
      setErrorMsg("Please sign in to purchase the event bundle.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      await openRazorpayCheckout({
        planType: "startup_pro",
        user,
        description: "EVOA × PitchIn 180 Seconds Bundle — ₹999",
        notes: { eventBundle: "pitchin_180s" },
        createOrder: () => pricingService.createEventOrder(),
        verifyPayment: (payload) => pricingService.verifyPayment(payload),
        onSuccess: async () => {
          setShowSuccessModal(true);
        },
        onDismiss: async () => {
          // User closed the modal — silently do nothing
        },
        cancelMessage: "Payment was cancelled.",
      });
    } catch (err) {
      const msg = err?.message || "Something went wrong. Please try again.";
      // Don't show cancellation as an error
      if (!msg.toLowerCase().includes("cancel")) {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is PitchIn 180 Seconds?",
      a: "PitchIn 180 Seconds is a fast-paced live pitch event where founders get exactly 3 minutes (180 seconds) on stage to present their startup to active Angel Investors, VCs, and Ecosystem Leaders.",
    },
    {
      q: "How do I claim my 1 Month EVOA Premium subscription?",
      a: "Upon completing your payment of ₹999, your 1-Month EVOA Premium subscription is automatically activated on your EVOA account instantly. You will receive a confirmation email with your event pass and passkey within 24 hours.",
    },
    {
      q: "Who can participate in this event?",
      a: "Any early-stage, seed, or growth startup across all industries can apply. Whether you have an MVP or an operating business, PitchIn 180 Seconds is designed to get your pitch in front of decision-makers.",
    },
    {
      q: "Can co-founders attend together?",
      a: "Yes! Your ₹999 bundle pass covers entry for up to 2 team members (Founder & Co-founder) to attend and pitch.",
    },
    {
      q: "What happens after I click 'Join Now'?",
      a: "A secure Razorpay checkout modal opens directly in the app. After completing the ₹999 payment, your EVOA Premium is activated instantly and you'll receive your official event ticket and pitching slot confirmation.",
    },
  ];

  const benefits = [
    {
      icon: IoFlashOutline,
      title: "Live 180s VC Pitch Stage",
      desc: "Present your vision directly to a curated panel of VCs, Angel Investors & Incubator Heads.",
    },
    {
      icon: IoStarOutline,
      title: "1 Month EVOA Premium",
      desc: "Unlock top feed placement, direct investor messaging, verified badge, and priority battlefield entries.",
    },
    {
      icon: IoPeopleOutline,
      title: "Exclusive Networking",
      desc: "Connect 1-on-1 with founders, investors, and ecosystem mentors during post-pitch networking.",
    },
    {
      icon: IoShieldCheckmarkOutline,
      title: "Deck & Video Distribution",
      desc: "Your pitch reel and deck get featured to EVOA's network of 500+ accredited investors.",
    },
  ];

  const bundleItems = [
    {
      icon: IoTicketOutline,
      name: "PitchIn 180 Seconds Event Ticket",
      sub: "Live Pitching Pass for Founder & Co-founder",
      val: "₹1,499",
    },
    {
      icon: IoStarOutline,
      name: "1 Month EVOA Premium Subscription",
      sub: "Verified Badge, Pitch Boost & Direct Messaging",
      val: "₹1,999",
    },
    {
      icon: IoSparkles,
      name: "Investor Deck Summary & Feedback",
      sub: "Actionable feedback from panel VCs & mentors",
      val: "₹999",
    },
  ];

  return (
    <AppShell>
      <AppHeader title="Event" />

      <main className={`min-h-screen pb-16 font-sans transition-colors ${isDark ? "bg-[#0a0a0e] text-slate-100" : "bg-slate-50 text-slate-900"}`}>

        {/* ── SUCCESS MODAL ── */}
        {showSuccessModal && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <IoCheckmarkCircle size={24} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-emerald-300">Payment Successful! 🎉</h4>
                <p className="text-xs text-emerald-200/90 mt-1 leading-relaxed">
                  Your <strong>PitchIn 180 Seconds</strong> pass &amp; <strong>1 Month EVOA Premium</strong> are now active.
                  Check your email for the event confirmation and passkey.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="text-xs font-semibold px-2 py-1 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 text-emerald-200 flex-shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── ERROR TOAST ── */}
        {errorMsg && (
          <div className="mx-4 mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-start justify-between gap-3 animate-fadeIn">
            <div className="flex items-start gap-3">
              <IoAlertCircleOutline size={22} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-red-300">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-300 flex-shrink-0 cursor-pointer"
            >
              <IoCloseCircle size={18} />
            </button>
          </div>
        )}

        {/* ── HERO BANNER ── */}
        <div className="relative overflow-hidden px-4 pt-8 pb-10 sm:px-8 border-b border-slate-200/10">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-3xl mx-auto text-center space-y-4">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-blue-600/20 to-amber-500/20 border border-blue-500/30 text-blue-400 shadow-sm">
              <IoSparkles size={14} className="text-amber-400 animate-pulse" />
              EVOA × PitchIn Collaboration
            </div>

            {/* Event Name */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              EVOA × PitchIn <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">180 Seconds</span>
            </h1>

            {/* Short Description */}
            <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Pitch your startup live in <strong>180 seconds</strong> to top VCs and Angel Investors, while unlocking <strong>1 Month of EVOA Premium</strong> to accelerate your fundraising journey.
            </p>

            {/* Meta Pill Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className={`text-xs px-3 py-1 rounded-full border ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                <IoCalendarOutline size={12} className="inline mr-1 text-blue-500" /> Live Stage Pitch
              </span>
              <span className={`text-xs px-3 py-1 rounded-full border ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                <IoStarOutline size={12} className="inline mr-1 text-amber-400" /> 1-Month EVOA Premium Included
              </span>
              <span className={`text-xs px-3 py-1 rounded-full border ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                <IoPeopleOutline size={12} className="inline mr-1 text-emerald-400" /> 500+ VCs &amp; Angels
              </span>
            </div>
          </div>
        </div>

        {/* ── BUNDLE & JOIN NOW CARD ── */}
        <div className="px-4 py-8 max-w-3xl mx-auto">
          <div className={`relative rounded-3xl p-6 sm:p-8 overflow-hidden border shadow-xl transition-all ${
            isDark
              ? "bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-blue-500/30 shadow-blue-900/10"
              : "bg-white border-slate-200 shadow-slate-200/60"
          }`}>
            {/* Ribbon */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              Special Bundle
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                  <IoTicketOutline className="text-blue-500" size={22} />
                  Combined Offer Bundle
                </h2>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Get complete access to PitchIn 180 Seconds event + EVOA Premium at 75% off.
                </p>
              </div>

              {/* Offer Highlight Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}>
                  <span className="text-2xl p-2 rounded-xl bg-blue-500/10 text-blue-500 flex-shrink-0">🎟️</span>
                  <div>
                    <h3 className="text-sm font-bold">PitchIn 180s Event Ticket</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Live stage pitching slot &amp; event pass for 2 founders.
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200/80"
                }`}>
                  <span className="text-2xl p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">⭐</span>
                  <div>
                    <h3 className="text-sm font-bold">1 Month EVOA Premium</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Verified badge, pitch boost, direct VC inbox &amp; battlefield.
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & CTA Row */}
              <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDark
                  ? "bg-gradient-to-r from-blue-950/40 via-slate-900 to-amber-950/30 border-blue-500/20"
                  : "bg-blue-50/60 border-blue-100"
              }`}>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-blue-500">₹999</span>
                    <span className={`text-sm line-through ${isDark ? "text-slate-500" : "text-slate-400"}`}>₹4,497</span>
                    <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">Save ₹3,498</span>
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    All-inclusive single payment • Instant EVOA Premium activation
                  </p>
                </div>

                {/* Prominent JOIN NOW Button */}
                <button
                  id="event-join-now-hero"
                  onClick={handleJoinNow}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <IoRocketOutline size={18} />
                      Join Now — ₹999
                      <IoArrowForward size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── EVENT OVERVIEW SECTION ── */}
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
            <IoSparkles className="text-amber-400" size={20} />
            Event Overview
          </h2>
          <div className={`p-6 rounded-2xl border leading-relaxed text-sm space-y-3 ${
            isDark ? "bg-slate-900/50 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
          }`}>
            <p>
              <strong>PitchIn 180 Seconds</strong> is India's most energetic startup pitching showcase. Founders take center stage to present their business model, traction, and funding ask in a crisp 3-minute pitch followed by direct interaction with top investors.
            </p>
            <p>
              By joining this exclusive EVOA collaboration, your startup doesn't just get a live pitch stage — you also unlock <strong>30 Days of EVOA Premium</strong>. This powers up your digital presence with verified credentials, featured pitch reel spots, and unlimited investor messaging on EVOA.
            </p>
          </div>
        </div>

        {/* ── BENEFITS GRID ── */}
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
            <IoStarOutline className="text-blue-500" size={20} />
            Benefits of Participating
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  isDark
                    ? "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    : "bg-white border-slate-200 hover:border-blue-300 shadow-sm"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-sm mb-1">{title}</h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT'S INCLUDED IN BUNDLE ── */}
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
            <IoCheckmarkCircle className="text-emerald-400" size={20} />
            What's Included in the ₹999 Bundle
          </h2>
          <div className={`rounded-2xl border divide-y overflow-hidden ${
            isDark ? "bg-slate-900/50 border-slate-800 divide-slate-800/80" : "bg-white border-slate-200 divide-slate-100"
          }`}>
            {bundleItems.map(({ icon: Icon, name, sub, val }, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{name}</h4>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-xs line-through ${isDark ? "text-slate-500" : "text-slate-400"}`}>{val}</span>
                  <div className="text-xs font-bold text-emerald-400">Included</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight flex items-center gap-2">
            <IoShieldCheckmarkOutline className="text-amber-400" size={20} />
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map(({ q, a }, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-bold text-sm flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{q}</span>
                    {isOpen ? (
                      <IoChevronUp size={18} className="text-blue-400 flex-shrink-0" />
                    ) : (
                      <IoChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className={`px-4 pb-4 text-xs leading-relaxed border-t pt-3 ${
                      isDark ? "border-slate-800 text-slate-300" : "border-slate-100 text-slate-600"
                    }`}>
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── BOTTOM STICKY CTA BAR ── */}
        <div className={`sticky bottom-0 z-40 border-t backdrop-blur-xl px-4 py-3.5 transition-colors ${
          isDark
            ? "bg-slate-950/90 border-slate-800/80"
            : "bg-white/90 border-slate-200"
        }`}>
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-slate-400">EVOA × PitchIn 180s Bundle</div>
              <div className="text-lg font-extrabold text-blue-500">₹999 <span className="text-xs font-normal text-slate-400 line-through">₹4,497</span></div>
            </div>
            <button
              id="event-join-now-sticky"
              onClick={handleJoinNow}
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <IoRocketOutline size={15} />
                  Join Now
                </>
              )}
            </button>
          </div>
        </div>

      </main>
    </AppShell>
  );
}
