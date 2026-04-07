"use client";

import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { getFirebaseMessaging } from "@/app/src/lib/firebase";
import { registerFcmToken } from "@/lib/api";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

/**
 * Registers the Firebase service worker, requests notification permission,
 * obtains an FCM token, sends it to the backend, and listens for
 * foreground messages to show as toasts.
 *
 * Must be called with a valid Firebase auth token for the current user.
 * Safe to call multiple times — skips re-registration if already done.
 */
export function useFcmNotifications(authToken: string | null) {
  const registeredToken = useRef<string | null>(null);

  useEffect(() => {
    if (!authToken || typeof window === "undefined") return;

    let unsubscribe: (() => void) | null = null;

    const currentToken = authToken as string;

    async function init() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const swParams = new URLSearchParams({
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
        });

        await navigator.serviceWorker.register(
          `/firebase-messaging-sw.js?${swParams.toString()}`,
          { scope: "/" }
        );

        // Chrome requires the service worker to be fully active before pushManager
        // is available. navigator.serviceWorker.ready resolves only once a worker
        // has reached the 'activated' state — unlike register() which resolves
        // immediately after install starts.
        const registration = await navigator.serviceWorker.ready;

        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!fcmToken) return;

        // Only register with backend if the token changed
        if (fcmToken !== registeredToken.current) {
          await registerFcmToken(currentToken, fcmToken);
          registeredToken.current = fcmToken;
        }

        // Listen for foreground messages and show as toasts
        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? "NightGuard Alert";
          const body =
            payload.notification?.body ?? "A new report has been filed in your network.";

          toast(title, {
            description: body,
            duration: 8000,
            action: {
              label: "View",
              onClick: () => {
                // The venue page will show the relevant incident
                window.location.href = "/venue";
              },
            },
          });
        });
      } catch (err) {
        console.error("[FCM] Initialization failed:", err);
      }
    }

    init();
    return () => {
      unsubscribe?.();
    };
  }, [authToken]);
}
