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

// The service worker is the single source of truth for OS notification display.
// The page's onMessage handler does NOT show a Notification — it only handles
// in-app state. This prevents the SW + page double-notification bug.
// notif_id is used as the tag so the browser collapses any accidental duplicates.
messaging.onBackgroundMessage(function (payload) {
  const body = payload.notification?.body || payload.notification?.title || 'New notification';
  const tag = payload.data?.notif_id || 'cloud-closet';
  self.registration.showNotification('Cloud Closet Dashboard', {
    body,
    icon:  '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    renotify: false,
    data: payload.data,
  });
});
