<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Архив целей</h1>
      <router-link to="/goals" class="text-sm" style="color: rgba(168,153,124,0.62);">
        ← К целям
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <!-- Empty State -->
    <template v-else-if="store.archivedGoals.length === 0">
      <div class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color: rgba(243,234,214,0.3);">
        <Archive class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
        <p class="font-medium mb-1">В архиве пусто</p>
        <p class="text-sm mb-4">Заархивированные цели появятся здесь</p>
        <router-link to="/goals">
          <UiButton variant="tonal">К целям</UiButton>
        </router-link>
      </div>
    </template>

    <!-- Archived Goals List -->
    <template v-else>
      <div class="flex flex-col gap-3">
        <div
          v-for="goal in store.archivedGoals"
          :key="goal.id"
          class="px-4 py-4 rounded-xl"
          style="background: #211a12; border: 1px solid rgba(243,234,214,0.10);"
        >
          <!-- Goal header -->
          <div class="flex items-start gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              :style="{ background: hexToAlpha(goal.color || '#e2532b', 0.15) }"
            >
              <GoalIcon :icon="goal.icon" :color="goal.color" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-semibold truncate">{{ goal.title }}</p>
                <span
                  class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  :style="typeBadgeStyle(goal.type)"
                >{{ typeLabel(goal.type) }}</span>
              </div>
              <p v-if="goal.description" class="text-xs mt-0.5 truncate" style="color: rgba(168,153,124,0.62);">
                {{ goal.description }}
              </p>
            </div>
          </div>

          <!-- Progress bar -->
          <template v-if="goal.targetValue && goal.targetValue > 0">
            <div class="flex justify-between text-xs mb-1" style="color: rgba(168,153,124,0.82);">
              <span>Прогресс</span>
              <span>{{ goal.currentValue }} / {{ goal.targetValue }}</span>
            </div>
            <UiProgress
              :model-value="(goal.currentValue / goal.targetValue) * 100"
              :color="goal.color || '#e2532b'"
              height="sm"
              class="mb-3"
            />
          </template>

          <!-- Actions -->
          <div class="flex gap-2">
            <UiButton variant="tonal" size="sm" class="w-full" :loading="restoringId === goal.id" @click="onRestore(goal.id)">
              <RotateCcw class="w-3.5 h-3.5 mr-1" />Восстановить
            </UiButton>
          </div>
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Archive, RotateCcw } from 'lucide-vue-next';
import { useGoalsStore } from '../stores/goals.store';
import { useNotify } from '../composables/useNotify';
import { UiButton, UiSpinner, UiProgress } from '../components/ui';
import GoalIcon from '../components/common/GoalIcon.vue';

const store = useGoalsStore();
const { notify } = useNotify();

const restoringId = ref<string | null>(null);

const TYPE_COLORS: Record<string, string> = {
  habit: 'rgba(226,83,43,0.2)',
  project: 'rgba(59,130,246,0.2)',
  nutrition: 'rgba(34,197,94,0.2)',
  finance: 'rgba(234,179,8,0.2)',
  fitness: 'rgba(226,83,43,0.2)',
  other: 'rgba(107,114,128,0.2)',
};

const TYPE_TEXT_COLORS: Record<string, string> = {
  habit: '#818cf8',
  project: '#9a7a47',
  nutrition: '#4ade80',
  finance: '#facc15',
  fitness: '#fb923c',
  other: '#9ca3af',
};

const TYPE_LABELS: Record<string, string> = {
  habit: 'Привычка',
  project: 'Проект',
  nutrition: 'Питание',
  finance: 'Финансы',
  fitness: 'Фитнес',
  other: 'Другое',
};

function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type;
}

function typeBadgeStyle(type: string) {
  return {
    background: TYPE_COLORS[type] ?? 'rgba(107,114,128,0.2)',
    color: TYPE_TEXT_COLORS[type] ?? '#9ca3af',
  };
}

function hexToAlpha(hex: string, alpha: number) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(226,83,43,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

async function onRestore(id: string) {
  restoringId.value = id;
  try {
    await store.restoreGoal(id);
    notify('Цель восстановлена', 'success');
  } catch {
    notify('Не удалось восстановить цель');
  } finally {
    restoringId.value = null;
  }
}

onMounted(async () => {
  try {
    await store.fetchArchivedGoals();
  } catch {
    notify('Не удалось загрузить архив');
  }
});
</script>
