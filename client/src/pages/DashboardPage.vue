<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)]">
    <div class="mb-5">
      <p class="font-stat text-[11px] uppercase tracking-[0.3em] text-gold">{{ formattedDate }}</p>
      <h1 class="mt-1 font-display text-3xl text-text">У горна</h1>
    </div>

    <GamificationHero />

    <div v-if="loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <!-- Empty State: no goals -->
    <template v-else-if="goalsStore.todayGoals.goals.length === 0">
      <div class="forge-card mt-2 rounded-2xl px-6 py-12 text-center">
        <div class="mb-4 text-6xl">🔥</div>
        <h2 class="mb-2 font-display text-2xl text-text">Горн ещё холоден</h2>
        <p class="mb-6 text-sm text-text-muted">
          Создай первую цель, чтобы зажечь огонь и начать ковать прогресс
        </p>
        <router-link to="/goals">
          <UiButton size="lg">
            <Plus class="w-5 h-5 mr-1" />
            Создать первую цель
          </UiButton>
        </router-link>
      </div>
    </template>

    <!-- Today Goals List -->
    <template v-else>
      <div class="mb-3 flex items-center gap-3">
        <p class="font-stat text-[11px] uppercase tracking-[0.25em] text-text-faint">Цели на сегодня</p>
        <hr class="forge-rule flex-1" />
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="goal in goalsStore.todayGoals.goals"
          :key="goal.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
          :style="isDoneToday(goal.id)
            ? 'background: rgba(226,83,43,0.08); border: 1px solid rgba(226,83,43,0.2);'
            : 'background: #211a12; border: 1px solid rgba(243,234,214,0.10);'"
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
            :style="{ background: hexToAlpha(goal.color || '#e2532b', 0.15) }"
          >
            <GoalIcon :icon="goal.icon" :color="goal.color" class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium" :style="isDoneToday(goal.id) ? 'text-decoration: line-through; color: rgba(168,153,124,0.62);' : ''">
              {{ goal.title }}
            </p>
            <template v-if="goal.targetValue && goal.targetValue > 0">
              <div class="flex items-center gap-2 mt-1">
                <div class="flex-1 rounded-full overflow-hidden" style="background: rgba(243,234,214,0.10); height: 3px;">
                  <div
                    class="h-full rounded-full"
                    :style="{
                      width: Math.min(100, (goal.currentValue / goal.targetValue) * 100) + '%',
                      background: goal.color || '#e2532b',
                    }"
                  />
                </div>
                <span class="text-xs flex-shrink-0" style="color: rgba(168,153,124,0.62);">
                  {{ goal.currentValue }}/{{ goal.targetValue }}
                </span>
              </div>
            </template>
          </div>
          <button
            class="w-10 h-10 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            :style="isDoneToday(goal.id)
              ? 'background: #e2532b;'
              : 'background: rgba(243,234,214,0.06); border: 1px solid rgba(243,234,214,0.12);'"
            :disabled="togglingId === goal.id"
            @click="toggleGoal(goal.id)"
          >
            <Check v-if="isDoneToday(goal.id)" class="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </template>

    <MotivationCard class="mt-4" />

    <XpBurstDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { Plus, Check } from 'lucide-vue-next';
import { useGoalsStore } from '../stores/goals.store';
import { useNotify } from '../composables/useNotify';
import { UiButton, UiSpinner } from '../components/ui';
import GamificationHero from '../components/gamification/GamificationHero.vue';
import GoalIcon from '../components/common/GoalIcon.vue';
import MotivationCard from '../components/common/MotivationCard.vue';
import XpBurstDialog from '../components/common/XpBurstDialog.vue';

dayjs.locale('ru');

const goalsStore = useGoalsStore();
const { notify } = useNotify();
const loading = ref(true);
const today = dayjs().format('YYYY-MM-DD');
const formattedDate = dayjs().format('dddd, D MMMM YYYY');
const togglingId = ref<string | null>(null);

function isDoneToday(goalId: string) {
  return goalsStore.todayGoals.progresses.some(
    (p) => p.goalId === goalId && p.date.slice(0, 10) === today,
  );
}

function hexToAlpha(hex: string, alpha: number) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(226,83,43,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

async function toggleGoal(goalId: string) {
  togglingId.value = goalId;
  try {
    await goalsStore.toggleTodayProgress(goalId, today);
  } catch {
    notify('Не удалось обновить прогресс');
  } finally {
    togglingId.value = null;
  }
}

onMounted(async () => {
  try {
    await goalsStore.fetchTodayGoals();
  } catch {
    notify('Не удалось загрузить данные');
  } finally {
    loading.value = false;
  }
});
</script>
