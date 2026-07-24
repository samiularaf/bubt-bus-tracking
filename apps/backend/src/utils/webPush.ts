import webpush from 'web-push';
import { env } from '../config/env.js';

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) return;
  if (!env.vapidPublicKey || !env.vapidPrivateKey) {
    // Not fatal — lets the rest of the app run in dev without VAPID keys
    // generated yet (`npx web-push generate-vapid-keys`). Push sends will
    // just no-op with a clear error rather than crashing the process.
    return;
  }
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
  isConfigured = true;
}

export interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface WebPushPayload {
  title: string;
  body: string;
  relatedTripId?: string;
  relatedNoticeId?: string;
}

/** Returns true on success, false if the subscription is dead (410 Gone — caller should delete it). */
export async function sendWebPushNotification(
  subscription: WebPushSubscription,
  payload: WebPushPayload,
): Promise<{ sent: boolean; shouldRemoveSubscription: boolean }> {
  ensureConfigured();
  if (!isConfigured) {
    return { sent: false, shouldRemoveSubscription: false };
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { sent: true, shouldRemoveSubscription: false };
  } catch (err) {
    const statusCode = (err as { statusCode?: number }).statusCode;
    // 404/410 mean the subscription is no longer valid (browser unsubscribed, etc.)
    const isDead = statusCode === 404 || statusCode === 410;
    return { sent: false, shouldRemoveSubscription: isDead };
  }
}
