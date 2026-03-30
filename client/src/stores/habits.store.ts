import { defineStore } from 'pinia';
import { ref } from 'vue';
import { habitsApi } from '../api/habits.api';
import type { Habit } from '../types';

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([]);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      habits.value = await habitsApi.getAll();
    } finally {
      loading.value = false;
    }
  }

  async function create(data: Partial<Habit>) {
    const habit = await habitsApi.create(data);
    habits.value.push(habit);
    return habit;
  }

  async function update(id: string, data: Partial<Habit>) {
    const updated = await habitsApi.update(id, data);
    const idx = habits.value.findIndex((h) => h.id === id);
    if (idx !== -1) habits.value[idx] = updated;
  }

  async function archive(id: string) {
    await habitsApi.archive(id);
    habits.value = habits.value.filter((h) => h.id !== id);
  }

  return { habits, loading, fetchAll, create, update, archive };
});
