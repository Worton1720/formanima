import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { goalsApi } from '../api/goals.api';
import type { Goal, GoalProgress, CreateGoalDto, UpdateGoalDto, AddProgressDto, RemoveProgressDto } from '../types';

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([]);
  const archivedGoals = ref<Goal[]>([]);
  const currentGoal = ref<Goal | null>(null);
  const todayGoals = ref<{ goals: Goal[]; progresses: GoalProgress[] }>({ goals: [], progresses: [] });
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Раздел «Привычки» — это цели типа 'habit'.
  const habitGoals = computed(() => goals.value.filter((g) => g.type === 'habit'));

  function isMarkedToday(goalId: string, date: string): boolean {
    return todayGoals.value.progresses.some(
      (p) => p.goalId === goalId && p.date.slice(0, 10) === date,
    );
  }

  async function fetchGoals(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      goals.value = await goalsApi.getAll();
    } catch (e: unknown) {
      error.value = 'Не удалось загрузить цели';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchArchivedGoals(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      archivedGoals.value = await goalsApi.getArchived();
    } catch (e: unknown) {
      error.value = 'Не удалось загрузить архивные цели';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTodayGoals(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      todayGoals.value = await goalsApi.getToday();
    } catch (e: unknown) {
      error.value = 'Не удалось загрузить цели на сегодня';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchGoal(id: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      currentGoal.value = await goalsApi.getOne(id);
    } catch (e: unknown) {
      error.value = 'Не удалось загрузить цель';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function createGoal(dto: CreateGoalDto): Promise<Goal> {
    const goal = await goalsApi.create(dto);
    goals.value.unshift(goal);
    return goal;
  }

  async function updateGoal(id: string, dto: UpdateGoalDto): Promise<void> {
    const updated = await goalsApi.update(id, dto);
    const idx = goals.value.findIndex((g) => g.id === id);
    if (idx !== -1) goals.value[idx] = updated;
    if (currentGoal.value?.id === id) currentGoal.value = updated;
  }

  async function deleteGoal(id: string): Promise<void> {
    await goalsApi.delete(id);
    goals.value = goals.value.filter((g) => g.id !== id);
    if (currentGoal.value?.id === id) currentGoal.value = null;
  }

  async function archiveGoal(id: string): Promise<void> {
    await goalsApi.archive(id);
    goals.value = goals.value.filter((g) => g.id !== id);
    if (currentGoal.value?.id === id) currentGoal.value = null;
  }

  async function restoreGoal(id: string): Promise<void> {
    const restored = await goalsApi.restore(id);
    archivedGoals.value = archivedGoals.value.filter((g) => g.id !== id);
    goals.value.unshift(restored);
  }

  async function addProgress(goalId: string, dto: AddProgressDto): Promise<void> {
    const progress = await goalsApi.addProgress(goalId, dto);
    const goal = goals.value.find((g) => g.id === goalId);
    if (goal) {
      goal.currentValue = (goal.currentValue ?? 0) + (dto.value ?? 1);
      if (!goal.progresses) goal.progresses = [];
      goal.progresses.unshift(progress);
    }
    if (currentGoal.value?.id === goalId) {
      currentGoal.value.currentValue = (currentGoal.value.currentValue ?? 0) + (dto.value ?? 1);
      if (!currentGoal.value.progresses) currentGoal.value.progresses = [];
      currentGoal.value.progresses.unshift(progress);
    }
  }

  async function removeProgress(goalId: string, dto: RemoveProgressDto): Promise<void> {
    await goalsApi.removeProgress(goalId, dto);
    if (currentGoal.value?.id === goalId && currentGoal.value.progresses) {
      currentGoal.value.progresses = currentGoal.value.progresses.filter(
        (p) => p.date.slice(0, 10) !== dto.date,
      );
    }
  }

  async function toggleTodayProgress(goalId: string, date: string): Promise<void> {
    const alreadyDone = todayGoals.value.progresses.some(
      (p) => p.goalId === goalId && p.date.slice(0, 10) === date,
    );
    if (alreadyDone) {
      await goalsApi.removeProgress(goalId, { date });
      todayGoals.value.progresses = todayGoals.value.progresses.filter(
        (p) => !(p.goalId === goalId && p.date.slice(0, 10) === date),
      );
    } else {
      const progress = await goalsApi.addProgress(goalId, { date, value: 1 });
      todayGoals.value.progresses.push(progress);
    }
  }

  return {
    goals,
    archivedGoals,
    currentGoal,
    todayGoals,
    loading,
    error,
    habitGoals,
    isMarkedToday,
    fetchGoals,
    fetchArchivedGoals,
    fetchTodayGoals,
    fetchGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    archiveGoal,
    restoreGoal,
    addProgress,
    removeProgress,
    toggleTodayProgress,
  };
});
