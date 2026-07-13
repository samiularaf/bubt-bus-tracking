// Web Push service worker stub. Full push/notification-click handling
// implemented in Phase 10 (Notification System) per ARCHITECTURE.md §deployment
// and the confirmed Web Push (PWA-style) decision from Phase 0.

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
    }),
  );
});
