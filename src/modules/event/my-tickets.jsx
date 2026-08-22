import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiChevronRight, FiAlertCircle } from "react-icons/fi";
import { RiTicketLine } from "react-icons/ri";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import DigitalTicketModal from "../../components/shared/DigitalTicketModal";
import { eventService } from "../../services/eventService";
import { useTheme } from "../../contexts/ThemeContext";

export default function MyTicketsPage() {
  const { isDark } = useTheme();
  const [tickets, setTickets] = useState(() => {
    try {
      const cached = localStorage.getItem("evoa_user_purchased_tickets");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [];
  });
  const [loading, setLoading] = useState(() => tickets.length === 0);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchMyTickets() {
      try {
        if (tickets.length === 0) setLoading(true);
        setError(null);
        const data = await eventService.getMyTickets();
        if (isMounted) {
          setTickets(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading tickets:", err);
        if (isMounted && tickets.length === 0) {
          setError(err?.message || "Unable to load your event tickets.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchMyTickets();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute status based on current date vs event end date or start date
  const getTicketStatus = (ticket) => {
    const event = ticket?.event;
    if (!event) return { label: "Confirmed", color: "blue" };

    const now = new Date();
    const eventEndDate = event.endDate ? new Date(event.endDate) : (event.startDate ? new Date(event.startDate) : null);

    if (eventEndDate && eventEndDate < now) {
      return { label: "Expired", color: "slate" };
    }
    return { label: "Coming Soon", color: "emerald" };
  };

  return (
    <AppShell>
      <AppHeader title="My Event Tickets" />

      <main className={`min-h-screen transition-colors ${isDark ? "bg-[#0a0a0e] text-slate-100" : "bg-[#f2efe9] text-slate-900"}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Navigation Tab Bar */}
          <div className={`flex items-center justify-between border-b pb-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                My Purchased Tickets
              </h1>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                View your active digital event passes, QR codes, and entry tickets
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/event"
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                }`}
              >
                Explore Events
              </Link>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-3 border-slate-300 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium">Loading your event passes...</p>
            </div>
          ) : error ? (
            <div className={`p-6 border rounded-2xl text-sm flex items-center gap-3 ${
              isDark ? "bg-red-950/40 border-red-800/60 text-red-400" : "bg-red-50 border-red-200 text-red-600"
            }`}>
              <FiAlertCircle size={20} className="shrink-0" />
              <div className="flex-1">{error}</div>
            </div>
          ) : tickets.length === 0 ? (
            /* Empty State */
            <div className={`border rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-sm ${
              isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}>
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-50 text-blue-600"
              }`}>
                <RiTicketLine size={32} />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  No Tickets Purchased Yet
                </h3>
                <p className={`text-xs sm:text-sm max-w-md mx-auto mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  You haven't registered for any live events or pitch competitions. Explore upcoming events and get your digital pass!
                </p>
              </div>
              <Link
                to="/event"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                Browse Live Events <FiChevronRight size={16} />
              </Link>
            </div>
          ) : (
            /* Ticket Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {tickets.map((t) => {
                const evt = t.event || {};
                const status = getTicketStatus(t);
                const banner = evt.posterUrl || evt.bannerUrl || evt.poster_url || evt.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop";
                const title = evt.collaborationName || evt.title || "EVOA Event Pass";
                const dateStr = evt.startDate
                  ? new Date(evt.startDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                  : "Date TBA";
                const venueStr = evt.venueName || evt.venue_name || evt.meetingUrl || evt.meeting_url || "Venue TBA";
                const cityStr = evt.city || evt.state || "Global";

                return (
                  <div
                    key={t.id}
                    className={`border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div>
                      {/* Event Banner Header */}
                      <div className="relative h-36 w-full overflow-hidden bg-slate-950">
                        <img src={banner} alt={title} className="w-full h-full object-cover opacity-85" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white font-mono text-[11px] font-semibold border border-white/10">
                            {t.ticketCode || t.ticket_code || "TKT-EVOA"}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm ${
                              status.color === "emerald"
                                ? "bg-emerald-500/90 text-white"
                                : "bg-slate-700/90 text-slate-300"
                            }`}
                          >
                            {status.label}
                          </span>
                        </div>

                        {/* Title on Banner */}
                        <div className="absolute bottom-3 left-3 right-3 z-10">
                          <h3 className="text-base font-extrabold text-white line-clamp-1 drop-shadow">
                            {title}
                          </h3>
                        </div>
                      </div>

                      {/* Ticket Metadata */}
                      <div className={`p-4 space-y-2.5 text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        <div className="flex items-center gap-2">
                          <FiCalendar size={14} className="text-blue-500 shrink-0" />
                          <span className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{dateStr}</span>
                          {evt.startTime ? <span className="text-slate-400">({evt.startTime})</span> : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <FiMapPin size={14} className="text-purple-500 shrink-0" />
                          <span className="truncate">{venueStr} ({cityStr})</span>
                        </div>

                        <div className={`flex items-center justify-between pt-2 border-t text-[11px] ${
                          isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"
                        }`}>
                          <span>Ticket ID: <span className={`font-mono font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{t.ticketCode || t.ticket_code}</span></span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {t.price === 0 ? "FREE PASS" : `₹${t.price}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* View Ticket Action */}
                    <div className="p-4 pt-0">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/15"
                      >
                        <RiTicketLine size={16} /> View Digital Pass
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Digital Ticket Modal */}
        {selectedTicket ? (
          <DigitalTicketModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        ) : null}
      </main>
    </AppShell>
  );
}
