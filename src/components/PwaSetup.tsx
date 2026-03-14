"use client";

import { useEffect, useState } from "react";
import { getFirebaseMessaging, getToken, onMessage } from "@/lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "REPLACE_WITH_VAPID_KEY";

export function PwaSetup({ userId }: { userId?: string }) {
  const [showBanner, setShowBanner] = useState(false);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .catch((err) => console.error("[SW] Registration failed:", err));
    }
  }, []);

  // Check if we should show the banner
  useEffect(() => {
    if (!userId || VAPID_KEY === "REPLACE_WITH_VAPID_KEY") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      setShowBanner(true);
    } else if (Notification.permission === "granted") {
      initPush();
    }
  }, [userId]);

  async function initPush() {
    const messaging = getFirebaseMessaging();
    if (!messaging) return;
    try {
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (!token) return;
      await fetch("/api/save-fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      onMessage(messaging, (payload) => {
        const title = payload.notification?.title || "Cloud Closet";
        const body  = payload.notification?.body  || "";
        new Notification(title, { body, icon: "/icon-192.png" });
      });
    } catch (err) {
      console.error("[FCM] Token error:", err);
    }
  }

  async function handleEnable() {
    setShowBanner(false);
    const permission = await Notification.requestPermission();
    if (permission === "granted") await initPush();
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 max-w-sm w-[90%]">
      <span className="flex-1">Enable push notifications to stay updated.</span>
      <button
        onClick={handleEnable}
        className="bg-white text-stone-900 font-medium px-3 py-1.5 rounded-lg text-xs shrink-0"
      >
        Enable
      </button>
      <button onClick={() => setShowBanner(false)} className="text-stone-400 text-lg leading-none">×</button>
    </div>
  );
}
