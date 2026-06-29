import { ref } from 'vue';
import { notificationsApi } from '../api/notifications.api';

const STORAGE_KEY = 'push_subscribed';
const SW_TIMEOUT_MS = 4000;

const isSupported = ref(
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window,
);
const isSubscribed = ref(localStorage.getItem(STORAGE_KEY) === '1');

function swReady(): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('SW not ready')), SW_TIMEOUT_MS),
    ),
  ]);
}

async function checkSubscription(): Promise<void> {
  if (!isSupported.value) return;
  try {
    const reg = await swReady();
    const sub = await reg.pushManager.getSubscription();
    isSubscribed.value = !!sub;
    localStorage.setItem(STORAGE_KEY, sub ? '1' : '0');
  } catch {
    // SW недоступен в dev-режиме — используем состояние из localStorage
  }
}

async function subscribe(): Promise<boolean> {
  if (!isSupported.value) return false;
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    const { key } = await notificationsApi.getVapidPublicKey();
    const reg = await swReady();
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });

    const json = sub.toJSON();
    const keys = json.keys as { p256dh: string; auth: string };
    await notificationsApi.subscribe(sub.endpoint, keys.p256dh, keys.auth);

    isSubscribed.value = true;
    localStorage.setItem(STORAGE_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

async function unsubscribe(): Promise<void> {
  if (!isSupported.value) return;
  try {
    const reg = await swReady();
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await notificationsApi.unsubscribe(sub.endpoint);
    await sub.unsubscribe();
  } catch {
    // SW недоступен — просто снимаем флаг
  }
  isSubscribed.value = false;
  localStorage.setItem(STORAGE_KEY, '0');
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  return { isSupported, isSubscribed, checkSubscription, subscribe, unsubscribe };
}
