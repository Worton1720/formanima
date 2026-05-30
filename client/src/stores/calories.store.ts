import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { caloriesApi } from '../api/calories.api';
import type {
  CalorieProfile,
  CreateFoodEntryDto,
  DailyCalorieSummary,
  FoodEntry,
  UpdateCalorieProfileDto,
  WeeklyCalorieDay,
} from '../types';

export const useCaloriesStore = defineStore('calories', () => {
  const entries = ref<FoodEntry[]>([]);
  const profile = ref<CalorieProfile | null>(null);
  const dailySummary = ref<DailyCalorieSummary | null>(null);
  const weeklySummary = ref<WeeklyCalorieDay[]>([]);
  const selectedDate = ref(new Date().toISOString().split('T')[0]);
  const loading = ref(false);

  // ─── Getters ────────────────────────────────────────────────────────────────

  const calorieProgress = computed(() => {
    if (!profile.value || !dailySummary.value) return 0;
    return Math.min(100, (dailySummary.value.totalCalories / profile.value.targetCalories) * 100);
  });

  const proteinProgress = computed(() => {
    if (!profile.value || !dailySummary.value) return 0;
    return Math.min(100, (dailySummary.value.totalProtein / profile.value.targetProtein) * 100);
  });

  const fatProgress = computed(() => {
    if (!profile.value || !dailySummary.value) return 0;
    return Math.min(100, (dailySummary.value.totalFat / profile.value.targetFat) * 100);
  });

  const carbsProgress = computed(() => {
    if (!profile.value || !dailySummary.value) return 0;
    return Math.min(100, (dailySummary.value.totalCarbs / profile.value.targetCarbs) * 100);
  });

  const entriesByMeal = computed(() => {
    const meals: Record<string, FoodEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    for (const e of entries.value) {
      meals[e.mealType]?.push(e);
    }
    return meals;
  });

  // ─── Actions ─────────────────────────────────────────────────────────────────

  function setSelectedDate(date: string) {
    selectedDate.value = date;
  }

  async function fetchEntries(date?: string) {
    const d = date ?? selectedDate.value;
    entries.value = await caloriesApi.getEntries(d);
  }

  async function createEntry(dto: CreateFoodEntryDto) {
    const entry = await caloriesApi.createEntry(dto);
    entries.value.push(entry);
    // Refresh summary to reflect changes
    await fetchDailySummary(dto.date);
    return entry;
  }

  async function deleteEntry(id: string) {
    await caloriesApi.deleteEntry(id);
    entries.value = entries.value.filter((e) => e.id !== id);
    await fetchDailySummary(selectedDate.value);
  }

  async function fetchProfile() {
    profile.value = await caloriesApi.getProfile();
  }

  async function updateProfile(dto: UpdateCalorieProfileDto) {
    profile.value = await caloriesApi.updateProfile(dto);
  }

  async function fetchDailySummary(date?: string) {
    const d = date ?? selectedDate.value;
    dailySummary.value = await caloriesApi.getDailySummary(d);
    entries.value = dailySummary.value.entries;
    if (dailySummary.value.profile) {
      profile.value = dailySummary.value.profile;
    }
  }

  async function fetchWeeklySummary(startDate: string) {
    weeklySummary.value = await caloriesApi.getWeeklySummary(startDate);
  }

  async function loadDay(date?: string) {
    const d = date ?? selectedDate.value;
    loading.value = true;
    try {
      await Promise.all([fetchDailySummary(d), fetchProfile()]);
    } finally {
      loading.value = false;
    }
  }

  return {
    // state
    entries,
    profile,
    dailySummary,
    weeklySummary,
    selectedDate,
    loading,
    // getters
    calorieProgress,
    proteinProgress,
    fatProgress,
    carbsProgress,
    entriesByMeal,
    // actions
    setSelectedDate,
    fetchEntries,
    createEntry,
    deleteEntry,
    fetchProfile,
    updateProfile,
    fetchDailySummary,
    fetchWeeklySummary,
    loadDay,
  };
});
