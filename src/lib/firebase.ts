import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            "AIzaSyCqbMdwtlzsu4epexsg4KRT1hxV4L7gbhE",
  authDomain:        "cloud-closet-dashboard.firebaseapp.com",
  projectId:         "cloud-closet-dashboard",
  storageBucket:     "cloud-closet-dashboard.firebasestorage.app",
  messagingSenderId: "620170864687",
  appId:             "1:620170864687:web:08d16b02ca5ff42238feda",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;
  try { return getMessaging(app); } catch { return null; }
}

export { getToken, onMessage };
