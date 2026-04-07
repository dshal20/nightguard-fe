"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { getFirebaseMessaging } from "@/app/src/lib/firebase";
import { registerFcmToken } from "@/lib/api";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

const SEVERITY_COLORS: Record<string, { bg: string; border: string }> = {
  HIGH:   { bg: "rgba(232, 72, 104, 0.10)", border: "rgba(232, 72, 104, 0.30)" },
  MEDIUM: { bg: "rgba(219, 169, 64, 0.10)",  border: "rgba(219, 169, 64, 0.30)" },
  LOW:    { bg: "rgba(91, 106, 255, 0.10)",  border: "rgba(91, 106, 255, 0.30)" },
};

export function useFcmNotifications(authToken: string | null) {
  const registeredToken = useRef<string | null>(null);
  const queryClient = useQueryClient();

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

        const registration = await navigator.serviceWorker.ready;
        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (!fcmToken) return;

        if (fcmToken !== registeredToken.current) {
          await registerFcmToken(currentToken, fcmToken);
          registeredToken.current = fcmToken;
        }

        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? "NightGuard Alert";
          const body = payload.notification?.body ?? "A new report has been filed in your network.";
          const severity = payload.data?.severity;
          const colors = severity ? SEVERITY_COLORS[severity] : undefined;

          // Immediately refresh the Live Activity panel
          queryClient.invalidateQueries({ queryKey: ["notificationActivity"] });

          toast(title, {
            description: body,
            duration: 8000,
            style: colors
              ? { backgroundColor: colors.bg, border: `1px solid ${colors.border}` }
              : undefined,
            action: {
              label: "View",
              onClick: () => { window.location.href = "/venue"; },
            },
          });
        });
      } catch (err) {
        console.error("[FCM] Initialization failed:", err);
      }
    }

    init();
    return () => { unsubscribe?.(); };
  }, [authToken, queryClient]);
}
