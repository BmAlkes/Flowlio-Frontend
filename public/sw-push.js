// Minimal service worker dedicated to Web Push notifications only —
// deliberately does not do any caching/offline work (see sw.js, which is
// unregistered on purpose to avoid serving stale builds after a deploy).

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Flowlio", body: event.data.text() };
  }

  const title = payload.title || "Flowlio";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/logo/logo.png",
    badge: "/logo/logo.png",
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(url);
      })
  );
});
