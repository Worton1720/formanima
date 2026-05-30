import { ref } from 'vue';
import { defineStore } from 'pinia';
import { habitsApi } from '../api/habits.api';
import type { Habit } from '../types';

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAll(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      habits.value = await habitsApi.getAll();
    } catch (e: unknown) {
      error.value = 'Не удалось загрузить привычки';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function create(data: Partial<Habit>): Promise<Habit> {
    const habit = await habitsApi.create(data);
    habits.value.push(habit);
    return habit;
  }

  async function update(id: string, data: Partial<Habit>): Promise<void> {
    const updated = await habitsApi.update(id, data);
    const idx = habits.value.findIndex((h) => h.id === id);
    if (idx !== -1) habits.value[idx] = updated;
  }

  async function archive(id: string): Promise<void> {
    await habitsApi.archive(id);
    habits.value = habits.value.filter((h) => h.id !== id);
  }

  return {
    habits,
    loading,
    error,
    fetchAll,
    create,
    update,
    archive,
  };
});
