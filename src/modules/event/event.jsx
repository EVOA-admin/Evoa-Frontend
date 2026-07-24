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
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoChevronDown,
  IoChevronUp,
  IoArrowForward,
  IoAlertCircleOutline,
  IoCloseCircle,
  IoCheckmark,
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

  // Check query param for payment success redirect
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
          // User closed the modal
        },
        cancelMessage: "Payment was cancelled.",
      });
    } catch (err) {
      const msg = err?.message || "Something went wrong. Please try again.";
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
      icon: IoCalendarOutline,
      title: "Live 180s Pitch Stage",
      desc: "Present your vision directly to a curated panel of VCs, Angel Investors, and Incubator Heads.",
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
      title: "Deck Distribution",
      desc: "Your pitch reel and deck get featured to EVOA's network of accredited investors.",
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
      icon: IoShieldCheckmarkOutline,
      name: "Investor Deck Summary & Feedback",
      sub: "Actionable feedback from panel VCs & mentors",
      val: "₹999",
    },
  ];

  return (
    <AppShell>
      <AppHeader title="Event" />

      <main className={`min-h-screen pb-20 font-sans transition-colors ${
        isDark ? "bg-[#0b0f17] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}>

        {/* ── SUCCESS NOTIFICATION ── */}
        {showSuccessModal && (
          <div className="max-w-3xl mx-auto px-4 pt-4">
            <div className={`p-4 rounded-xl flex items-start justify-between gap-3 border ${
              isDark ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200" : "bg-emerald-50 border-emerald-200 text-emerald-900"
            }`}>
              <div className="flex items-start gap-3">
                <IoCheckmarkCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Payment Successful</h4>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    Your <strong>PitchIn 180 Seconds</strong> pass and <strong>1 Month EVOA Premium</strong> subscription are now active. Check your email for confirmation details.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-xs font-medium px-2 py-1 rounded-lg hover:bg-emerald-500/20 flex-shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── ERROR NOTIFICATION ── */}
        {errorMsg && (
          <div className="max-w-3xl mx-auto px-4 pt-4">
            <div className={`p-4 rounded-xl flex items-start justify-between gap-3 border ${
              isDark ? "bg-rose-950/30 border-rose-500/30 text-rose-200" : "bg-rose-50 border-rose-200 text-rose-900"
            }`}>
              <div className="flex items-start gap-3">
                <IoAlertCircleOutline size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="hover:opacity-75 flex-shrink-0 cursor-pointer"
              >
                <IoCloseCircle size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── HERO HEADER ── */}
        <div className={`px-4 pt-10 pb-10 border-b ${isDark ? "border-white/5 bg-slate-950/40" : "border-slate-200/80 bg-white"}`}>
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Tag Badge */}
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                isDark ? "bg-evoa/15 text-evoa border border-evoa/30" : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                EVOA × PitchIn Collaboration
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              EVOA × PitchIn 180 Seconds
            </h1>

            {/* Description */}
            <p className={`text-xs sm:text-sm max-w-2xl mx-auto font-normal leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Pitch your startup live in 3 minutes to active VCs and Angel Investors, and receive 1 Month of EVOA Premium to accelerate your fundraising.
            </p>

            {/* Meta Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className={`text-xs px-3 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <IoCalendarOutline size={13} className={isDark ? "text-slate-400" : "text-slate-500"} /> Live Stage Pitch
              </span>
              <span className={`text-xs px-3 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <IoStarOutline size={13} className={isDark ? "text-slate-400" : "text-slate-500"} /> 1-Month Premium Included
              </span>
              <span className={`text-xs px-3 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
              }`}>
                <IoPeopleOutline size={13} className={isDark ? "text-slate-400" : "text-slate-500"} /> 500+ Investors
              </span>
            </div>
          </div>
        </div>

        {/* ── MAIN BUNDLE & CTA CARD ── */}
        <div className="px-4 py-8 max-w-3xl mx-auto">
          <div className={`rounded-2xl p-6 sm:p-8 border shadow-sm ${
            isDark ? "bg-slate-900/60 border-white/10" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Combined Offer Bundle</h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Complete event access pass + 1 Month EVOA Premium subscription.
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wider uppercase ${
                isDark ? "bg-evoa/15 text-evoa border border-evoa/30" : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                Event Pass
              </span>
            </div>

            {/* Offer Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50/80 border-slate-200"
              }`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200/80 text-slate-700"
                }`}>
                  <IoTicketOutline size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold">PitchIn 180s Event Ticket</h3>
                  <p className={`text-[11px] mt-0.5 leading-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Live stage pitching slot for up to 2 team members.
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50/80 border-slate-200"
              }`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-slate-800 text-slate-300" : "bg-slate-200/80 text-slate-700"
                }`}>
                  <IoStarOutline size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold">1 Month EVOA Premium</h3>
                  <p className={`text-[11px] mt-0.5 leading-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Verified badge, priority feed, and direct investor messaging.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing & CTA */}
            <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">₹999</span>
                  <span className={`text-xs line-through ${isDark ? "text-slate-500" : "text-slate-400"}`}>₹4,497</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    Save ₹3,498
                  </span>
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Single payment • Instant activation upon completion
                </p>
              </div>

              <button
                id="event-join-now-hero"
                onClick={handleJoinNow}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-evoa hover:bg-evoa/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <span>Join Now — ₹999</span>
                    <IoArrowForward size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── EVENT OVERVIEW ── */}
        <div className="px-4 py-4 max-w-3xl mx-auto space-y-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            Event Overview
          </h2>
          <div className={`p-6 rounded-2xl border text-xs leading-relaxed space-y-3 ${
            isDark ? "bg-slate-900/40 border-white/5 text-slate-300" : "bg-white border-slate-200 text-slate-600"
          }`}>
            <p>
              <strong>PitchIn 180 Seconds</strong> is a live startup pitching showcase where founders take the stage to present their business model, traction, and funding requirement in a structured 3-minute pitch followed by direct Q&amp;A with attending investors.
            </p>
            <p>
              By participating through this EVOA collaboration, your startup receives a live pitching pass along with <strong>30 Days of EVOA Premium</strong>, enhancing your digital presence with verified status, featured feed visibility, and direct messaging access.
            </p>
          </div>
        </div>

        {/* ── BENEFITS GRID ── */}
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            Participation Benefits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map(({ icon: Icon, title, desc }, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                  isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                }`}>
                  <Icon size={16} />
                </div>
                <h3 className="font-bold text-xs mb-1">{title}</h3>
                <p className={`text-[11px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── WHAT'S INCLUDED ── */}
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            What's Included
          </h2>
          <div className={`rounded-2xl border divide-y overflow-hidden ${
            isDark ? "bg-slate-900/40 border-white/5 divide-white/5" : "bg-white border-slate-200 divide-slate-100"
          }`}>
            {bundleItems.map(({ icon: Icon, name, sub, val }, idx) => (
              <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">{name}</h4>
                    <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{sub}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[11px] line-through block ${isDark ? "text-slate-500" : "text-slate-400"}`}>{val}</span>
                  <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 justify-end">
                    <IoCheckmark size={12} /> Included
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ACCORDION ── */}
        <div className="px-4 py-6 max-w-3xl mx-auto space-y-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map(({ q, a }, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    isDark ? "bg-slate-900/40 border-white/5" : "bg-white border-slate-200"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left font-semibold text-xs flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{q}</span>
                    {isOpen ? (
                      <IoChevronUp size={16} className={isDark ? "text-slate-400" : "text-slate-500"} />
                    ) : (
                      <IoChevronDown size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
                    )}
                  </button>
                  {isOpen && (
                    <div className={`px-4 pb-4 text-xs leading-relaxed border-t pt-3 ${
                      isDark ? "border-white/5 text-slate-300" : "border-slate-100 text-slate-600"
                    }`}>
                      {a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STICKY BOTTOM BAR ── */}
        <div className={`sticky bottom-0 z-40 border-t backdrop-blur-md px-4 py-3 ${
          isDark ? "bg-[#0b0f17]/90 border-white/10" : "bg-white/90 border-slate-200"
        }`}>
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className={`text-[11px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>EVOA × PitchIn 180s</div>
              <div className="text-base font-bold flex items-baseline gap-1.5">
                <span>₹999</span>
                <span className={`text-xs line-through font-normal ${isDark ? "text-slate-500" : "text-slate-400"}`}>₹4,497</span>
              </div>
            </div>
            <button
              id="event-join-now-sticky"
              onClick={handleJoinNow}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-evoa hover:bg-evoa/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs tracking-wide shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-98"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <span>Join Now</span>
                  <IoArrowForward size={13} />
                </>
              )}
            </button>
          </div>
        </div>

      </main>
    </AppShell>
  );
}

