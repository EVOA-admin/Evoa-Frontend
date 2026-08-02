import React, { useEffect, useRef, useState } from "react";
import { FiX, FiDownload, FiCheckCircle, FiCalendar, FiMapPin, FiUser, FiMail, FiShare2 } from "react-icons/fi";
import QRCode from "qrcode";
import { useAuth } from "../../contexts/AuthContext";

export default function DigitalTicketModal({ ticket, onClose }) {
  const { user: authUser } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const ticketCardRef = useRef(null);

  const event = ticket?.event || {};
  const ticketCode = ticket?.ticketCode || ticket?.id || "TKT-EVOA-PASS";

  const resolveAttendeeName = (t, currUser) => {
    const isEmail = (str) => typeof str === "string" && str.includes("@");

    // 1. Check logged in user or ticket user object for actual Name
    const u = currUser || t?.user || {};
    const candidateNames = [
      u?.fullName,
      u?.name,
      u?.namePrimary,
      u?.founderName,
      u?.companyName,
      t?.userName,
      t?.user_name,
      u?.username,
      u?.startupUsername,
      u?.startup_username,
      t?.username,
    ];

    for (const raw of candidateNames) {
      if (raw && typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed && trimmed !== "Evoa Attendee" && !isEmail(trimmed)) {
          return trimmed;
        }
      }
    }

    // 2. If all name candidates are missing or are emails, derive a clean name from email handle
    const email = t?.userEmail || t?.user_email || u?.email || "";
    if (email && isEmail(email)) {
      const handle = email.split("@")[0].replace(/[._-]/g, " ");
      return handle.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return "Evoa Attendee";
  };

  const userName = resolveAttendeeName(ticket, authUser);
  const userEmail = ticket?.userEmail || ticket?.user_email || ticket?.user?.email || authUser?.email || "";
  const userRole = (ticket?.userRole || ticket?.user_role || "ATTENDEE").toUpperCase();
  const price = ticket?.price ?? 0;

  const eventTitle = event?.collaborationName || event?.title || "EVOA Exclusive Event Pass";
  const bannerUrl = event?.posterUrl || event?.bannerUrl || event?.poster_url || event?.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop";

  const formattedDate = event?.startDate
    ? new Date(event.startDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date Announced Soon";

  const formattedTime = event?.startTime
    ? `${event.startTime} ${event?.timezone || "IST"}`
    : "Time TBA";

  const venueText = event?.venueName || event?.venue_name || event?.meetingUrl || event?.meeting_url || "Venue Details Announced Soon";
  const cityText = event?.city || event?.state || "India";

  // Generate QR Code containing Name, Email, Access Role, Event Title & Pass Code
  useEffect(() => {
    async function generateQrCode() {
      try {
        const qrContent = `EVOA OFFICIAL EVENT PASS\nName: ${userName}\nEmail: ${userEmail || "N/A"}\nAccess Role: ${userRole}\nEvent: ${eventTitle}\nPass Code: ${ticketCode}`;
        
        const url = await QRCode.toDataURL(qrContent, {
          width: 240,
          margin: 1,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    }
    generateQrCode();
  }, [ticket, ticketCode, userName, userEmail, userRole, eventTitle]);

  // Download Ticket as PNG Image via Canvas rendering
  const handleDownloadTicket = async () => {
    try {
      setDownloading(true);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const width = 600;
      const height = 900;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = "#0F172A";
      ctx.fillRect(0, 0, width, height);

      // Top Header Card
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(30, 30, 540, 480, 20);
      ctx.fill();

      // Brand Header
      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("EVOA DIGITAL EVENT PASS", 50, 70);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "14px monospace";
      ctx.fillText(ticketCode, 50, 95);

      // Event Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(eventTitle.slice(0, 32), 50, 135);

      // Draw QR Code
      if (qrDataUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = qrDataUrl;
        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, (width - 180) / 2, 160, 180, 180);
            resolve();
          };
          img.onerror = resolve;
        });
      }

      // Attendee Details
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(userName, width / 2, 380);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "14px sans-serif";
      ctx.fillText(userEmail, width / 2, 405);

      ctx.fillStyle = "#10B981";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(`ROLE: ${userRole} • VERIFIED TICKET`, width / 2, 435);

      ctx.textAlign = "left";

      // Lower Section (Event Banner Overlay Card)
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.roundRect(30, 530, 540, 330, 20);
      ctx.fill();

      // Draw Event Image in background
      if (bannerUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = bannerUrl;
        await new Promise((resolve) => {
          bgImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(30, 530, 540, 330, 20);
            ctx.clip();
            ctx.globalAlpha = 0.35;
            ctx.drawImage(bgImg, 30, 530, 540, 330);
            ctx.restore();
            resolve();
          };
          bgImg.onerror = resolve;
        });
      }

      // Banner Metadata Text
      ctx.fillStyle = "#38BDF8";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("EVENT SCHEDULE & VENUE", 60, 580);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(`📅 ${formattedDate} • ${formattedTime}`, 60, 620);

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "16px sans-serif";
      ctx.fillText(`📍 ${venueText} (${cityText})`, 60, 660);

      ctx.fillStyle = "#10B981";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(`PASS PRICE: ${price === 0 ? "FREE ACCESS" : `₹${price}`}`, 60, 720);

      ctx.fillStyle = "#64748B";
      ctx.font = "12px sans-serif";
      ctx.fillText("Present this digital pass or QR code at entry check-in.", 60, 760);

      // Trigger Download
      const link = document.createElement("a");
      link.download = `${ticketCode}_EvoaPass.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download ticket:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        ref={ticketCardRef}
        className="relative w-full max-w-[420px] sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Control Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/95 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-wider text-blue-400 uppercase">
              EVOA DIGITAL PASS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* ── UPPER SECTION: Ticket Header & QR Code ── */}
          <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-900/95 text-center">
            <div className="inline-block px-3 py-1 mb-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider">
              {ticketCode}
            </div>

            <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 line-clamp-2 px-1">
              {eventTitle}
            </h2>

            {/* QR Code Container */}
            <div className="relative mx-auto w-36 h-36 sm:w-44 sm:h-44 p-2.5 sm:p-3 bg-white rounded-2xl shadow-xl border-4 border-slate-800 flex items-center justify-center mb-3 sm:mb-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Ticket QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium mb-3 sm:mb-4">
              <FiCheckCircle size={14} className="shrink-0" />
              <span>Official Verified Entry Pass</span>
            </div>

            {/* Attendee Info Box */}
            <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-3 sm:p-3.5 space-y-1.5 text-left">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 shrink-0">Attendee Name:</span>
                <span className="font-semibold text-white truncate text-right">{userName}</span>
              </div>
              {userEmail ? (
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="text-slate-400 shrink-0">Email:</span>
                  <span className="text-slate-300 font-mono truncate text-right max-w-[180px] sm:max-w-[220px]">{userEmail}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-slate-400 shrink-0">Access Role:</span>
                <span className="font-mono text-[10px] sm:text-[11px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* ── STUB PERFORATION CUTOUT ── */}
          <div className="relative flex items-center justify-between px-2 bg-slate-900">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-950 -ml-3 sm:-ml-4 border-r border-slate-800" />
            <div className="flex-1 border-t-2 border-dashed border-slate-800/80 mx-2" />
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-950 -mr-3 sm:-mr-4 border-l border-slate-800" />
          </div>

          {/* ── LOWER SECTION: Dynamic Event Banner Overlay & Details ── */}
          <div className="relative p-4 sm:p-6 bg-slate-950 overflow-hidden">
            {/* Dynamic Event Image Background */}
            {bannerUrl ? (
              <div className="absolute inset-0 z-0 opacity-25 hover:opacity-30 transition-opacity">
                <img src={bannerUrl} alt="Event background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
              </div>
            ) : null}

            {/* Banner Details Card Content */}
            <div className="relative z-10 space-y-3.5 sm:space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <FiCalendar size={16} className="sm:hidden" />
                  <FiCalendar size={18} className="hidden sm:block" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">Date &amp; Time</div>
                  <div className="text-xs sm:text-sm font-bold text-white">{formattedDate}</div>
                  <div className="text-[11px] sm:text-xs text-slate-300 font-medium">{formattedTime}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <FiMapPin size={16} className="sm:hidden" />
                  <FiMapPin size={18} className="hidden sm:block" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400">Venue &amp; Location</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">{venueText}</div>
                  <div className="text-[11px] sm:text-xs text-slate-300">{cityText}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400">Pass Price</div>
                  <div className="text-base sm:text-lg font-extrabold text-emerald-400">
                    {price === 0 ? "FREE ACCESS" : `₹${price}`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/80 px-2 sm:px-2.5 py-1 rounded-lg">
                    <FiCheckCircle size={12} className="text-emerald-400 shrink-0" /> Active Pass
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION FOOTER ── */}
        <div className="p-3.5 sm:p-5 bg-slate-900 border-t border-slate-800 flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-lg shadow-blue-600/25 disabled:opacity-50"
          >
            <FiDownload size={16} className="shrink-0" />
            <span>{downloading ? "Downloading..." : "Download Ticket"}</span>
          </button>
          <button
            onClick={onClose}
            className="py-2.5 sm:py-3 px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
