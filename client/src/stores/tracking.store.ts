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

  async function toggleHabit(habit: import('../types').Habit, date: string) {
    const key = `${habit.id}-${date}`;
    const current = statusMap.value.get(key) ?? {};
    const allComplete = habit.actions.every((a) => current[a.id] ?? false);

    // Optimistic update
    const newStatus: Record<string, boolean> = {};
    for (const a of habit.actions) newStatus[a.id] = !allComplete;
    statusMap.value.set(key, newStatus);

    try {
      let lastResponse: { data?: { gamification?: unknown } } | undefined;

      if (!allComplete) {
        const incomplete = habit.actions.filter((a) => !(current[a.id] ?? false));
        for (const a of incomplete) {
          lastResponse = await trackingApi.complete(a.id, date);
        }
        if (lastResponse?.data?.gamification) {
          const { useGamificationStore } = await import('./gamification.store');
          const gs = useGamificationStore();
          const gData = lastResponse.data.gamification as import('../types').GamificationProfile;
          gs.setProfile(gData);
          gs.showBurst(gData);
        }
      } else {
        const complete = habit.actions.filter((a) => current[a.id] ?? false);
        for (const a of complete) {
          await trackingApi.uncomplete(a.id, date);
        }
      }
    } catch {
      statusMap.value.set(key, current);
      notify('Не удалось сохранить изменение. Попробуйте ещё раз');
    }
  }

  return { today, statusMap, loadStatus, getStatus, toggle, toggleHabit };
});
