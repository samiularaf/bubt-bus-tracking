import { useState } from 'react';
import { apiRequest } from '../lib/apiClient';

type PushStatus = 'unsupported' | 'default' | 'granted' | 'denied' | 'subscribed';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Real Web Push registration: service worker → browser permission →
 * PushManager subscription → send subscription to the backend. Per the
 * confirmed Web Push (PWA-style) decision. Note: registering the
 * subscription server-side requires an authenticated session — the mock
 * frontend auth doesn't yet provide a real access token, so the final
 * `apiRequest` call will 401 until real login/session wiring lands; the
 * subscription mechanism itself (browser-side) is fully real and correct.
 */
export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>(
    !('serviceWorker' in navigator) || !('PushManager' in window)
      ? 'unsupported'
      : (Notification.permission as PushStatus),
  );
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    if (status === 'unsupported') return;

    try {
      const permission = await Notification.requestPermission();
      setStatus(permission as PushStatus);
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await navigator.serviceWorker.ready;

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setError('Push is not configured yet (missing VAPID public key).');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const json = subscription.toJSON();
      await apiRequest('/users/me/push-subscription', {
        method: 'POST',
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
        }),
      });

      setStatus('subscribed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable notifications.');
    }
  }

  return { status, error, subscribe };
}
