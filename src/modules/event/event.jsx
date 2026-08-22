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
  IoClose,
  IoArrowBack,
} from "react-icons/io5";
import { openRazorpayCheckout } from "../../utils/razorpay";
import pricingService from "../../services/pricingService";
import { eventService } from "../../services/eventService";
import DigitalTicketModal from "../../components/shared/DigitalTicketModal";

const DEFAULT_EVENT_COVER =
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1080&h=1440&fit=crop&q=80";

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

const cleanText = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.replace(/🚀/g, "").replace(/\s+/g, " ").trim();
};

function renderIcon(iconName, fallbackIcon = IoStarOutline, props = {}) {
  const IconComp = ICON_MAP[iconName] || fallbackIcon;
  return <IconComp {...props} />;
}

const checkIsEventExpired = (evt) => {
  if (!evt) return true;
  if (evt.isRegistrationOpen === false || evt.allowBookings === false || evt.status === "archived" || evt.status === "cancelled") return true;

  const now = new Date();

  if (evt.bookingEndDate || evt.booking_end_date) {
    const bookingEnd = new Date(evt.bookingEndDate || evt.booking_end_date);
    if (!isNaN(bookingEnd.getTime()) && now > bookingEnd) return true;
  }

  const dateStr = evt.endDate || evt.end_date || evt.startDate || evt.start_date;
  if (dateStr) {
    let endTimestamp = null;
    if (typeof dateStr === "string" && dateStr.includes("T")) {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) endTimestamp = parsed.getTime();
    } else if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      const timeStr = evt.endTime || evt.end_time || evt.startTime || evt.start_time || "23:59:59";
      const fullStr = `${dateStr.trim()}T${timeStr.includes(":") ? timeStr : "23:59:59"}`;
      const parsed = new Date(fullStr);
      if (!isNaN(parsed.getTime())) endTimestamp = parsed.getTime();
      else endTimestamp = new Date(`${dateStr.trim()}T23:59:59.999Z`).getTime();
    } else if (typeof dateStr === "string") {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        parsed.setHours(23, 59, 59, 999);
        endTimestamp = parsed.getTime();
      }
    }
    if (endTimestamp !== null && now.getTime() > endTimestamp) return true;
  }

  return false;
};

export default function EventPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [publishedEvents, setPublishedEvents] = useState(() => {
    try {
      const cached = localStorage.getItem("evoa_published_events_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [fetchingEvents, setFetchingEvents] = useState(() => publishedEvents.length === 0);
  const [fetchError, setFetchError] = useState(null);

  // Expanded details state per event: { [eventId]: boolean }
  const [expandedEvents, setExpandedEvents] = useState({});
  // Expanded FAQ state per event: { [eventId_faqIndex]: boolean }
  const [expandedFaqs, setExpandedFaqs] = useState({});

  // Ticket status map per event strictly scoped to user.id: { [eventId]: ticketPass }
  const [userTicketsMap, setUserTicketsMap] = useState(() => {
    if (!user?.id) return {};
    try {
      const cached = localStorage.getItem(`evoa_user_tickets_map_${user.id}`);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const [digitalTicket, setDigitalTicket] = useState(null);
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successEventTitle, setSuccessEventTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Parse search query for status flag or target slug
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("status") === "success" || params.get("payment") === "success") {
      setShowSuccessModal(true);
    }
    loadEventsData(params.get("slug"));
  }, [location.search]);

  // Load all published events
  async function loadEventsData(targetSlug = null) {
    try {
      if (publishedEvents.length === 0) setFetchingEvents(true);
      setFetchError(null);

      const res = await eventService.getAllPublishedEvents();
      const rawList = Array.isArray(res) ? res : res?.data || [];
      const cleanList = rawList.filter((e) => e.status === "published");

      setPublishedEvents(cleanList);
      try {
        localStorage.setItem("evoa_published_events_cache", JSON.stringify(cleanList));
      } catch (_) {}

      // If target slug is provided, expand & open that specific event by default
      if (targetSlug && cleanList.length > 0) {
        const targetEvt = cleanList.find((e) => e.slug === targetSlug);
        if (targetEvt) {
          setSelectedEventModal(targetEvt);
          setExpandedEvents((prev) => ({ ...prev, [targetEvt.id]: true }));
        }
      }
    } catch (err) {
      if (publishedEvents.length === 0) {
        setFetchError(err?.message || "Unable to load live events right now.");
      }
    } finally {
      setFetchingEvents(false);
    }
  }

  // Check ticket booking status for all events when user or publishedEvents change
  useEffect(() => {
    async function checkUserTickets() {
      if (!user) {
        setUserTicketsMap({});
        return;
      }
      try {
        const myTickets = await eventService.getMyTickets();
        const ticketsList = Array.isArray(myTickets) ? myTickets : myTickets?.data || [];
        const ticketMap = {};

        ticketsList.forEach((t) => {
          const tUserId = t.userId || t.user_id;
          const tEmail = t.userEmail || t.user_email;
          if ((tUserId && tUserId === user.id) || (tEmail && tEmail.toLowerCase() === user.email?.toLowerCase())) {
            const eId = t.eventId || t.event_id || t.event?.id;
            if (eId) {
              const matchingEvt = publishedEvents.find((pe) => pe.id === eId);
              ticketMap[eId] = {
                ...t,
                event: t.event || matchingEvt || {},
              };
            }
          }
        });

        setUserTicketsMap(ticketMap);
        if (user?.id) {
          localStorage.setItem(`evoa_user_tickets_map_${user.id}`, JSON.stringify(ticketMap));
        }
      } catch (err) {
        console.error("Error checking user tickets:", err);
      }
    }
    checkUserTickets();
  }, [user, publishedEvents]);

  // Auto-dismiss error toast
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 6000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // Toggle event details expansion
  const toggleEventDetails = (eventId) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  // Toggle FAQ expansion
  const toggleFaq = (eventId, faqIdx) => {
    const key = `${eventId}_${faqIdx}`;
    setExpandedFaqs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle Pass Booking / Payment for an event
  const handleBookEvent = async (evt) => {
    if (isLoading) return;

    if (!user) {
      setErrorMsg("Please sign in to join this event.");
      return;
    }

    if (checkIsEventExpired(evt)) {
      setErrorMsg("Registration for this event has expired and is now closed.");
      return;
    }

    const role = (userRole || user?.role || "viewer").toLowerCase();
    const tickets = evt?.tickets || [];
    const activeTicket = tickets.find((t) => t.isActive) || tickets[0];
    const rolePricingConfig = evt?.rolePricing?.[role] || evt?.role_pricing?.[role];
    const isRoleActive = rolePricingConfig?.isActive !== false;
    const isBookingAllowed = evt?.allowBookings && evt?.isRegistrationOpen && evt?.status === "published";
    const isSoldOut = activeTicket && activeTicket.remainingSeats !== null && activeTicket.remainingSeats <= 0;

    if (!isBookingAllowed || isSoldOut || !isRoleActive) return;

    const roleTicketPrice = rolePricingConfig?.price !== undefined
      ? parseFloat(rolePricingConfig.price)
      : activeTicket ? parseFloat(activeTicket.price) : 999;

    const title = evt?.collaborationName || evt?.title || "EVOA Event Pass";
    const currentEventType = evt?.eventType || evt?.event_type || "event_with_subscription";
    const attendeeName = user?.fullName || user?.name || user?.username || user?.startupUsername || user?.email || "";
    const attendeeEmail = user?.email || "";

    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (roleTicketPrice === 0) {
        // Free Pass Registration
        const rawPass = await eventService.bookTicket({
          eventId: evt.id,
          price: 0,
          userRole: role,
          userName: attendeeName,
          userEmail: attendeeEmail,
        }).catch((e) => console.error("Ticket booking failed:", e));

        if (rawPass) {
          const ticketPass = {
            ...rawPass,
            event: rawPass.event || evt,
          };
          setUserTicketsMap((prev) => ({ ...prev, [evt.id]: ticketPass }));
          setDigitalTicket(ticketPass);
        }
        setSuccessEventTitle(evt.title);
        setShowSuccessModal(true);
        setIsLoading(false);
        return;
      }

      await openRazorpayCheckout({
        planType: "startup_pro",
        user,
        description: `${title} (${role.toUpperCase()}) — ₹${roleTicketPrice}`,
        notes: { eventId: evt?.id, userRole: role, eventType: currentEventType },
        createOrder: () => pricingService.createEventOrder({ eventId: evt?.id, amount: roleTicketPrice, eventType: currentEventType }),
        verifyPayment: (payload) => pricingService.verifyPayment(payload),
        onSuccess: async (paymentResult) => {
          let ticketPass = paymentResult?.ticket || paymentResult?.data?.ticket;
          if (!ticketPass || (!ticketPass.ticketCode && !ticketPass.ticket_code && !ticketPass.id)) {
            const rawPass = await eventService.bookTicket({
              eventId: evt.id,
              price: roleTicketPrice,
              userRole: role,
              userName: attendeeName,
              userEmail: attendeeEmail,
              orderId: paymentResult?.razorpay_order_id,
              paymentId: paymentResult?.razorpay_payment_id,
            }).catch((e) => console.error("Ticket booking failed:", e));

            if (rawPass) {
              ticketPass = {
                ...rawPass,
                event: rawPass.event || evt,
              };
            }
          } else {
            ticketPass = {
              ...ticketPass,
              event: ticketPass.event || evt,
            };
          }

          if (ticketPass) {
            const code = ticketPass.ticketCode || ticketPass.ticket_code || ticketPass.id;
            ticketPass.ticketCode = code;
            ticketPass.ticket_code = code;
            setUserTicketsMap((prev) => ({ ...prev, [evt.id]: ticketPass }));
            setDigitalTicket(ticketPass);
          }
          setSuccessEventTitle(evt.title);
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

  // Render detailed event card / view inside modal
  const renderEventDetails = (evt) => {
    if (!evt) return null;

    const isExpanded = Boolean(expandedEvents[evt.id] !== false);
    const userTicket = userTicketsMap[evt.id];
    const tickets = evt.tickets || [];
    const activeTicket = tickets.find((t) => t.isActive) || tickets[0];
    const role = (userRole || user?.role || "viewer").toLowerCase();

    const rolePricingConfig = evt.rolePricing?.[role] || evt.role_pricing?.[role];
    const isRoleActive = rolePricingConfig?.isActive !== false;
    const isExpired = checkIsEventExpired(evt);
    const isBookingAllowed = !isExpired && evt.allowBookings && evt.isRegistrationOpen && evt.status === "published";
    const isSoldOut = activeTicket && activeTicket.remainingSeats !== null && activeTicket.remainingSeats <= 0;

    const roleTicketPrice = rolePricingConfig?.price !== undefined
      ? parseFloat(rolePricingConfig.price)
      : activeTicket ? parseFloat(activeTicket.price) : 999;

    const roleOriginalPrice = rolePricingConfig?.originalPrice !== undefined
      ? parseFloat(rolePricingConfig.originalPrice)
      : activeTicket?.originalPrice
      ? parseFloat(activeTicket.originalPrice)
      : roleTicketPrice > 0 ? Math.round(roleTicketPrice * 1.5) : 0;

    const roleBadgeText = rolePricingConfig?.badgeText || (roleTicketPrice === 0 ? "FREE ACCESS" : "OFFICIAL PASS");

    const roleBenefitsConfig = evt.roleBenefits?.[role] || evt.role_benefits?.[role];
    const activeBenefits = Array.isArray(roleBenefitsConfig) && roleBenefitsConfig.length > 0
      ? roleBenefitsConfig
      : Array.isArray(evt.benefits) && evt.benefits.length > 0
      ? evt.benefits
      : [
          { title: "Live Event Pass", desc: "Access to live event sessions & presentations." },
          { title: "Community Access", desc: "Connect with event participants & ecosystem members." },
        ];

    const formattedDate = evt.startDate
      ? new Date(evt.startDate).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Date Announced Soon";

    return (
      <div key={evt.id} className="space-y-6">
        {/* TOP HERO EVENT CARD */}
        <div
          className={`relative overflow-hidden rounded-3xl border transition-all ${
            isDark
              ? "bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/20"
              : "bg-gradient-to-b from-indigo-50/80 via-white to-white border-indigo-100"
          } p-6 sm:p-8 shadow-lg`}
        >
          {/* Banner Image Overlay (Uses Banner Upload / Image URL) */}
          {evt.bannerUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
              style={{ backgroundImage: `url(${evt.bannerUrl})` }}
            />
          )}

          {/* Collaboration Tag & Right Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/10 text-indigo-500 border border-indigo-500/20 uppercase tracking-wider">
              {evt.collaborationName || "EVOA Collaboration"}
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => toggleEventDetails(evt.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>{isExpanded ? "Hide Details" : "Show Details"}</span>
                <IoChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {activeTicket?.badgeText && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase">
                  {activeTicket.badgeText}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10 mb-5">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {cleanText(evt.title)}
            </h3>
          </div>

          {/* Quick Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-700/20 text-xs sm:text-sm relative z-10">
            <div className="flex items-center gap-2.5 opacity-90">
              <IoCalendarOutline size={18} className="text-indigo-500 flex-shrink-0" />
              <span>
                {formattedDate}
                {evt.startTime ? ` • ${evt.startTime} ${evt.timezone || "IST"}` : ""}
              </span>
            </div>

            <div className="flex items-center gap-2.5 opacity-90">
              <IoLocationOutline size={18} className="text-indigo-500 flex-shrink-0" />
              <span>
                {evt.venueName || evt.city || "Virtual Main Stage"}
                {evt.venueType ? ` (${evt.venueType})` : ""}
              </span>
            </div>
          </div>

          {/* Dynamic Highlights */}
          {Array.isArray(evt.highlights) && evt.highlights.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-700/20 relative z-10">
              {evt.highlights.map((hl, idx) => {
                const text = typeof hl === "string" ? hl : hl.value || hl.label || "";
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

        {/* EXPANDABLE EVENT DETAILS SECTION */}
        {isExpanded && (
          <div className="space-y-6 pt-2 transition-all animate-fadeIn">
            {/* ABOUT THE EVENT */}
            {evt.description && (
              <div
                className={`p-6 rounded-3xl border ${
                  isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                } shadow-md`}
              >
                <h3 className="text-base font-bold mb-2 flex items-center gap-2">
                  <IoInformationCircleOutline size={18} className="text-indigo-500" /> About the Event
                </h3>
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line">
                  {cleanText(evt.description)}
                </p>
              </div>
            )}

            {/* WHAT YOU GET / BENEFITS CARDS */}
            {Array.isArray(activeBenefits) && activeBenefits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base font-bold px-1 flex items-center gap-2">
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

            {/* PRICING & TICKET BUNDLE CARD */}
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
                    <h3 className="text-xl font-extrabold">{cleanText(evt.title)} Pass</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 uppercase">
                      {roleBadgeText}
                    </span>
                  </div>
                  <p className="text-xs opacity-70">
                    Custom pass and features configured for {role.toUpperCase()} role
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                    {roleTicketPrice === 0 ? "FREE" : `₹${roleTicketPrice}`}
                  </span>
                  {roleOriginalPrice > roleTicketPrice && (
                    <span className="text-sm opacity-50 line-through">
                      ₹{roleOriginalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Bundle Items */}
              {Array.isArray(evt.bundleItems) && evt.bundleItems.length > 0 && (
                <div className="space-y-3 mb-6">
                  {evt.bundleItems.map((item, idx) => (
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

              {/* Remaining Seats & Booking Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                {evt.showRemainingSeats && activeTicket?.remainingSeats !== null && !userTicket && (
                  <div className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Limited passes remaining for {role.toUpperCase()}!
                  </div>
                )}

                {userTicket ? (
                  <button
                    type="button"
                    onClick={() => setDigitalTicket(userTicket)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                  >
                    <IoCheckmarkCircle size={20} />
                    <span>Pass Booked (View Pass)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBookEvent(evt)}
                    disabled={isLoading || !isBookingAllowed || isSoldOut || !isRoleActive || isExpired}
                    className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                      !isBookingAllowed || isSoldOut || !isRoleActive || isExpired
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25"
                    }`}
                  >
                    {isLoading ? (
                      <span>Processing…</span>
                    ) : isExpired ? (
                      <span>Registration Expired</span>
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
                )}
              </div>
            </div>

            {/* FREQUENTLY ASKED QUESTIONS (FAQS) */}
            {Array.isArray(evt.faqs) && evt.faqs.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-bold px-1">Frequently Asked Questions</h3>

                <div className="space-y-2">
                  {evt.faqs.map((faq, faqIdx) => {
                    const isFaqOpen = Boolean(expandedFaqs[`${evt.id}_${faqIdx}`]);
                    return (
                      <div
                        key={faqIdx}
                        className={`rounded-2xl border transition-all ${
                          isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(evt.id, faqIdx)}
                          className="w-full p-4 flex items-center justify-between text-left font-semibold text-sm cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          {isFaqOpen ? (
                            <IoChevronUp size={18} className="text-indigo-500 flex-shrink-0" />
                          ) : (
                            <IoChevronDown size={18} className="text-slate-400 flex-shrink-0" />
                          )}
                        </button>

                        {isFaqOpen && (
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
      </div>
    );
  };

  return (
    <AppShell>
      <AppHeader title="Event" />

      {/* Top Navigation Bar */}
      <div className={`border-b sticky top-0 z-30 backdrop-blur-md ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {selectedEventModal ? (
            <button
              onClick={() => setSelectedEventModal(null)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <IoArrowBack size={16} />
              <span>Back to Events</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>Upcoming Events &amp; Competitions</span>
            </div>
          )}

          <button
            onClick={() => navigate("/event/my-tickets")}
            className="px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>My Tickets</span>
          </button>
        </div>
      </div>

      <main
        className={`min-h-screen pb-24 font-sans transition-colors ${
          isDark ? "bg-[#0b0f17] text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          {/* ── SUCCESS NOTIFICATION ── */}
          {showSuccessModal && (
            <div
              className={`p-4 rounded-2xl flex items-start justify-between gap-3 border shadow-sm ${
                isDark
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <IoCheckmarkCircle size={22} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Pass Confirmation</h4>
                  <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    Your official digital event pass for <strong>{successEventTitle || "Event"}</strong> has been issued.
                  </p>
                  {digitalTicket ? (
                    <button
                      onClick={() => setDigitalTicket(digitalTicket)}
                      className="mt-2 text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      View Digital Pass ({digitalTicket.ticketCode || digitalTicket.ticket_code})
                    </button>
                  ) : null}
                </div>
              </div>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 flex-shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ── ERROR NOTIFICATION ── */}
          {errorMsg && (
            <div
              className={`p-4 rounded-2xl flex items-start justify-between gap-3 border shadow-sm ${
                isDark
                  ? "bg-rose-950/40 border-rose-500/30 text-rose-200"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-start gap-3">
                <IoAlertCircleOutline size={22} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">{errorMsg}</p>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs font-medium px-2.5 py-1 rounded-lg hover:bg-rose-500/20 flex-shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ── CONDITIONAL VIEW: FULL EVENT DETAILS PAGE OR CARDS GRID ── */}
          {selectedEventModal ? (
            <div className="animate-fadeIn space-y-6">
              {renderEventDetails(selectedEventModal)}
            </div>
          ) : fetchingEvents ? (
            /* ── LOADING SKELETON ── */
            <div className="py-20 text-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm opacity-70 font-medium">Loading live events…</p>
            </div>
          ) : fetchError || publishedEvents.length === 0 ? (
            /* ── EMPTY / NO EVENTS STATE ── */
            <div
              className={`p-10 rounded-3xl border text-center ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
              } shadow-lg max-w-lg mx-auto my-12`}
            >
              <IoInformationCircleOutline size={52} className="mx-auto text-indigo-500 mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">No Active Events</h3>
              <p className="text-sm opacity-70 mb-6 leading-relaxed">
                {fetchError || "There are currently no live events published. Please check back soon!"}
              </p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
              >
                Return to Home Feed
              </a>
            </div>
          ) : (
            /* ── SMALL PROFESSIONAL EVENT CARDS GRID ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {publishedEvents.map((evt) => {
                const isUserRegistered = Boolean(userTicketsMap[evt.id]);
                const isExpired = checkIsEventExpired(evt);
                const coverImage =
                  evt.coverImageUrl ||
                  evt.cover_image_url ||
                  evt.coverUrl ||
                  evt.cover_url ||
                  evt.posterUrl ||
                  evt.bannerUrl ||
                  evt.poster_url ||
                  evt.banner_url ||
                  DEFAULT_EVENT_COVER;
                const formattedDate = evt.startDate
                  ? new Date(evt.startDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Upcoming";

                return (
                  <div
                    key={evt.id}
                    className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isDark
                        ? "bg-slate-900/80 border-slate-800 hover:border-indigo-500/40"
                        : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Thumbnail Cover Image (3:4 Ratio) */}
                    <div
                      className="relative aspect-[3/4] w-full overflow-hidden bg-slate-800 cursor-pointer"
                      onClick={() => {
                        setSelectedEventModal(evt);
                        setExpandedEvents((prev) => ({ ...prev, [evt.id]: true }));
                      }}
                    >
                      <img
                        src={coverImage}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          e.target.src = DEFAULT_EVENT_COVER;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/75 backdrop-blur-md text-indigo-400 border border-indigo-500/30 uppercase tracking-wider shadow-sm truncate max-w-[150px]">
                          {evt.organizer || evt.collaborationName || "EVOA"}
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/75 backdrop-blur-md text-slate-300 border border-slate-700/40 shadow-sm flex items-center gap-1">
                          <IoCalendarOutline size={12} className="text-indigo-400" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <h3
                        className={`font-bold text-sm sm:text-base leading-snug line-clamp-2 flex-1 cursor-pointer transition-colors ${
                          isDark ? "text-white hover:text-indigo-400" : "text-slate-900 hover:text-indigo-600"
                        }`}
                        onClick={() => {
                          setSelectedEventModal(evt);
                          setExpandedEvents((prev) => ({ ...prev, [evt.id]: true }));
                        }}
                      >
                        {evt.title}
                      </h3>

                      {isUserRegistered ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEventModal(evt);
                            setExpandedEvents((prev) => ({ ...prev, [evt.id]: true }));
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm flex-shrink-0 active:scale-95 transition-all cursor-pointer"
                        >
                          <IoCheckmarkCircle size={14} />
                          <span>Registered</span>
                        </button>
                      ) : isExpired ? (
                        <button
                          type="button"
                          disabled={true}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 bg-slate-700/80 text-slate-400 border border-slate-600/30 flex-shrink-0 cursor-not-allowed"
                        >
                          <span>Expired</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEventModal(evt);
                            setExpandedEvents((prev) => ({ ...prev, [evt.id]: true }));
                          }}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm flex-shrink-0 active:scale-95 transition-all cursor-pointer"
                        >
                          <span>Register</span>
                          <IoArrowForward size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Digital Ticket Modal View */}
      {digitalTicket && (
        <DigitalTicketModal
          ticket={digitalTicket}
          onClose={() => setDigitalTicket(null)}
        />
      )}
    </AppShell>
  );
}
