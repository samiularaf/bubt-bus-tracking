// Web Push service worker — Phase 10 implementation, per the confirmed
// Web Push (PWA-style) decision from Phase 0.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'BUBT Transit', {
      body: payload.body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { relatedTripId: payload.relatedTripId, relatedNoticeId: payload.relatedNoticeId },
    }),
  );
});

// Tapping the notification opens the relevant trip or notice, or the app
// home if neither is present — matches the notification payloads sent by
// NotificationService (backend).
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data ?? {};
  let targetUrl = '/';
  if (data.relatedTripId) {
    targetUrl = `/trips/${data.relatedTripId}`;
  } else if (data.relatedNoticeId) {
    targetUrl = `/notices/${data.relatedNoticeId}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});
