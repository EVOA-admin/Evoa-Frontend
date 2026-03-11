import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getConversations, getMessageRequests, respondToRequest, getUnreadCount } from "../../services/chatService";
import { IoChatbubbleEllipsesOutline, IoCheckmarkCircle, IoCloseCircle, IoPersonOutline, IoTimeOutline } from "react-icons/io5";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";

export default function Inbox() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const [tab, setTab] = useState("messages");
    const [conversations, setConversations] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unread, setUnread] = useState({ unreadMessages: 0, pendingRequests: 0 });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [convRes, reqRes, countRes] = await Promise.all([
                getConversations(),
                getMessageRequests(),
                getUnreadCount(),
            ]);
            setConversations(convRes?.data?.data || convRes?.data || []);
            setRequests(reqRes?.data?.data || reqRes?.data || []);
            setUnread(countRes?.data?.data || countRes?.data || {});
        } catch (err) {
            console.error("Failed to load inbox:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId, action) => {
        try {
            await respondToRequest(requestId, action);
            fetchAll();
        } catch (err) {
            console.error("Failed to respond:", err);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h`;
        return `${Math.floor(diffHrs / 24)}d`;
    };

    const tabs = [
        { id: "messages", label: "Messages", count: unread.unreadMessages },
        { id: "requests", label: "Requests", count: unread.pendingRequests },
    ];

    return (
        <AppShell>
            <AppHeader />
            <main className="flex flex-col h-full">
                {/* Tab Bar */}
                <div className={`flex border-b ${isDark ? "border-white/10" : "border-gray-100"}`}>
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex-1 py-3 text-sm font-semibold relative transition-all ${tab === t.id
                                    ? "text-[#00B8A9]"
                                    : isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-700"
                                }`}
                        >
                            {t.label}
                            {t.count > 0 && (
                                <span className="ml-1.5 text-xs bg-[#00B8A9] text-white rounded-full px-1.5 py-0.5">
                                    {t.count}
                                </span>
                            )}
                            {tab === t.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00B8A9] rounded-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : tab === "messages" ? (
                        conversations.length === 0 ? (
                            <EmptyState isDark={isDark} icon={<IoChatbubbleEllipsesOutline size={40} />} message="No conversations yet" />
                        ) : (
                            <div>
                                {conversations.map((conv) => {
                                    const other = conv.otherUser || {};
                                    const isUnread = (conv.unreadCount || 0) > 0;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => navigate(`/inbox/${conv.id}`)}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 border-b transition-all active:scale-[0.99] ${isDark ? "border-white/8 hover:bg-white/5" : "border-gray-50 hover:bg-gray-50"
                                                } ${isUnread ? (isDark ? "bg-[#00B8A9]/5" : "bg-[#00B8A9]/3") : ""}`}
                                        >
                                            <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center`}>
                                                {other.avatarUrl
                                                    ? <img src={other.avatarUrl} alt={other.fullName} className="w-full h-full object-cover" />
                                                    : <IoPersonOutline size={20} className={isDark ? "text-gray-500" : "text-gray-400"} />}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                                        {other.fullName || "Unknown"}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                                        <span className={`text-[11px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                                                            {formatTime(conv.lastMessageAt)}
                                                        </span>
                                                        {isUnread && (
                                                            <span className="w-2 h-2 rounded-full bg-[#00B8A9]" />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className={`text-xs truncate mt-0.5 ${isUnread
                                                    ? isDark ? "text-gray-300 font-medium" : "text-gray-700 font-medium"
                                                    : isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                    {conv.lastMessage?.content || "Start chatting"}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // Requests Tab
                        requests.length === 0 ? (
                            <EmptyState isDark={isDark} icon={<IoPersonOutline size={40} />} message="No pending message requests" />
                        ) : (
                            <div>
                                {requests.map((req) => (
                                    <div
                                        key={req.id}
                                        className={`px-4 py-4 border-b ${isDark ? "border-white/8" : "border-gray-50"}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${isDark ? "bg-gray-700" : "bg-gray-200"} flex items-center justify-center`}>
                                                {req.fromUser?.avatarUrl
                                                    ? <img src={req.fromUser.avatarUrl} alt={req.fromUser.fullName} className="w-full h-full object-cover" />
                                                    : <IoPersonOutline size={18} className={isDark ? "text-gray-500" : "text-gray-400"} />}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                                                    {req.fromUser?.fullName || "Unknown"}
                                                </p>
                                                <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                                                    Tried to message you
                                                </p>
                                            </div>
                                        </div>
                                        {req.message && (
                                            <p className={`text-sm mb-3 px-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                "{req.message}"
                                            </p>
                                        )}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRespond(req.id, "accept")}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#00B8A9] text-white text-sm font-semibold hover:bg-[#00A89A] transition-all"
                                            >
                                                <IoCheckmarkCircle size={16} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleRespond(req.id, "ignore")}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold border transition-all ${isDark ? "border-white/10 text-gray-400 hover:bg-white/8" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <IoCloseCircle size={16} /> Ignore
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </main>
        </AppShell>
    );
}

function EmptyState({ isDark, icon, message }) {
    return (
        <div className={`flex flex-col items-center justify-center py-24 gap-3 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            {icon}
            <p className="text-sm">{message}</p>
        </div>
    );
}
