import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { FaBell, FaFire, FaDollarSign, FaRocket, FaCog, FaCheck } from "react-icons/fa";
import AppShell from "../../components/layout/AppShell";
import AppHeader from "../../components/layout/AppHeader";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationsService";
import { useAuth } from "../../contexts/AuthContext";
import { goToProfile } from "../../utils/profileNavigation";

export default function Notifications() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const tabs = [
    { id: 'all', label: 'All', icon: FaBell },
    { id: 'battleground', label: 'Battleground', icon: FaFire },
    { id: 'investor', label: 'Investor', icon: FaDollarSign },
    { id: 'pitch', label: 'Pitch', icon: FaRocket },
    { id: 'system', label: 'System', icon: FaCog }
  ];

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'all' ? undefined : activeTab;
      const res = await getNotifications({ type });
      const data = res?.data?.data || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    // Derive actor ID: prefer explicit actorId field (new), fall back to /u/<id> link
    const actorId =
      notification.actorId ||
      (notification.link?.startsWith('/u/') ? notification.link.split('/')[2] : null);

    if (actorId) {
      goToProfile(actorId, currentUser, navigate);
    } else if (notification.link) {
      navigate(notification.link);
    } else if (notification.type === 'battleground') {
      navigate('/battleground');
    } else if (notification.type === 'pitch' || notification.type === 'investor') {
      navigate('/explore');
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  /**
   * Renders the notification message with the actor username as a teal clickable button.
   * Uses actorId (new backend field) to navigate to their profile on click.
   * Falls back to extracting actorId from notification.link if actorId not present.
   */
  const renderMessage = (notification) => {
    const msg = notification.message || '';

    // Prefer explicit actorId field; fall back to /u/<id> link extraction
    const actorId =
      notification.actorId ||
      (notification.link?.startsWith('/u/') ? notification.link.split('/')[2] : null);

    // Extract the leading name-like phrase (1–3 capitalised words at the start)
    const leadingName = msg.match(/^([A-Z][a-zA-Z'-]+(?: [A-Z][a-zA-Z'-]+){0,2})\b/);
    if (leadingName) {
      const name = leadingName[1];
      const rest = msg.slice(name.length);
      return (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent card's handleNotificationClick
              if (actorId) goToProfile(actorId, currentUser, navigate);
            }}
            className="font-bold text-[#00B8A9] hover:underline bg-transparent border-none p-0 cursor-pointer"
            style={{ font: 'inherit', display: 'inline' }}
          >
            {name}
          </button>
          {rest}
        </>
      );
    }

    return msg;
  };

  return (
    <AppShell>
      <AppHeader title="Notifications" />
      <div className="px-3 py-4">
        {/* Unread count + mark all */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="bg-[#00B8A9] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isDark
                ? 'text-[#00B8A9] hover:bg-white/10'
                : 'text-[#00B8A9] hover:bg-[#00B8A9]/10'
                }`}
            >
              <FaCheck size={10} />
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-[#00B8A9] text-white shadow-lg shadow-[#00B8A9]/30'
                  : isDark
                    ? 'bg-white/8 text-white/60 hover:bg-white/15'
                    : 'bg-black/8 text-black/60 hover:bg-black/15'
                  }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`p-4 rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}
                style={{ height: '72px' }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${notification.isRead
                  ? isDark
                    ? 'bg-white/5 border border-white/5'
                    : 'bg-white border border-gray-200'
                  : isDark
                    ? 'bg-[#00B8A9]/10 border border-[#00B8A9]/30'
                    : 'bg-[#00B8A9]/5 border border-[#00B8A9]/30'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {notification.title && (
                      <p className={`text-sm font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-black'}`}>
                        {notification.title}
                      </p>
                    )}
                    <p className={`text-sm ${isDark ? 'text-white/80' : 'text-black/80'}`}>
                      {renderMessage(notification)}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-black/50'}`}>
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-[#00B8A9] flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className={`text-center py-16 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
            <FaBell size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No notifications</p>
            <p className="text-sm mt-1 opacity-70">You're all caught up!</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
