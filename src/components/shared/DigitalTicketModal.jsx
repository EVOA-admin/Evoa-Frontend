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
  const ticketCode = ticket?.ticketCode || ticket?.ticket_code || ticket?.id || "TKT-EVOA-PASS";

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

  const startDateVal = event?.startDate || event?.start_date || event?.date;
  const startTimeVal = event?.startTime || event?.start_time || event?.time;

  const formattedDate = startDateVal
    ? new Date(startDateVal).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date Announced Soon";

  const formattedTime = startTimeVal
    ? `${startTimeVal} ${event?.timezone || "IST"}`
    : "Time TBA";

  const venueText = event?.venueName || event?.venue_name || event?.venue || event?.meetingUrl || event?.meeting_url || "Venue Details Announced Soon";
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

  // Helper to render pass on canvas matching the onscreen Digital Pass card 1:1
  const renderCanvasPass = async (includeBanner = true) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 600;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    const drawRR = (x, y, w, h, r) => {
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(x, y, w, h, r);
      } else {
        const radii = Array.isArray(r) ? r : [r, r, r, r];
        const rTopLeft = radii[0] || 0;
        const rTopRight = radii[1] || rTopLeft;
        const rBottomRight = radii[2] || rTopLeft;
        const rBottomLeft = radii[3] || rTopRight;

        ctx.moveTo(x + rTopLeft, y);
        ctx.lineTo(x + w - rTopRight, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + rTopRight);
        ctx.lineTo(x + w, y + h - rBottomRight);
        ctx.quadraticCurveTo(x + w, y + h, x + w - rBottomRight, y + h);
        ctx.lineTo(x + rBottomLeft, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - rBottomLeft);
        ctx.lineTo(x, y + rTopLeft);
        ctx.quadraticCurveTo(x, y, x + rTopLeft, y);
        ctx.closePath();
      }
    };

    // 1. Base Card Fill (Dark Slate Theme)
    ctx.fillStyle = "#0F172A";
    drawRR(0, 0, width, height, 28);
    ctx.fill();

    // 2. Top Header Bar
    ctx.fillStyle = "#0F172A";
    drawRR(0, 0, width, 60, [28, 28, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(width, 60);
    ctx.stroke();

    // Green Status Dot & Brand Title
    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(40, 30, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "left";
    ctx.fillText("EVOA DIGITAL PASS", 54, 34);

    // 3. Upper Section (Ticket Code, Event Title, QR Code)
    // Ticket Code Pill Badge
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1;
    drawRR(width / 2 - 90, 82, 180, 28, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(ticketCode, width / 2, 100);

    // Event Title
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    const titleText = eventTitle.length > 36 ? eventTitle.slice(0, 34) + "..." : eventTitle;
    ctx.fillText(titleText, width / 2, 142);

    // QR Code Container Box
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 6;
    drawRR(width / 2 - 100, 168, 200, 200, 20);
    ctx.fill();
    ctx.stroke();

    // Draw QR Code
    if (qrDataUrl) {
      const img = new Image();
      img.src = qrDataUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          try {
            ctx.drawImage(img, width / 2 - 90, 178, 180, 180);
          } catch (_) {}
          resolve();
        };
        img.onerror = resolve;
      });
    }

    // Verified Pass Subtitle
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓ Official Verified Entry Pass", width / 2, 396);

    // Attendee Info Box
    ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    drawRR(40, 416, 520, 115, 16);
    ctx.fill();
    ctx.stroke();

    // Row 1: Attendee Name
    ctx.fillStyle = "#94A3B8";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Attendee Name:", 60, 443);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(userName.length > 28 ? userName.slice(0, 26) + "..." : userName, 540, 443);

    // Row 2: Email
    if (userEmail) {
      ctx.fillStyle = "#94A3B8";
      ctx.font = "13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Email:", 60, 475);
      ctx.fillStyle = "#CBD5E1";
      ctx.font = "13px monospace";
      ctx.textAlign = "right";
      ctx.fillText(userEmail.length > 32 ? userEmail.slice(0, 30) + "..." : userEmail, 540, 475);
    }

    // Row 3: Access Role
    ctx.fillStyle = "#94A3B8";
    ctx.font = "13px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Access Role:", 60, 507);

    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    drawRR(450, 493, 90, 22, 6);
    ctx.fill();
    ctx.fillStyle = "#38BDF8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText(userRole, 495, 508);

    // 4. Stub Perforation Cutout & Dashed Divider Line
    ctx.fillStyle = "#090D16"; // Background cutout color matching modal backdrop
    ctx.beginPath();
    ctx.arc(0, 555, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width, 555, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(30, 555);
    ctx.lineTo(570, 555);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // 5. Lower Section (Event Banner Overlay & Metadata Details)
    ctx.save();
    drawRR(0, 570, width, 390, [0, 0, 28, 28]);
    ctx.clip();

    ctx.fillStyle = "#0B0F17";
    ctx.fillRect(0, 570, width, 390);

    if (includeBanner && bannerUrl) {
      try {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = bannerUrl;
        await new Promise((resolve) => {
          bgImg.onload = () => {
            try {
              ctx.globalAlpha = 0.30;
              ctx.drawImage(bgImg, 0, 570, width, 390);
              ctx.globalAlpha = 1.0;
            } catch (_) {}
            resolve();
          };
          bgImg.onerror = resolve;
        });
      } catch (_) {}
    }
    ctx.restore();

    // Date & Time Row
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
    ctx.lineWidth = 1;
    drawRR(40, 595, 42, 42, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38BDF8";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📅", 61, 622);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("DATE & TIME", 96, 608);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(formattedDate, 96, 626);

    ctx.fillStyle = "#CBD5E1";
    ctx.font = "13px sans-serif";
    ctx.fillText(formattedTime, 96, 642);

    // Venue & Location Row
    ctx.fillStyle = "rgba(168, 85, 247, 0.15)";
    ctx.strokeStyle = "rgba(168, 85, 247, 0.3)";
    ctx.lineWidth = 1;
    drawRR(40, 665, 42, 42, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#A855F7";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📍", 61, 692);

    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("VENUE & LOCATION", 96, 678);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 15px sans-serif";
    const venueShort = venueText.length > 38 ? venueText.slice(0, 36) + "..." : venueText;
    ctx.fillText(venueShort, 96, 696);

    ctx.fillStyle = "#CBD5E1";
    ctx.font = "13px sans-serif";
    ctx.fillText(cityText, 96, 712);

    // Divider Line
    ctx.strokeStyle = "rgba(51, 65, 85, 0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 735);
    ctx.lineTo(560, 735);
    ctx.stroke();

    // Price & Active Pass Badge Row
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "left";
    ctx.fillText("PASS PRICE", 40, 755);

    ctx.fillStyle = "#10B981";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(price === 0 ? "FREE ACCESS" : `₹${price}`, 40, 780);

    // Active Pass Badge Right
    ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
    ctx.strokeStyle = "rgba(51, 65, 85, 0.9)";
    ctx.lineWidth = 1;
    drawRR(430, 750, 130, 32, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#10B981";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓ Active Pass", 495, 771);

    // Bottom Notice
    ctx.fillStyle = "#64748B";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Present this digital pass or QR code at entry check-in.", width / 2, 825);

    return canvas;
  };

  const triggerDownload = (url, filename) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // On mobile devices, also open image URL directly so iOS Safari / Android Chrome users can long-press to save image
    if (isMobile) {
      setTimeout(() => {
        try {
          const w = window.open(url, "_blank");
          if (w) w.focus();
        } catch (_) {}
      }, 250);
    }
  };

  // Download Ticket as PNG Image via Canvas rendering
  const handleDownloadTicket = async () => {
    if (downloading) return;
    try {
      setDownloading(true);

      let canvas;
      try {
        canvas = await renderCanvasPass(true);
        // Test canvas export to verify CORS compliance
        canvas.toDataURL("image/png");
      } catch (_) {
        // Fallback: render pristine canvas without cross-origin banner image if tainted
        canvas = await renderCanvasPass(false);
      }

      const filename = `${ticketCode}_EvoaPass.png`;

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            triggerDownload(blobUrl, filename);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
          } else {
            const dataUrl = canvas.toDataURL("image/png");
            triggerDownload(dataUrl, filename);
          }
          setDownloading(false);
        }, "image/png");
      } else {
        const dataUrl = canvas.toDataURL("image/png");
        triggerDownload(dataUrl, filename);
        setDownloading(false);
      }
    } catch (err) {
      console.error("Failed to download ticket:", err);
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
          <div className="flex items-center gap-1">
            <button
              onClick={handleDownloadTicket}
              disabled={downloading}
              title={downloading ? "Downloading..." : "Download Ticket"}
              aria-label="Download Ticket"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors disabled:opacity-50 touch-manipulation cursor-pointer"
            >
              <FiDownload size={18} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors touch-manipulation cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>
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

      </div>
    </div>
  );
}
