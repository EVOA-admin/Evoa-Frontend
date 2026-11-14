import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, deleteToken, onMessage, isSupported } from 'firebase/messaging';
import { registerPushToken, unregisterPushToken } from './notificationsService';

const firebaseConfig = {
  apiKey: "AIzaSyAtZXrkpFD4GRuIry62FFWuRF9c3blMM5o",
  authDomain: "evoa-f93f9.firebaseapp.com",
  projectId: "evoa-f93f9",
  storageBucket: "evoa-f93f9.firebasestorage.app",
  messagingSenderId: "588085341634",
  appId: "1:588085341634:web:1e9f36f698ff5c8863ba5b",
  measurementId: "G-BPFPVTZ75K"
};

const VAPID_KEY = "BP0_7qpECeUdA-shXXBaGdI1DZmUEqc5CW3hGwl1F67IQYahrYgLOtq-LQb9_D4kGlFMLmFXzCLeinxhW8S_OgE";

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let messagingInstance = null;

async function getMessagingClient() {
  if (messagingInstance) return messagingInstance;
  const supported = await isSupported().catch(() => false);
  if (!supported) return null;
  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export const isPushSupported = () => {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
};

export const getPermissionState = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission; // 'default' | 'granted' | 'denied'
};

export const isPushEnabledLocally = () => {
  if (typeof window === 'undefined') return false;
  return (
    Notification.permission === 'granted' &&
    localStorage.getItem('evoa_push_enabled') === 'true'
  );
};

/**
 * Register Service Worker for FCM background handling
 */
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('[PushService] Service worker registered with scope:', registration.scope);
    return registration;
  } catch (err) {
    console.warn('[PushService] Service worker registration failed:', err);
    return null;
  }
};

/**
 * Request notification permission from browser, obtain FCM token and register with backend.
 * Only call this after explicit user interaction (e.g. clicking "Enable Push" button).
 */
export const subscribeToPushNotifications = async () => {
  if (!isPushSupported()) {
    return {
      success: false,
      status: 'unsupported',
      message: 'Push notifications are not supported on this browser or device.',
    };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      localStorage.removeItem('evoa_push_enabled');
      return {
        success: false,
        status: permission,
        message: permission === 'denied'
          ? 'Notifications are blocked in your browser settings. Please allow notifications from the address bar.'
          : 'Notification permission was dismissed.',
      };
    }

    // 2. Ensure Service Worker is registered
    const swReg = await registerServiceWorker();
    if (!swReg) {
      return {
        success: false,
        status: 'sw_failed',
        message: 'Could not register push service worker.',
      };
    }

    // 3. Get FCM Messaging client
    const messaging = await getMessagingClient();
    if (!messaging) {
      return {
        success: false,
        status: 'unsupported',
        message: 'Firebase messaging is not supported in this browser environment.',
      };
    }

    // 4. Retrieve FCM Token with VAPID Key
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      return {
        success: false,
        status: 'token_failed',
        message: 'Failed to generate device notification token.',
      };
    }

    // 5. Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const deviceType = isMobile ? 'mobile' : 'desktop';

    // 6. Register token with EVOA backend
    await registerPushToken({
      token,
      deviceType,
      userAgent: navigator.userAgent,
    });

    // 7. Persist local state
    localStorage.setItem('evoa_push_enabled', 'true');
    localStorage.setItem('evoa_push_token', token);

    console.log('[PushService] Push notifications enabled successfully!');
    return {
      success: true,
      token,
      status: 'granted',
      message: 'Push notifications successfully enabled!',
    };
  } catch (err) {
    console.error('[PushService] Subscription error:', err);
    return {
      success: false,
      status: 'error',
      message: err.message || 'Failed to enable push notifications.',
    };
  }
};

/**
 * Unsubscribe current browser from push notifications.
 */
export const unsubscribeFromPushNotifications = async () => {
  try {
    const token = localStorage.getItem('evoa_push_token');
    const messaging = await getMessagingClient();

    if (token) {
      // Deactivate token on backend
      await unregisterPushToken(token).catch(() => {});
    }

    if (messaging && token) {
      // Delete token from FCM client
      await deleteToken(messaging).catch(() => {});
    }

    localStorage.removeItem('evoa_push_enabled');
    localStorage.removeItem('evoa_push_token');

    console.log('[PushService] Push notifications disabled.');
    return { success: true, message: 'Push notifications disabled.' };
  } catch (err) {
    console.error('[PushService] Unsubscribe error:', err);
    localStorage.removeItem('evoa_push_enabled');
    localStorage.removeItem('evoa_push_token');
    return { success: false, message: err.message };
  }
};

/**
 * Listen for foreground push messages while EVOA tab is actively open.
 */
export const subscribeForegroundMessages = (onMessageReceived) => {
  let unsubscribe = () => {};

  getMessagingClient().then((messaging) => {
    if (!messaging) return;
    unsubscribe = onMessage(messaging, (payload) => {
      console.log('[PushService] Foreground notification received:', payload);
      if (typeof onMessageReceived === 'function') {
        onMessageReceived(payload);
      }
    });
  });

  return () => unsubscribe();
};

/**
 * Silent token check/resync on login or app start.
 */
export const autoSyncPushSubscription = async () => {
  if (!isPushSupported()) return;
  if (Notification.permission !== 'granted') return;
  if (localStorage.getItem('evoa_push_enabled') !== 'true') return;

  try {
    const swReg = await registerServiceWorker();
    const messaging = await getMessagingClient();
    if (!messaging || !swReg) return;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      const savedToken = localStorage.getItem('evoa_push_token');
      if (token !== savedToken) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
        await registerPushToken({
          token,
          deviceType: isMobile ? 'mobile' : 'desktop',
          userAgent: navigator.userAgent,
        });
        localStorage.setItem('evoa_push_token', token);
      }
    }
  } catch (err) {
    console.debug('[PushService] Silent push sync check:', err);
  }
};

export default {
  isPushSupported,
  getPermissionState,
  isPushEnabledLocally,
  registerServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  subscribeForegroundMessages,
  autoSyncPushSubscription,
};

