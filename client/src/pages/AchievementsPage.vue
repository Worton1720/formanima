<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">
    <h1 class="text-2xl font-bold mb-1">Достижения</h1>
    <p class="text-sm mb-6" style="color: rgba(255,255,255,0.4);">
      {{ unlockedCount }} из {{ total }} разблокировано
    </p>

    <div v-if="gamification.loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <div v-else-if="achievements.length === 0" class="flex-1 flex flex-col items-center justify-center text-center py-8" style="color: rgba(255,255,255,0.3);">
      <div class="text-5xl mb-4">🏆</div>
      <p class="text-lg font-medium mb-1">Нет данных</p>
      <p class="text-sm">Начни выполнять привычки, чтобы получить достижения</p>
    </div>

    <div v-else class="grid gap-3" style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));">
      <div
        v-for="ach in achievements"
        :key="ach.id"
        class="rounded-2xl p-4 transition-colors"
        :style="ach.unlocked
          ? 'background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.3);'
          : 'background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08); opacity: 0.5;'"
      >
        <div class="flex items-center gap-2 mb-2">
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            :style="ach.unlocked ? 'background: rgba(99,102,241,0.2);' : 'background: rgba(255,255,255,0.06);'"
          >
            <Trophy v-if="ach.unlocked" class="w-4 h-4" style="color: #6366f1;" />
            <Lock v-else class="w-4 h-4" style="color: rgba(255,255,255,0.3);" />
          </div>
          <span class="text-sm font-medium flex-1 truncate">{{ ach.name }}</span>
          <span class="px-2 py-0.5 rounded-full text-xs flex-shrink-0" style="background: rgba(245,158,11,0.15); color: #f59e0b;">
            +{{ ach.xpReward }} XP
          </span>
        </div>
        <p class="text-xs" style="color: rgba(255,255,255,0.5);">{{ ach.description }}</p>
        <p v-if="ach.unlockedAt" class="text-xs mt-2" style="color: #22c55e;">
          Получено: {{ formatDate(ach.unlockedAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Trophy, Lock } from 'lucide-vue-next';
import { useGamificationStore } from '../stores/gamification.store';
import { UiSpinner } from '../components/ui';
import dayjs from 'dayjs';

const gamification = useGamificationStore();

const achievements = computed(() => gamification.profile?.achievements ?? []);
const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length);
const total = computed(() => achievements.value.length);

function formatDate(iso: string) {
  return dayjs(iso).format('DD.MM.YYYY');
}

onMounted(() => {
  gamification.fetchProfile();
});
</script>
