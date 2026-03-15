importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCqbMdwtlzsu4epexsg4KRT1hxV4L7gbhE",
  authDomain: "cloud-closet-dashboard.firebaseapp.com",
  projectId: "cloud-closet-dashboard",
  storageBucket: "cloud-closet-dashboard.firebasestorage.app",
  messagingSenderId: "620170864687",
  appId: "1:620170864687:web:08d16b02ca5ff42238feda",
});

const messaging = firebase.messaging();

// Handle background push notifications.
// Skip if a focused app window is already open — onMessage in the app will handle it.
messaging.onBackgroundMessage(function (payload) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clients) {
    const appOpen = clients.some(function (c) { return c.focused; });
    if (appOpen) return; // foreground: let onMessage handle it, avoid duplicate
    const body = payload.notification?.body || payload.notification?.title || 'New notification';
    self.registration.showNotification('Cloud Closet Dashboard', {
      body,
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
      data:  payload.data,
    });
  });
});
