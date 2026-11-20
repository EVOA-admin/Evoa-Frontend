import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import {
  FaBell, FaFire, FaDollarSign, FaRocket, FaCog, FaCheck,
  FaMobileAlt, FaPaperPlane, FaExclamationTriangle, FaSpinner,
} from "react-icons/fa";
import AppHeader from "../../components/layout/AppHeader";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendTestPush,
} from "../../services/notificationsService";
import {
  isPushSupported,
  isPushCardVisible,
  isIos,
  isIosPwa,
  getPermissionState,
  isPushEnabledLocally,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  subscribeForegroundMessages,
  autoSyncPushSubscription,
} from "../../services/pushNotificationService";
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
    max-width: 680px;
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

/**
 * Push Notification Control Component
 */
function PushNotificationCard({
  isDark,
  cls,
  pushSupported,
  pushEnabled,
  pushPermission,
  pushLoading,
  pushFeedback,
  onTogglePush,
  onTestPush,
  iosContext = null,
  isMobile = false,
}) {
  // Always show on iOS (browser or PWA); show on other platforms only when supported
  const showCard = pushSupported || iosContext !== null;
  if (!showCard) return null;

  const isBlocked = pushPermission === 'denied';
  // On iOS browser tab (not PWA), push isn't registerable — show guidance instead
  const isIosBrowserOnly = iosContext === 'browser';
  // On iOS PWA, push is supported (iOS 16.4+) — treat like any other supported browser
  const canEnable = pushSupported && !isIosBrowserOnly;

  return (
    <div className={`notif-panel-card ${cls} ${isMobile ? 'mb-4 p-3.5' : ''}`}>
      <div className={`${isMobile ? '' : 'px-4 py-3 border-b'}`} style={{ borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-evoa/15 text-evoa">
              <FaMobileAlt size={13} />
            </span>
            <div>
              <p className={`text-xs font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Web Push Alerts
              </p>
              <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {pushEnabled ? 'Active on this device' : isBlocked ? 'Blocked in browser' : isIosBrowserOnly ? 'Requires Home Screen install' : 'Tab closed alerts'}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            pushEnabled
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : isBlocked
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                : isIosBrowserOnly
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                  : isDark ? 'bg-white/10 text-white/50' : 'bg-black/5 text-gray-500'
          }`}>
            {pushEnabled ? 'ON' : isBlocked ? 'BLOCKED' : isIosBrowserOnly ? 'iOS' : 'OFF'}
          </span>
        </div>
      </div>

      <div className={`${isMobile ? 'pt-2.5' : 'p-3.5'} space-y-2.5`}>
        <p className={`text-[11px] leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
          {isIosBrowserOnly ? (
            <span className="flex items-start gap-1.5">
              <FaMobileAlt size={12} className="flex-shrink-0 mt-0.5 text-blue-400" />
              <span>
                To receive push alerts on iPhone, tap the{' '}
                <strong className={isDark ? 'text-white/80' : 'text-gray-800'}>Share</strong> button in Safari then{' '}
                <strong className={isDark ? 'text-white/80' : 'text-gray-800'}>Add to Home Screen</strong>.
                Open EVOA from your Home Screen to enable notifications.
              </span>
            </span>
          ) : isBlocked ? (
            <span className="text-amber-400 flex items-start gap-1.5">
              <FaExclamationTriangle size={12} className="flex-shrink-0 mt-0.5" />
              Notifications are blocked. Please allow permissions in your browser's site settings.
            </span>
          ) : pushEnabled ? (
            'You will receive instant alerts for pitch likes, comments, and messages even when EVOA is closed.'
          ) : (
            'Enable desktop & mobile notifications to never miss pitch feedback, messages, or deal interests.'
          )}
        </p>

        {pushFeedback && (
          <div className={`p-2 rounded-xl text-[11px] leading-tight border transition-all ${
            pushFeedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : pushFeedback.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                : isDark ? 'bg-white/5 border-white/10 text-white/80' : 'bg-gray-100 border-gray-200 text-gray-700'
          }`}>
            {pushFeedback.text}
          </div>
        )}

        {/* Only show Enable/Disable button when push is actually usable on this device */}
        {canEnable && (
          <div className="flex gap-2">
            {!isBlocked ? (
              <button
                onClick={onTogglePush}
                disabled={pushLoading}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                  pushEnabled
                    ? isDark
                      ? 'bg-white/8 text-white/70 hover:bg-white/15 border border-white/10'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-evoa text-white hover:bg-[#009e96] shadow-evoa/20 shadow-md'
                }`}
              >
                {pushLoading ? (
                  <>
                    <FaSpinner size={11} className="animate-spin" />
                    Updating...
                  </>
                ) : pushEnabled ? (
                  'Disable'
                ) : (
                  <>
                    <FaBell size={11} />
                    Enable Push
                  </>
                )}
              </button>
            ) : null}

            {pushEnabled && (
              <button
                onClick={onTestPush}
                disabled={pushLoading}
                title="Send a sample notification to this device"
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  isDark
                    ? 'text-evoa bg-evoa/10 hover:bg-evoa/20 border border-evoa/25'
                    : 'text-evoa bg-evoa/8 hover:bg-evoa/15 border border-evoa/20'
                }`}
              >
                <FaPaperPlane size={10} /> Test
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
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

  // Push notification state
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [pushLoading, setPushLoading] = useState(false);
  const [pushFeedback, setPushFeedback] = useState(null);
  // iOS-specific context: 'browser' = normal tab (can't subscribe yet),
  // 'pwa' = Home Screen standalone (can subscribe on iOS 16.4+), null = non-iOS
  const [iosContext, setIosContext] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  useEffect(() => {
    // Determine iOS context first
    if (isIos()) {
      setIosContext(isIosPwa() ? 'pwa' : 'browser');
    }

    const supported = isPushSupported();
    setPushSupported(supported);
    // isPushCardVisible() is true on iOS even when supported=false,
    // so we still check permission and local state for iOS PWA users
    if (supported || isIosPwa()) {
      setPushPermission(getPermissionState());
      setPushEnabled(isPushEnabledLocally());
      if (supported) autoSyncPushSubscription();
    }

    // Subscribe to foreground notifications to update the feed in real-time
    const unsubscribeForeground = subscribeForegroundMessages(() => {
      fetchNotifications();
    });

    return () => {
      if (typeof unsubscribeForeground === 'function') {
        unsubscribeForeground();
      }
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const type = activeTab === 'all' ? undefined : activeTab;
      const res = await getNotifications({ type });
      const data = res?.data?.data || res?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePush = async () => {
    if (pushLoading) return;
    setPushLoading(true);
    setPushFeedback(null);

    try {
      if (pushEnabled) {
        await unsubscribeFromPushNotifications();
        setPushEnabled(false);
        setPushPermission(getPermissionState());
        setPushFeedback({ type: 'info', text: 'Push alerts disabled on this device.' });
      } else {
        const res = await subscribeToPushNotifications();
        setPushPermission(getPermissionState());
        if (res.success) {
          setPushEnabled(true);
          setPushFeedback({ type: 'success', text: 'Push alerts enabled! You will now receive background updates.' });
        } else {
          setPushFeedback({ type: 'error', text: res.message });
        }
      }
    } catch (err) {
      setPushFeedback({ type: 'error', text: err.message || 'Failed to update push preferences.' });
    } finally {
      setPushLoading(false);
      setTimeout(() => setPushFeedback(null), 5000);
    }
  };

  const handleTestPush = async () => {
    if (pushLoading) return;
    setPushLoading(true);
    setPushFeedback(null);

    try {
      const res = await sendTestPush();
      const data = res?.data || res;
      setPushFeedback({
        type: data.success ? 'success' : 'info',
        text: data.message || 'Test push dispatched to your device.',
      });
    } catch (err) {
      setPushFeedback({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'Could not send test notification.',
      });
    } finally {
      setPushLoading(false);
      setTimeout(() => setPushFeedback(null), 6000);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      } catch {
        // ignore
      }
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
    } catch {
      // ignore
    }
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
          {/* Mobile push notification banner */}
          <div className="lg:hidden">
            <PushNotificationCard
              isDark={isDark}
              cls={cls}
              pushSupported={pushSupported}
              pushEnabled={pushEnabled}
              pushPermission={pushPermission}
              pushLoading={pushLoading}
              pushFeedback={pushFeedback}
              onTogglePush={handleTogglePush}
              onTestPush={handleTestPush}
              iosContext={iosContext}
              isMobile={true}
            />
          </div>

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
          {/* Web Push notification card */}
          <PushNotificationCard
            isDark={isDark}
            cls={cls}
            pushSupported={pushSupported}
            pushEnabled={pushEnabled}
            pushPermission={pushPermission}
            pushLoading={pushLoading}
            pushFeedback={pushFeedback}
            onTogglePush={handleTogglePush}
            onTestPush={handleTestPush}
            iosContext={iosContext}
            isMobile={false}
          />

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
              {catCounts.map((catItem) => {
                const Icon = catItem.icon;
                return (
                  <button
                    key={catItem.id}
                    onClick={() => setActiveTab(catItem.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${activeTab === catItem.id
                      ? (isDark ? 'bg-evoa/12 text-evoa' : 'bg-evoa/10 text-evoa')
                      : (isDark ? 'text-white/60 hover:bg-white/5' : 'text-gray-600 hover:bg-black/4')
                    }`}
                  >
                    <Icon size={13} />
                    <span className="text-sm font-medium flex-1">{catItem.label}</span>
                    {catItem.count > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === catItem.id
                        ? 'bg-evoa text-white'
                        : (isDark ? 'bg-white/10 text-white/60' : 'bg-black/8 text-gray-500')
                      }`}>{catItem.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
