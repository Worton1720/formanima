<template>
  <v-container>
    <p class="text-body-2 text-medium-emphasis mb-4">{{ formattedDate }}</p>

    <GamificationHero />

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- Smart Empty State: нет привычек -->
    <template v-if="!loading && habitsStore.habits.length === 0">
      <div class="text-center py-10">
        <div style="font-size: 64px; margin-bottom: 16px;">⚒️</div>
        <h2 class="text-h6 font-weight-bold mb-2">Добро пожаловать в FORMANIMA</h2>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Создай первую привычку, чтобы начать ковать характер
        </p>
        <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="showForm = true">
          Создать первую привычку
        </v-btn>
        <div class="mt-3">
          <v-btn variant="text" size="small" to="/">Посмотри как это работает →</v-btn>
        </div>
      </div>
    </template>

    <!-- Привычки без действий -->
    <template v-else-if="!loading && habitsWithActions.length === 0">
      <v-list-item
        v-for="habit in habitsStore.habits"
        :key="habit.id"
        :to="`/habits/${habit.id}`"
        rounded="xl"
        class="mb-2"
        style="border: 1px solid rgba(255,255,255,0.08);"
      >
        <template #prepend>
          <v-icon :icon="habit.icon" :color="habit.color" />
        </template>
        <v-list-item-title>{{ habit.title }}</v-list-item-title>
        <v-list-item-subtitle>Добавь действия, чтобы начать отслеживать →</v-list-item-subtitle>
      </v-list-item>
    </template>

    <!-- Список привычек: невыполненные вверху -->
    <template v-else-if="!loading">
      <v-list class="pa-0">
        <DailyHabitRow
          v-for="habit in sortedHabits"
          :key="habit.id"
          :habit="habit"
          :date="today"
          :streak="streakMap[habit.id]"
        />
      </v-list>
    </template>

    <MotivationCard class="mt-4" />

    <!-- Диалог создания привычки (для Smart Empty State) -->
    <v-dialog v-model="showForm" max-width="560">
      <HabitForm @submit="onCreateHabit" @cancel="showForm = false" />
    </v-dialog>

    <XpBurstDialog />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useHabitsStore } from '../stores/habits.store';
import { useTrackingStore } from '../stores/tracking.store';
import { statsApi } from '../api/stats.api';
import { useNotify } from '../composables/useNotify';
import client from '../api/client';
import GamificationHero from '../components/gamification/GamificationHero.vue';
import DailyHabitRow from '../components/tracking/DailyHabitRow.vue';
import MotivationCard from '../components/common/MotivationCard.vue';
import HabitForm from '../components/habits/HabitForm.vue';
import XpBurstDialog from '../components/common/XpBurstDialog.vue';
import type { Habit } from '../types';

dayjs.locale('ru');

const habitsStore = useHabitsStore();
const trackingStore = useTrackingStore();
const { notify } = useNotify();
const loading = ref(true);
const showForm = ref(false);
const today = dayjs().format('YYYY-MM-DD');
const formattedDate = dayjs().format('dddd, D MMMM YYYY');
const streakMap = ref<Record<string, number>>({});

const habitsWithActions = computed(() =>
  habitsStore.habits.filter((h) => h.actions && h.actions.length > 0),
);

const sortedHabits = computed(() =>
  [...habitsWithActions.value].sort((a, b) => {
    const aStatus = trackingStore.getStatus(a.id, today);
    const bStatus = trackingStore.getStatus(b.id, today);
    const aDone = a.actions.every((ac) => aStatus[ac.id] ?? false) ? 1 : 0;
    const bDone = b.actions.every((ac) => bStatus[ac.id] ?? false) ? 1 : 0;
    return aDone - bDone;
  }),
);

async function onCreateHabit(
  data: Partial<Habit>,
  actions: { id?: string; title: string; order: number }[],
) {
  try {
    const habit = await habitsStore.create(data);
    for (const [i, a] of actions.entries()) {
      await client.post(`/habits/${habit.id}/actions`, { title: a.title, order: i });
    }
    await habitsStore.fetchAll();
    await trackingStore.loadStatus(habit.id, today);
    showForm.value = false;
  } catch {
    notify('Не удалось создать привычку');
  }
}

onMounted(async () => {
  try {
    await habitsStore.fetchAll();
    await Promise.all([
      ...habitsWithActions.value.map((h) => trackingStore.loadStatus(h.id, today)),
      ...habitsWithActions.value.map((h) =>
        statsApi.getStreak(h.id).then((s) => {
          streakMap.value[h.id] = s.current;
        }),
      ),
    ]);
  } catch {
    notify('Не удалось загрузить данные');
  } finally {
    loading.value = false;
  }
});
</script>
