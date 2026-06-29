import { defineStore } from 'pinia';
import { ref } from 'vue';
import { notificationsApi } from '../api/notifications.api';
import type { PushPreferences } from '../api/notifications.api';

export const useNotificationsStore = defineStore('notifications', () => {
  const preferences = ref<PushPreferences | null>(null);
  const loading = ref(false);

  async function fetchPreferences() {
    loading.value = true;
    try {
      preferences.value = await notificationsApi.getPreferences();
    } finally {
      loading.value = false;
    }
  }

  async function updatePreferences(dto: Partial<PushPreferences>) {
    const updated = await notificationsApi.updatePreferences(dto);
    preferences.value = updated;
    return updated;
  }

  return { preferences, loading, fetchPreferences, updatePreferences };
});
