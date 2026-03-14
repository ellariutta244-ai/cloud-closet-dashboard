"use client";

import { useEffect } from "react";
import { getFirebaseMessaging, getToken, onMessage } from "@/lib/firebase";

// Get this from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "REPLACE_WITH_VAPID_KEY";

export function PwaSetup({ userId }: { userId?: string }) {
  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .catch((err) => console.error("[SW] Registration failed:", err));
    }
  }, []);

  // Request notification permission + save FCM token
  useEffect(() => {
    if (!userId || VAPID_KEY === "REPLACE_WITH_VAPID_KEY") return;

    async function initPush() {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const messaging = getFirebaseMessaging();
      if (!messaging) return;

      try {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (!token) return;

        // Save token to Supabase (upsert by user_id)
        await fetch("/api/save-fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, token }),
        });

        // Handle foreground notifications as browser notifications
        onMessage(messaging, (payload) => {
          const title = payload.notification?.title || "Cloud Closet";
          const body  = payload.notification?.body  || "";
          new Notification(title, { body, icon: "/icon-192.png" });
        });
      } catch (err) {
        console.error("[FCM] Token error:", err);
      }
    }

    initPush();
  }, [userId]);

  return null;
}
