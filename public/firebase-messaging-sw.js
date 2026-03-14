importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Replace these with your Firebase project config values
firebase.initializeApp({
  apiKey: "AIzaSyCqbMdwtlzsu4epexsg4KRT1hxV4L7gbhE",
  authDomain: "cloud-closet-dashboard.firebaseapp.com",
  projectId: "cloud-closet-dashboard",
  storageBucket: "cloud-closet-dashboard.firebasestorage.app",
  messagingSenderId: "620170864687",
  appId: "1:620170864687:web:08d16b02ca5ff42238feda",
});

const messaging = firebase.messaging();

// Handle background push notifications
messaging.onBackgroundMessage(function (payload) {
  const title = payload.notification?.title || 'Cloud Closet';
  const body  = payload.notification?.body  || '';
  self.registration.showNotification(title, {
    body,
    icon:  '/icon-192.png',
    badge: '/icon-192.png',
    data:  payload.data,
  });
});
