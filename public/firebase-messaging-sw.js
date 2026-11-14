/* global firebase, importScripts, clients */
// ==============================================================================
// EVOA – Firebase Cloud Messaging Service Worker (Background Push Notifications)
// ==============================================================================

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAtZXrkpFD4GRuIry62FFWuRF9c3blMM5o",
  authDomain: "evoa-f93f9.firebaseapp.com",
  projectId: "evoa-f93f9",
  storageBucket: "evoa-f93f9.firebasestorage.app",
  messagingSenderId: "588085341634",
  appId: "1:588085341634:web:1e9f36f698ff5c8863ba5b",
  measurementId: "G-BPFPVTZ75K"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background notification delivery when tab or browser is closed/inactive
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Received background message:', payload);

  const title = payload.notification?.title || payload.data?.title || 'EVOA Notification';
  const body = payload.notification?.body || payload.data?.body || payload.data?.message || 'You have a new notification on EVOA.';
  const link = payload.data?.link || payload.fcmOptions?.link || '/notifications';
  const tag = payload.data?.tag || `evoa_${Date.now()}`;
  const icon = payload.notification?.icon || '/logo.avif';

  const notificationOptions = {
    body,
    icon,
    badge: '/logo.avif',
    tag,
    data: {
      link,
      ...payload.data,
    },
    requireInteraction: false,
    renotify: true,
  };

  return self.registration.showNotification(title, notificationOptions);
});

// Handle user clicking on a push notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetPath = event.notification.data?.link || '/notifications';
  const urlToOpen = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If EVOA tab is already open, focus it and navigate to target URL
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(urlToOpen);
          }
          return client.focus();
        }
      }
      // If no tab is open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
