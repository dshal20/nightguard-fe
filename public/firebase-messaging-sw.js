importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js");

// These values are injected at registration time via the URL query string
// to avoid hard-coding them in the service worker.
function getParam(name) {
  const url = new URL(location.href);
  return url.searchParams.get(name) || "";
}

firebase.initializeApp({
  apiKey: getParam("apiKey"),
  authDomain: getParam("authDomain"),
  projectId: getParam("projectId"),
  storageBucket: getParam("storageBucket"),
  messagingSenderId: getParam("messagingSenderId"),
  appId: getParam("appId"),
});

const messaging = firebase.messaging();

// Handle background messages (app not in focus)
messaging.onBackgroundMessage(function (payload) {
  const { title, body } = payload.notification || {};
  const notificationTitle = title || "NightGuard Alert";
  const notificationOptions = {
    body: body || "A new report has been filed in your network.",
    icon: "/NigtGuardLogo.png",
    badge: "/NigtGuardLogo.png",
    data: payload.data,
    tag: payload.data?.type || "nightguard-notification",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow("/venue");
    })
  );
});
