import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  IoLocationOutline,
  IoTimeOutline,
  IoMapOutline,
  IoVideocamOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { openRazorpayCheckout } from "../../utils/razorpay";
import pricingService from "../../services/pricingService";
import { eventService } from "../../services/eventService";

// Helper map for dynamic icon strings from backend
const ICON_MAP = {
  IoCalendarOutline,
  IoStarOutline,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoTicketOutline,
  IoLocationOutline,
  IoTimeOutline,
  IoMapOutline,
  IoVideocamOutline,
};

function renderIcon(iconName, fallbackIcon = IoStarOutline, props = {}) {
  const IconComp = ICON_MAP[iconName] || fallbackIcon;
  return <IconComp {...props} />;
}

export default function EventPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [eventData, setEventData] = useState(null);
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [fetchingEvent, setFetchingEvent] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Parse search query for slug or payment status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("status") === "success" || params.get("payment") === "success") {
      setShowSuccessModal(true);
    }
    const slugParam = params.get("slug");
    loadEventData(slugParam);
  }, [location.search]);

  async function loadEventData(slugParam = null) {
    try {
      setFetchingEvent(true);
      setFetchError(null);

      // Fetch all published events
      let allList = [];
      try {
        const allRes = await eventService.getAllPublishedEvents();
        const rawList = Array.isArray(allRes) ? allRes : (allRes?.data || []);
        // Only include events with status 'published'
        allList = rawList.filter(e => e.status === 'published');
        setPublishedEvents(allList);
      } catch (_) { /* fallback */ }

      let target = null;
      if (slugParam) {
        target = allList.find(e => e.slug === slugParam);
        if (!target) {
          try {
            const res = await eventService.getEventBySlug(slugParam);
            const item = res?.data || res;
            if (item && item.status === 'published') target = item;
          } catch (_) {}
        }
      } else {
        target = allList.find(e => e.isFeatured) || allList[0];
        if (!target && allList.length === 0) {
          try {
            const res = await eventService.getFeaturedEvent();
            const item = res?.data || res;
            if (item && item.status === 'published') target = item;
          } catch (_) {}
        }
      }

      const cleanItem = target?.data || target;
      if (cleanItem && cleanItem.status === 'published') {
        setEventData(cleanItem);
      } else {
        setEventData(null);
      }
    } catch (err) {
      setFetchError(err?.message || "Unable to load event details right now.");
    } finally {
      setFetchingEvent(false);
    }
  }

  // Auto-dismiss error after 6 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 6000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // Derived primary ticket & status
  const tickets = eventData?.tickets || [];
  const activeTicket = tickets.find((t) => t.isActive) || tickets[0];
  const isPublished = eventData?.status === "published";
  const isBookingAllowed = eventData?.allowBookings && eventData?.isRegistrationOpen && isPublished;
  const isSoldOut = activeTicket && activeTicket.remainingSeats !== null && activeTicket.remainingSeats <= 0;

  // Dynamic Role-Based Pricing & Benefits Resolution
  const role = (userRole || user?.role || 'viewer').toLowerCase();

  const rolePricingConfig = eventData?.rolePricing?.[role] || eventData?.role_pricing?.[role];
  const isRoleActive = rolePricingConfig?.isActive !== false;

  const roleTicketPrice = rolePricingConfig?.price !== undefined
    ? parseFloat(rolePricingConfig.price)
    : (activeTicket ? parseFloat(activeTicket.price) : 999);

  const roleOriginalPrice = rolePricingConfig?.originalPrice !== undefined
    ? parseFloat(rolePricingConfig.originalPrice)
    : (activeTicket?.originalPrice ? parseFloat(activeTicket.originalPrice) : (roleTicketPrice > 0 ? Math.round(roleTicketPrice * 1.5) : 0));

  const roleBadgeText = rolePricingConfig?.badgeText || (roleTicketPrice === 0 ? "FREE ACCESS" : "OFFICIAL PASS");

  const roleBenefitsConfig = eventData?.roleBenefits?.[role] || eventData?.role_benefits?.[role];
  const activeBenefits = (Array.isArray(roleBenefitsConfig) && roleBenefitsConfig.length > 0)
    ? roleBenefitsConfig
    : (Array.isArray(eventData?.benefits) && eventData.benefits.length > 0 ? eventData.benefits : [
        { title: "Live Event Pass", desc: "Access to live event sessions & presentations." },
        { title: "Community Access", desc: "Connect with event participants & ecosystem members." }
      ]);

  const handleJoinNow = async () => {
    if (isLoading || !isBookingAllowed || isSoldOut || !isRoleActive) return;

    if (!user) {
      setErrorMsg("Please sign in to join this event.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const price = roleTicketPrice;
      const title = eventData?.collaborationName || eventData?.title || "EVOA Event Pass";
      const currentEventType = eventData?.eventType || eventData?.event_type || 'event_with_subscription';

      if (price === 0) {
        // Free Pass Registration
        setShowSuccessModal(true);
        setIsLoading(false);
        return;
      }

      await openRazorpayCheckout({
        planType: "startup_pro",
        user,
        description: `${title} (${role.toUpperCase()}) — ₹${price}`,
        notes: { eventId: eventData?.id, userRole: role, eventType: currentEventType },
        createOrder: () => pricingService.createEventOrder({ eventId: eventData?.id, amount: price, eventType: currentEventType }),
        verifyPayment: (payload) => pricingService.verifyPayment(payload),
        onSuccess: async () => {
          setShowSuccessModal(true);
        },
        onDismiss: async () => {},
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

  const formattedDate = eventData?.startDate
    ? new Date(eventData.startDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date to be announced";

  return (
    <AppShell>
      <AppHeader title="Event" />

      <main
        className={`min-h-screen pb-24 font-sans transition-colors ${
          isDark ? "bg-[#0b0f17] text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
      >
        {/* ── SUCCESS NOTIFICATION ── */}
        {showSuccessModal && (
          <div className="max-w-3xl mx-auto px-4 pt-4">
            <div
              className={`p-4 rounded-xl flex items-start justify-between gap-3 border ${
                isDark
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <IoCheckmarkCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Payment Successful</h4>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    Your <strong>{eventData?.title || "Event"}</strong> pass and <strong>1 Month EVOA Premium</strong> subscription are now active. Check your email for confirmation details.
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
            <div
              className={`p-4 rounded-xl flex items-start justify-between gap-3 border ${
                isDark
                  ? "bg-rose-950/30 border-rose-500/30 text-rose-200"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <IoAlertCircleOutline size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs font-medium px-2 py-1 rounded-lg hover:bg-rose-500/20 flex-shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ── LOADING SKELETON ── */}
        {fetchingEvent ? (
          <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm opacity-70">Loading event details…</p>
          </div>
        ) : fetchError || !eventData || !isPublished ? (
          /* ── UNPUBLISHED / ARCHIVED / NOT FOUND STATE ── */
          <div className="max-w-3xl mx-auto px-4 py-20 text-center">
            <div
              className={`p-8 rounded-3xl border ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              } shadow-xl max-w-md mx-auto`}
            >
              <IoInformationCircleOutline size={48} className="mx-auto text-indigo-500 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">No Active Event</h3>
              <p className="text-sm opacity-70 mb-6 leading-relaxed">
                {fetchError || "The requested event is currently unavailable, archived, or undergoing updates."}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
              >
                Return to Home Feed
              </a>
            </div>
          </div>
        ) : (
          /* ── DYNAMIC DRAFT / PUBLISHED EVENT VIEW ── */
          <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
            {/* ── EVENT SELECTOR TABS (If multiple published events exist) ── */}
            {publishedEvents.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {publishedEvents.map((evt) => {
                  const isSelected = (eventData?.id === evt.id) || (eventData?.slug === evt.slug);
                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => {
                        setEventData(evt);
                        navigate(`/event?slug=${evt.slug}`, { replace: true });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : isDark
                          ? "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>{evt.title}</span>
                      {evt.isFeatured && <span className="text-amber-400 font-bold">★</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── HERO BANNER CARD ── */}
            <div
              className={`relative overflow-hidden rounded-3xl border ${
                isDark
                  ? "bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/20"
                  : "bg-gradient-to-b from-indigo-50 via-white to-white border-indigo-100"
              } p-6 sm:p-8 shadow-xl`}
            >
              {/* Optional Poster Background Image Blur */}
              {eventData.bannerUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
                  style={{ backgroundImage: `url(${eventData.bannerUrl})` }}
                />
              )}

              {/* Collaboration Tag & Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-wider">
                  {eventData.collaborationName || "EVOA Collaboration"}
                </span>

                {activeTicket?.badgeText && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {activeTicket.badgeText}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {eventData.title}
              </h1>

              {eventData.subtitle && (
                <p className="text-sm sm:text-base opacity-80 leading-relaxed max-w-2xl mb-6">
                  {eventData.subtitle}
                </p>
              )}

              {/* Event Quick Info Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-700/20 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 opacity-90">
                  <IoCalendarOutline size={18} className="text-indigo-500 flex-shrink-0" />
                  <span>{formattedDate} {eventData.startTime ? `• ${eventData.startTime} ${eventData.timezone || "IST"}` : ""}</span>
                </div>

                <div className="flex items-center gap-2.5 opacity-90">
                  <IoLocationOutline size={18} className="text-indigo-500 flex-shrink-0" />
                  <span>
                    {eventData.venueName || eventData.city || "Virtual Main Stage"}
                    {eventData.venueType ? ` (${eventData.venueType})` : ""}
                  </span>
                </div>
              </div>

              {/* Dynamic Highlight Badges */}
              {Array.isArray(eventData.highlights) && eventData.highlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-700/20">
                  {eventData.highlights.map((hl, idx) => {
                    const text = typeof hl === "string" ? hl : (hl.value || hl.label || "");
                    const subtext = typeof hl !== "string" && hl.value && hl.label ? hl.label : null;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl text-center border ${
                          isDark ? "bg-slate-800/40 border-slate-700/40" : "bg-white/80 border-slate-200"
                        }`}
                      >
                        <div className="text-sm sm:text-base font-extrabold text-indigo-500 leading-snug">
                          {text}
                        </div>
                        {subtext && <div className="text-[11px] opacity-70 font-medium mt-0.5">{subtext}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── EVENT DESCRIPTION ── */}
            {eventData.description && (
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                } shadow-md`}
              >
                <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                  <IoInformationCircleOutline size={18} className="text-indigo-500" /> About the Event
                </h3>
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line">
                  {eventData.description}
                </p>
              </div>
            )}

            {/* ── DYNAMIC ROLE-BASED BENEFITS CARDS ── */}
            {Array.isArray(activeBenefits) && activeBenefits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold px-1 flex items-center gap-2">
                  <IoStarOutline className="text-amber-400" /> What You Get ({role.toUpperCase()})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activeBenefits.map((b, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isDark
                          ? "bg-slate-900/60 border-slate-800 hover:border-indigo-500/30"
                          : "bg-white border-slate-200 hover:border-indigo-200"
                      } shadow-sm`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 mb-3">
                        {renderIcon(b.icon, IoStarOutline, { size: 20 })}
                      </div>
                      <h4 className="font-bold text-sm mb-1">{b.title}</h4>
                      {b.desc && <p className="text-xs opacity-70 leading-relaxed">{b.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PRICING & TICKET BUNDLE CARD (ROLE-BASED) ── */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden ${
                isDark
                  ? "bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border-indigo-500/30"
                  : "bg-gradient-to-br from-indigo-50/70 via-white to-white border-indigo-200"
              } shadow-xl`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-extrabold">{eventData.title} Pass</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 uppercase">
                      {roleBadgeText}
                    </span>
                  </div>
                  <p className="text-xs opacity-70">Custom pass and features configured for {role.toUpperCase()} role</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-500">
                    {roleTicketPrice === 0 ? "FREE" : `₹${roleTicketPrice}`}
                  </span>
                  {roleOriginalPrice > roleTicketPrice && (
                    <span className="text-sm opacity-50 line-through">
                      ₹{roleOriginalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Bundle Breakdown Items */}
              {Array.isArray(eventData.bundleItems) && eventData.bundleItems.length > 0 && (
                <div className="space-y-3 mb-6">
                  {eventData.bundleItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl flex items-center justify-between gap-3 border ${
                        isDark ? "bg-slate-800/40 border-slate-700/30" : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                          {renderIcon(item.icon, IoTicketOutline, { size: 16 })}
                        </div>
                        <div>
                          <div className="text-xs font-bold">{item.name}</div>
                          {item.sub && <div className="text-[11px] opacity-60">{item.sub}</div>}
                        </div>
                      </div>
                      {item.val && (
                        <span className="text-xs font-bold text-indigo-400 flex-shrink-0">
                          {item.val}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Remaining Seats & Booking Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                {eventData.showRemainingSeats && activeTicket?.remainingSeats !== null && (
                  <div className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Limited passes remaining for {role.toUpperCase()}!
                  </div>
                )}

                <button
                  onClick={handleJoinNow}
                  disabled={isLoading || !isBookingAllowed || isSoldOut || !isRoleActive}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                    !isBookingAllowed || isSoldOut || !isRoleActive
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25"
                  }`}
                >
                  {isLoading ? (
                    <span>Processing…</span>
                  ) : isSoldOut ? (
                    <span>Passes Sold Out</span>
                  ) : !isRoleActive ? (
                    <span>Unavailable for {role.toUpperCase()}</span>
                  ) : !isBookingAllowed ? (
                    <span>Registration Closed</span>
                  ) : (
                    <>
                      <span>{roleTicketPrice === 0 ? "Claim Free Pass" : `Get Pass for ₹${roleTicketPrice}`}</span>
                      <IoArrowForward size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── FREQUENTLY ASKED QUESTIONS (FAQS) ── */}
            {Array.isArray(eventData.faqs) && eventData.faqs.length > 0 && (
              <div className="space-y-3 pt-4">
                <h3 className="text-lg font-bold px-1">Frequently Asked Questions</h3>

                <div className="space-y-2">
                  {eventData.faqs.map((faq, idx) => {
                    const isExpanded = expandedFaq === idx;
                    return (
                      <div
                        key={idx}
                        className={`rounded-2xl border transition-all ${
                          isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full p-4 flex items-center justify-between text-left font-semibold text-sm cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          {isExpanded ? (
                            <IoChevronUp size={18} className="text-indigo-500 flex-shrink-0" />
                          ) : (
                            <IoChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 text-xs opacity-75 leading-relaxed border-t border-slate-700/10 pt-3">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STICKY BOTTOM BOOKING BAR FOR MOBILE/TABLET/DESKTOP ── */}
        {eventData && isPublished && (
          <div
            className={`fixed bottom-0 left-0 right-0 lg:left-[104px] xl:left-[272px] p-3 sm:px-6 border-t backdrop-blur-xl z-40 transition-all ${
              isDark ? "bg-[#0b0f17]/90 border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]" : "bg-white/90 border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
            }`}
          >
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div>
                <div className="text-[11px] opacity-60 uppercase font-bold tracking-wider">
                  {eventData.collaborationName || eventData.title}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-emerald-500">
                    {roleTicketPrice === 0 ? "FREE" : `₹${roleTicketPrice}`}
                  </span>
                  {roleOriginalPrice > roleTicketPrice && (
                    <span className="text-xs opacity-50 line-through">₹{roleOriginalPrice}</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleJoinNow}
                disabled={isLoading || !isBookingAllowed || isSoldOut || !isRoleActive}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
                  !isBookingAllowed || isSoldOut || !isRoleActive
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                }`}
              >
                {isLoading ? (
                  "Processing…"
                ) : isSoldOut ? (
                  "Sold Out"
                ) : !isRoleActive ? (
                  "Unavailable"
                ) : !isBookingAllowed ? (
                  "Closed"
                ) : (
                  <>
                    <span>{roleTicketPrice === 0 ? "Claim Pass" : "Book Pass"}</span>
                    <IoArrowForward size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
