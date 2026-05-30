<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)]">
    <p class="text-sm mb-4" style="color: rgba(255,255,255,0.5);">{{ formattedDate }}</p>

    <GamificationHero />

    <div v-if="loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <!-- Empty State: no goals -->
    <template v-else-if="goalsStore.todayGoals.goals.length === 0">
      <div class="text-center py-12">
        <div class="text-6xl mb-4">🎯</div>
        <h2 class="text-xl font-bold mb-2">Добро пожаловать в FORMANIMA</h2>
        <p class="text-sm mb-6" style="color: rgba(255,255,255,0.5);">
          Создай первую цель, чтобы начать отслеживать прогресс
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
      <div class="mb-3">
        <p class="text-xs font-medium" style="color: rgba(255,255,255,0.4);">Цели на сегодня</p>
      </div>
      <div class="flex flex-col gap-2">
        <div
          v-for="goal in goalsStore.todayGoals.goals"
          :key="goal.id"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
          :style="isDoneToday(goal.id)
            ? 'background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);'
            : 'background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);'"
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
            :style="{ background: hexToAlpha(goal.color || '#6366f1', 0.15) }"
          >
            {{ goal.icon || '🎯' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium" :style="isDoneToday(goal.id) ? 'text-decoration: line-through; color: rgba(255,255,255,0.4);' : ''">
              {{ goal.title }}
            </p>
            <template v-if="goal.targetValue && goal.targetValue > 0">
              <div class="flex items-center gap-2 mt-1">
                <div class="flex-1 rounded-full overflow-hidden" style="background: rgba(255,255,255,0.08); height: 3px;">
                  <div
                    class="h-full rounded-full"
                    :style="{
                      width: Math.min(100, (goal.currentValue / goal.targetValue) * 100) + '%',
                      background: goal.color || '#6366f1',
                    }"
                  />
                </div>
                <span class="text-xs flex-shrink-0" style="color: rgba(255,255,255,0.4);">
                  {{ goal.currentValue }}/{{ goal.targetValue }}
                </span>
              </div>
            </template>
          </div>
          <button
            class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
            :style="isDoneToday(goal.id)
              ? 'background: #6366f1;'
              : 'background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);'"
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
  if (!result) return `rgba(99,102,241,${alpha})`;
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
