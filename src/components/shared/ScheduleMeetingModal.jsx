import React, { useState, useMemo } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { scheduleMeeting } from "../../services/meetingsService";
import { FiX, FiChevronLeft, FiChevronRight, FiClock, FiCalendar, FiVideo } from "react-icons/fi";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate 30-min time slots from 09:00 to 19:30
const TIME_SLOTS = (() => {
    const slots = [];
    for (let h = 9; h <= 19; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 19) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
})();

function formatTimeSlot(slot) {
    const [hStr, mStr] = slot.split(':');
    const h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH}:${mStr} ${period}`;
}

export default function ScheduleMeetingModal({ startupId, startupName, onClose, onScheduled }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState("date"); // "date" → "time" → "confirm"

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const firstDay = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
        return cells;
    }, [viewYear, viewMonth]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const isDisabled = (date) => !date || date < today;

    const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

    const handleSchedule = async () => {
        if (!selectedDate || !selectedTime) return;
        setLoading(true);
        setError(null);
        try {
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const dt = new Date(selectedDate);
            dt.setHours(hours, minutes, 0, 0);

            const res = await scheduleMeeting(startupId, {
                scheduledAt: dt.toISOString(),
                notes: notes.trim() || undefined,
            });
            const data = res?.data?.data || res?.data || res;
            onScheduled(data);
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || "Failed to schedule meeting.");
        } finally {
            setLoading(false);
        }
    };

    const card = `rounded-3xl border backdrop-blur-sm ${isDark ? "bg-gray-900/95 border-white/10" : "bg-white border-gray-200 shadow-2xl"}`;
    const muted = isDark ? "text-gray-400" : "text-gray-500";
    const heading = isDark ? "text-white" : "text-gray-900";
    const tealBtn = "bg-[#00B8A9] hover:bg-[#00A89A] text-white font-semibold rounded-2xl transition-all duration-200 active:scale-95";

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Sheet */}
            <div
                className={`relative z-10 w-full max-w-[430px] ${card} p-5 pb-8`}
                style={{ animation: "slideUp 0.35s cubic-bezier(.22,.61,.36,1) forwards" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <FiCalendar size={18} className="text-[#00B8A9]" />
                        <div>
                            <h2 className={`text-base font-bold ${heading}`}>Schedule Meeting</h2>
                            <p className={`text-xs ${muted}`}>with {startupName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} transition-colors`}>
                        <FiX size={16} className={muted} />
                    </button>
                </div>

                {/* Step: Date */}
                {step === "date" && (
                    <>
                        {/* Month nav */}
                        <div className="flex items-center justify-between mb-3">
                            <button onClick={prevMonth} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} transition-colors`}>
                                <FiChevronLeft size={16} className={muted} />
                            </button>
                            <span className={`font-semibold text-sm ${heading}`}>{MONTHS[viewMonth]} {viewYear}</span>
                            <button onClick={nextMonth} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"} transition-colors`}>
                                <FiChevronRight size={16} className={muted} />
                            </button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS.map(d => (
                                <div key={d} className={`text-center text-[10px] font-semibold py-1 ${muted}`}>{d}</div>
                            ))}
                        </div>

                        {/* Date grid */}
                        <div className="grid grid-cols-7 gap-0.5 mb-5">
                            {calendarDays.map((date, i) => {
                                const disabled = isDisabled(date);
                                const selected = isSameDay(date, selectedDate);
                                const isToday = isSameDay(date, today);
                                return (
                                    <button
                                        key={i}
                                        disabled={disabled || !date}
                                        onClick={() => date && setSelectedDate(date)}
                                        className={`h-9 rounded-xl text-xs font-medium transition-all duration-150 
                                            ${!date ? "invisible" : ""}
                                            ${selected ? "bg-[#00B8A9] text-white shadow-lg shadow-[#00B8A9]/30" : ""}
                                            ${!selected && isToday ? `border ${isDark ? "border-[#00B8A9] text-[#00B8A9]" : "border-[#00B8A9] text-[#00B8A9]"}` : ""}
                                            ${!selected && !isToday && !disabled ? isDark ? "text-white hover:bg-white/10" : "text-gray-700 hover:bg-gray-100" : ""}
                                            ${disabled ? "opacity-25 cursor-not-allowed" : "cursor-pointer active:scale-90"}
                                        `}
                                    >
                                        {date?.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setStep("time")}
                            disabled={!selectedDate}
                            className={`w-full py-3 text-sm ${tealBtn} disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                            {selectedDate ? `Continue — ${selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}` : "Select a Date"}
                        </button>
                    </>
                )}

                {/* Step: Time */}
                {step === "time" && (
                    <>
                        <button onClick={() => setStep("date")} className={`flex items-center gap-1 text-xs ${muted} mb-4 hover:text-[#00B8A9] transition-colors`}>
                            <FiChevronLeft size={14} /> Back to Calendar
                        </button>

                        <p className={`text-xs font-semibold mb-3 ${heading}`}>
                            <FiClock size={12} className="inline mr-1 text-[#00B8A9]" />
                            {selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>

                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto mb-4 pr-1">
                            {TIME_SLOTS.map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setSelectedTime(slot)}
                                    className={`py-2 rounded-xl text-xs font-medium transition-all duration-150 active:scale-95
                                        ${selectedTime === slot
                                            ? "bg-[#00B8A9] text-white shadow-md shadow-[#00B8A9]/30"
                                            : isDark ? "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10" : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                                        }`}
                                >
                                    {formatTimeSlot(slot)}
                                </button>
                            ))}
                        </div>

                        {/* Notes */}
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Add notes or agenda (optional)"
                            rows={2}
                            maxLength={300}
                            className={`w-full rounded-2xl px-4 py-3 text-xs outline-none border resize-none mb-4 transition-colors
                                ${isDark ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#00B8A9]" : "bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#00B8A9]"}
                            `}
                        />

                        {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

                        <button
                            onClick={handleSchedule}
                            disabled={!selectedTime || loading}
                            className={`w-full py-3 text-sm ${tealBtn} disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                                </svg>
                            ) : <FiVideo size={14} />}
                            {loading ? "Scheduling..." : "Schedule Meeting"}
                        </button>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
