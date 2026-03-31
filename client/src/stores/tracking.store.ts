import { defineStore } from 'pinia';
import { ref } from 'vue';
import { trackingApi } from '../api/tracking.api';
import { useNotify } from '../composables/useNotify';
import dayjs from 'dayjs';

export const useTrackingStore = defineStore('tracking', () => {
  const statusMap = ref<Map<string, Record<string, boolean>>>(new Map());
  const today = ref(dayjs().format('YYYY-MM-DD'));
  const { notify } = useNotify();

  async function loadStatus(habitId: string, date: string) {
    const key = `${habitId}-${date}`;
    const data = await trackingApi.getStatus(habitId, date);
    statusMap.value.set(key, data);
  }

  function getStatus(habitId: string, date: string): Record<string, boolean> {
    return statusMap.value.get(`${habitId}-${date}`) ?? {};
  }

  async function toggle(actionId: string, habitId: string, date: string, currentValue: boolean) {
    const key = `${habitId}-${date}`;
    const current = statusMap.value.get(key) ?? {};
    // Optimistic update
    statusMap.value.set(key, { ...current, [actionId]: !currentValue });
    try {
      let response: { data?: { gamification?: unknown } } | undefined;
      if (!currentValue) {
        response = await trackingApi.complete(actionId, date);
      } else {
        response = await trackingApi.uncomplete(actionId, date);
      }
      if (response?.data?.gamification) {
        const { useGamificationStore } = await import('./gamification.store');
        const gamificationStore = useGamificationStore();
        gamificationStore.setProfile(response.data.gamification as Parameters<typeof gamificationStore.setProfile>[0]);
      }
    } catch {
      // Revert on error
      statusMap.value.set(key, current);
      notify('Не удалось сохранить изменение. Попробуйте ещё раз');
    }
  }

  return { today, statusMap, loadStatus, getStatus, toggle };
});
