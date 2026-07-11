import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { FaBell, FaFire, FaDollarSign, FaRocket, FaCog, FaCheck, FaCircle } from "react-icons/fa";
import AppHeader from "../../components/layout/AppHeader";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationsService";
import { useAuth } from "../../contexts/AuthContext";
import { goToProfile } from "../../utils/profileNavigation";

/* ─── Desktop CSS ─── */
const NOTIF_CSS = `
/* Desktop 2-column layout */
.notif-desktop-wrap {
  display: flex;
  flex-direction: column;
}
.notif-main-col { flex: 1; min-width: 0; }
.notif-right-panel { display: none; }

/* Desktop page title — only shown at lg+ */
.notif-desktop-title {
  display: none;
}

@media (min-width: 1024px) {
  .notif-desktop-wrap {
    flex-direction: row;
    align-items: flex-start;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 16px;
    gap: 24px;
  }
  .notif-main-col { 
    flex: 1; 
    min-width: 0; 
    max-width: 680px; /* limits width to what it was before the right panel was removed from flow */
  }
  .notif-right-panel {
    display: flex;
    flex-direction: column;
    position: fixed;
    right: 20px;
    top: 0;
    bottom: 0;
    width: 300px;
    padding: 20px 0;
    gap: 12px;
    overflow-y: auto;
    scrollbar-width: none;
    z-index: 5;
  }
  .notif-right-panel::-webkit-scrollbar { display: none; }
  /* Desktop page title */
  .notif-desktop-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px 8px;
    gap: 16px;
  }
}

/* Glass panel card */
.notif-panel-card {
  border-radius: 20px;
  border: 1px solid;
  overflow: hidden;
}
.notif-panel-card.dark {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.09);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
}
.notif-panel-card.light {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-color: rgba(255,255,255,0.9);
  box-shadow: 0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.95);
}

/* Notification item — left accent border on unread */
.notif-item {
  position: relative;
  padding: 14px 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all .2s;
  border: 1px solid transparent;
}
.notif-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--evoa-accent-primary);
  opacity: 0;
  transition: opacity .2s;
}
.notif-item.unread::before { opacity: 1; }

.notif-item.dark { border-color: rgba(255,255,255,0.05); }
.notif-item.dark.unread {
  background: rgba(0,184,169,0.08);
  border-color: rgba(0,184,169,0.2);
}
.notif-item.dark:hover { background: rgba(255,255,255,0.06); }

.notif-item.light { border-color: rgba(0,0,0,0.04); background: #fff; }
.notif-item.light.unread {
  background: rgba(0,184,169,0.04);
  border-color: rgba(0,184,169,0.2);
}
.notif-item.light:hover { background: rgba(0,0,0,0.03); }

/* Date group headers */
.notif-date-hdr {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 20px 0 8px;
}

/* Stat mini tiles in right panel */
.notif-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 10px 12px;
}
.notif-stat-tile {
  border-radius: 14px;
  padding: 10px;
  text-align: center;
  border: 1px solid;
}
.notif-panel-card.dark  .notif-stat-tile { background: rgba(0,184,169,0.05); border-color: rgba(0,184,169,0.14); }
.notif-panel-card.light .notif-stat-tile { background: rgba(0,184,169,0.04); border-color: rgba(0,184,169,0.12); }
`;

const TABS = [
  { id: 'all',         label: 'All',          icon: FaBell       },
  { id: 'battleground',label: 'Battleground', icon: FaFire       },
  { id: 'investor',    label: 'Investor',      icon: FaDollarSign },
  { id: 'pitch',       label: 'Pitch',         icon: FaRocket     },
  { id: 'system',      label: 'System',        icon: FaCog        },
];

function groupByDate(notifications) {
  const now = new Date();
  const groups = {};
  notifications.forEach(n => {
    const d = n.createdAt ? new Date((/[Zz]|[+-]\d{2}:\d{2}$/.test(n.createdAt) ? n.createdAt : n.createdAt + 'Z')) : null;
    let label = 'Earlier';
    if (d) {
      const diff = now - d;
      if (diff < 86400000) label = 'Today';
      else if (diff < 172800000) label = 'Yesterday';
      else if (diff < 604800000) label = 'This Week';
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
}

export default function Notifications() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cls = isDark ? 'dark' : 'light';
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { fetchNotifications(); }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'all' ? undefined : activeTab;
      const res = await getNotifications({ type });
      const data = res?.data?.data || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      } catch (_) {}
    }
    const actorId = notification.actorId
      || (notification.link?.startsWith('/u/') ? notification.link.split('/')[2] : null);
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
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (_) {}
    finally { setMarkingAll(false); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const utcStr = /[Zz]|[+-]\d{2}:\d{2}$/.test(dateStr) ? dateStr : dateStr + 'Z';
    const date = new Date(utcStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (diff < 0 || minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  };

  const renderMessage = (notification) => {
    const msg = notification.message || '';
    const actorId = notification.actorId
      || (notification.link?.startsWith('/u/') ? notification.link.split('/')[2] : null);
    const leadingName = msg.match(/^([A-Z][a-zA-Z'-]+(?: [A-Z][a-zA-Z'-]+){0,2})\b/);
    if (leadingName) {
      const name = leadingName[1];
      const rest = msg.slice(name.length);
      return (
        <>
          <button
            onClick={e => { e.stopPropagation(); if (actorId) goToProfile(actorId, currentUser, navigate); }}
            className="font-bold text-evoa hover:underline bg-transparent border-none p-0 cursor-pointer"
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

  const grouped = groupByDate(notifications);
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

  // Category breakdown for right panel
  const catCounts = TABS.filter(t => t.id !== 'all').map(t => ({
    ...t,
    count: notifications.filter(n => n.type === t.id).length
  }));

  return (
    <>
      <style>{NOTIF_CSS}</style>
      <AppHeader title="Notifications" />

      {/* Desktop page title */}
      <div className="notif-desktop-title">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all ${isDark
              ? 'text-evoa bg-evoa/10 hover:bg-evoa/20 border border-evoa/25'
              : 'text-evoa bg-evoa/8 hover:bg-evoa/15 border border-evoa/20'
            }`}
          >
            <FaCheck size={10} /> Mark all read
          </button>
        )}
      </div>

      <div className="notif-desktop-wrap px-3 py-4">
        {/* ── Left: main notification list ── */}
        <div className="notif-main-col">
          {/* Mobile unread + mark all (hidden on desktop via title bar above) */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="bg-evoa text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isDark
                  ? 'text-evoa hover:bg-white/10'
                  : 'text-evoa hover:bg-evoa/10'
                }`}
              >
                <FaCheck size={10} /> Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                    ? 'bg-evoa text-white shadow-lg shadow-evoa/30'
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
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-[72px] rounded-xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className={`text-center py-16 ${isDark ? 'text-white/60' : 'text-black/60'}`}>
              <FaBell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No notifications</p>
              <p className="text-sm mt-1 opacity-70">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {groupOrder.map(groupLabel => {
                const items = grouped[groupLabel];
                if (!items?.length) return null;
                return (
                  <div key={groupLabel}>
                    <p className={`notif-date-hdr ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{groupLabel}</p>
                    <div className="space-y-1.5">
                      {items.map(notification => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`notif-item ${cls} ${!notification.isRead ? 'unread' : ''}`}
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
                              <p className={`text-xs mt-1 ${isDark ? 'text-white/35' : 'text-black/40'}`}>
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 rounded-full bg-evoa flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(0,184,169,0.6)]" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right panel (desktop only) ── */}
        <div className="notif-right-panel">
          {/* Summary card */}
          <div className={`notif-panel-card ${cls}`}>
            <div className="px-4 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Summary</p>
            </div>
            <div className="notif-stat-grid">
              <div className="notif-stat-tile">
                <p className="text-lg font-black" style={{ background: 'linear-gradient(135deg,var(--evoa-accent-light),var(--evoa-accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {unreadCount}
                </p>
                <p className={`text-[10px] font-500 uppercase tracking-wide ${isDark ? 'text-white/35' : 'text-gray-400'}`}>Unread</p>
              </div>
              <div className="notif-stat-tile">
                <p className="text-lg font-black" style={{ background: 'linear-gradient(135deg,var(--evoa-accent-light),var(--evoa-accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {notifications.length}
                </p>
                <p className={`text-[10px] font-500 uppercase tracking-wide ${isDark ? 'text-white/35' : 'text-gray-400'}`}>Total</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="px-3 pb-3">
                <button
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all bg-evoa text-white hover:bg-[#009e96] shadow-lg shadow-evoa/30"
                >
                  <FaCheck size={11} /> Mark all read
                </button>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div className={`notif-panel-card ${cls}`}>
            <div className="px-4 py-3 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Categories</p>
            </div>
            <div className="py-1 px-2">
              {catCounts.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeTab === id
                    ? (isDark ? 'bg-evoa/12 text-evoa' : 'bg-evoa/10 text-evoa')
                    : (isDark ? 'text-white/60 hover:bg-white/5' : 'text-gray-600 hover:bg-black/4')
                  }`}
                >
                  <Icon size={13} />
                  <span className="text-sm font-medium flex-1">{label}</span>
                  {count > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === id
                      ? 'bg-evoa text-white'
                      : (isDark ? 'bg-white/10 text-white/60' : 'bg-black/8 text-gray-500')
                    }`}>{count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
