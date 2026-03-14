import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getMessages, sendMessage, getConversations, getPermission, followUser, supportStartup } from "../../services/chatService";
import { getMeetingById } from "../../services/meetingsService";
import { goToProfile } from "../../utils/profileNavigation";
import { IoArrowBack, IoPaperPlaneOutline } from "react-icons/io5";
import { FiCalendar, FiVideo, FiInfo } from "react-icons/fi";
import AppShell from "../../components/layout/AppShell";

// ─── Tick mark component (WhatsApp-style) ────────────────────────────────────
// optimistic = true  → single grey tick (sending)
// isRead = false     → double grey tick (delivered, not yet seen)
// isRead = true      → double blue tick (seen)
function MessageTicks({ isOptimistic, isRead }) {
    if (isOptimistic) {
        // Single clock/tick while sending
        return (
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline-block ml-0.5 opacity-60">
                <path d="M13 4L6.5 11.5L3 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    const color = isRead ? "#ffffff" : "rgba(255,255,255,0.5)";
    // Double tick SVG
    return (
        <svg width="18" height="12" viewBox="0 0 24 14" fill="none" className="inline-block ml-0.5">
            {/* First tick */}
            <path d="M1 7L5.5 12L13 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Second tick (offset right) */}
            <path d="M8 7L12.5 12L20 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────
function MeetingCard({ msg, isDark }) {
    const [meeting, setMeeting] = useState(null);
    const [loadingMeeting, setLoadingMeeting] = useState(true);

    useEffect(() => {
        if (!msg.meetingId) { setLoadingMeeting(false); return; }
        getMeetingById(msg.meetingId)
            .then(res => setMeeting(res?.data?.data || res?.data || res))
            .catch(() => setMeeting(null))
            .finally(() => setLoadingMeeting(false));
    }, [msg.meetingId]);

    const formatMeetingDateTime = (dateStr) => {
        if (!dateStr) return { date: "—", time: "—" };
        const d = new Date(dateStr);
        return {
            date: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
            time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
        };
    };

    const statusColor = (status) => {
        switch (status) {
            case "scheduled": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
            case "ongoing": return "text-green-400 bg-green-400/10 border-green-400/20";
            case "completed": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
            case "cancelled": return "text-red-400 bg-red-400/10 border-red-400/20";
            default: return "text-[#00B8A9] bg-[#00B8A9]/10 border-[#00B8A9]/20";
        }
    };

    const jitsiUrl = meeting?.videoRoomId ? `https://meet.jit.si/${meeting.videoRoomId}` : null;
    const { date, time } = formatMeetingDateTime(meeting?.scheduledAt);

    return (
        <div className={`w-full max-w-xs rounded-2xl border overflow-hidden ${isDark ? "bg-gray-800/70 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00B8A9] to-[#007C72] px-4 py-3 flex items-center gap-2">
                <FiCalendar size={15} className="text-white/90 flex-shrink-0" />
                <span className="text-white text-sm font-semibold">Meeting Scheduled</span>
            </div>

            {/* Body */}
            <div className="px-4 py-3">
                {loadingMeeting ? (
                    <div className="flex justify-center py-3">
                        <div className="w-5 h-5 border-2 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : meeting ? (
                    <>
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1">
                                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{date}</p>
                                <p className={`text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{time}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${statusColor(meeting.status)}`}>
                                {meeting.status}
                            </span>
                        </div>
                        {meeting.notes && (
                            <p className={`text-xs mb-3 italic leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                "{meeting.notes}"
                            </p>
                        )}
                        <div className="flex gap-2">
                            {jitsiUrl && (
                                <a
                                    href={jitsiUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#00B8A9] text-white text-xs font-semibold hover:bg-[#00A89A] transition-colors active:scale-95"
                                >
                                    <FiVideo size={12} />
                                    Join Video Call
                                </a>
                            )}
                            <button
                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? "border-white/10 text-gray-400 hover:bg-white/5" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                            >
                                <FiInfo size={12} />
                                Details
                            </button>
                        </div>
                    </>
                ) : (
                    <p className={`text-xs text-center py-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>{msg.content}</p>
                )}
            </div>
        </div>
    );
}

// ─── Conversation ─────────────────────────────────────────────────────────────
export default function Conversation() {
    const { id: conversationId } = useParams();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const bottomRef = useRef();

    const [permission, setPermission] = useState(null);

    useEffect(() => {
        fetchAll();
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [convRes, msgRes] = await Promise.all([
                getConversations(),
                getMessages(conversationId)
            ]);

            const allConvs = convRes?.data?.data || convRes?.data || [];
            const currConv = allConvs.find(c => c.id === conversationId);

            if (currConv?.otherUser) {
                setOtherUser(currConv.otherUser);
                const pRes = await getPermission(currConv.otherUser.id);
                setPermission(pRes?.data?.data || pRes?.data);
            }

            const msgs = msgRes?.data?.data || msgRes?.data || [];
            setMessages(msgs);
        } catch (err) {
            console.error("Failed to load chat:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!otherUser?.id || sending) return;
        setSending(true);
        try {
            if (otherUser.role === "startup") {
                await supportStartup(otherUser.id);
            } else {
                await followUser(otherUser.id);
            }
            const pRes = await getPermission(otherUser.id);
            setPermission(pRes?.data?.data || pRes?.data);
        } catch (err) {
            console.error("Failed to follow", err);
        } finally {
            setSending(false);
        }
    };

    const handleSend = async () => {
        if (!text.trim() || sending) return;
        setSending(true);
        const tempId = Date.now();
        const optimistic = { id: tempId, senderId: authUser?.id, content: text.trim(), createdAt: new Date(), isRead: false };
        setMessages((prev) => [...prev, optimistic]);
        const msgText = text.trim();
        setText("");
        try {
            const res = await sendMessage(otherUser?.id || "", msgText);
            // Replace the optimistic entry with the real server message — no full re-fetch → no blink
            const serverMsg = res?.data?.data || res?.data || null;
            setMessages((prev) => prev.map((m) =>
                m.id === tempId ? (serverMsg ? { ...serverMsg } : { ...m, id: tempId + '_sent' }) : m
            ));
        } catch (err) {
            console.error("Failed to send:", err);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
        } finally {
            setSending(false);
        }
    };

    const formatTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <AppShell>
            <div className={`flex flex-col h-full ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
                {/* Header */}
                <div className={`flex items-center gap-3 px-4 py-3 border-b ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                    <button onClick={() => navigate("/inbox")} className={`w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                        <IoArrowBack size={20} className={isDark ? "text-white" : "text-gray-900"} />
                    </button>
                    <div className={`flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity`} onClick={() => otherUser?.id && goToProfile(otherUser.id, authUser, navigate)}>
                        <div className={`w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}>
                            {otherUser?.avatarUrl && <img src={otherUser.avatarUrl} alt={otherUser.fullName} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{otherUser?.fullName || "Chat"}</p>
                            <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>{otherUser?.role}</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-6 h-6 border-2 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : messages.map((msg) => {
                        const isMine = msg.senderId === authUser?.id;
                        const isOptimistic = typeof msg.id === 'number'; // optimistic IDs are Date.now() numbers
                        const isMeetingMsg = msg.type === "meeting";

                        if (isMeetingMsg) {
                            return (
                                <div key={msg.id} className="flex justify-center my-2">
                                    <MeetingCard msg={msg} isDark={isDark} />
                                </div>
                            );
                        }

                        return (
                            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMine
                                    ? "bg-[#00B8A9] text-white rounded-br-sm"
                                    : isDark ? "bg-gray-800 text-white rounded-bl-sm" : "bg-white text-gray-900 shadow-sm rounded-bl-sm"
                                    }`}>
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-0.5 flex items-center gap-0.5 ${isMine ? "justify-end text-white/60" : isDark ? "text-gray-500" : "text-gray-400"}`}>
                                        {formatTime(msg.createdAt)}
                                        {isMine && <MessageTicks isOptimistic={isOptimistic} isRead={!!msg.isRead} />}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className={`px-4 py-3 border-t flex items-center justify-center gap-3 ${isDark ? "bg-gray-900 border-white/10" : "bg-white border-gray-100"}`}>
                    {permission && permission.canMessage === false ? (
                        <div className="flex flex-col items-center py-2 w-full">
                            <p className={`text-sm tracking-wide font-medium mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                You can only chat when the user follows you back.
                            </p>
                            {permission.requiresFollow && (
                                <button
                                    onClick={handleFollow}
                                    disabled={sending}
                                    className="px-6 py-2 rounded-xl bg-[#00B8A9] text-white font-semibold text-sm hover:bg-[#00A89A] transition-all disabled:opacity-50"
                                >
                                    {sending ? "Processing..." : "Follow User"}
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                placeholder="Type a message..."
                                className={`flex-1 px-4 py-2.5 rounded-2xl text-sm outline-none border ${isDark ? "bg-gray-800 border-white/10 text-white placeholder-gray-600" : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                                    }`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!text.trim() || sending}
                                className="w-10 h-10 rounded-full bg-[#00B8A9] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#00A89A] transition-all active:scale-90"
                            >
                                <IoPaperPlaneOutline size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
