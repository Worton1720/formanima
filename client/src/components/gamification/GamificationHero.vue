<template>
  <div
    class="forge-card forge-glow group relative mb-5 cursor-pointer overflow-hidden rounded-2xl p-5"
    @click="router.push('/achievements')"
  >
    <!-- Тлеющий очаг в углу -->
    <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl ember-pulse"
         style="background: radial-gradient(circle, rgba(226,83,43,0.35), rgba(226,83,43,0) 70%);" />

    <div v-if="!profile" class="flex justify-center py-4">
      <UiSpinner size="sm" class="text-gold" />
    </div>

    <div v-else class="relative flex items-center gap-5">
      <!-- Медальон ранга -->
      <div class="relative flex-shrink-0">
        <div class="flex h-16 w-16 items-center justify-center rounded-full border border-border-strong bg-surface-variant"
             style="box-shadow: inset 0 0 14px rgba(224,170,78,0.18), 0 0 0 4px rgba(224,170,78,0.06);">
          <component :is="rankIcon" class="h-8 w-8 text-gold" />
        </div>
        <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border-strong bg-background px-2 py-0.5 font-stat text-[10px] font-bold leading-none text-gold">
          LV {{ profile.level }}
        </span>
      </div>

      <!-- Прогресс -->
      <div class="min-w-0 flex-1">
        <div class="mb-2 flex items-baseline justify-between gap-2">
          <h2 class="min-w-0 truncate font-display text-xl leading-tight text-text">{{ rankLabel }}</h2>
          <span class="flex flex-shrink-0 items-center gap-1 rounded-full border border-border bg-surface-variant px-2 py-0.5">
            <Flame class="h-3.5 w-3.5 text-primary" />
            <span class="font-stat text-xs font-bold text-gold">{{ profile.totalStrikes }}</span>
          </span>
        </div>

        <div class="relative mb-1.5 h-2.5 overflow-hidden rounded-full" style="background: rgba(243,234,214,0.08);">
          <div
            class="h-full rounded-full transition-[width] duration-500 ease-out"
            :style="{
              width: `${xpPercent}%`,
              background: 'linear-gradient(90deg, #d6451f, #e2532b 45%, #e0aa4e)',
              boxShadow: '0 0 10px rgba(226,83,43,0.6)',
            }"
          />
        </div>

        <div class="flex justify-between gap-2 font-stat text-[11px] text-text-muted">
          <span class="whitespace-nowrap">{{ profile.xpCurrentLevel }} / {{ profile.xpToNextLevel }} XP</span>
          <span class="whitespace-nowrap text-text-faint">до {{ profile.level + 1 }} уровня</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGamificationStore } from '../../stores/gamification.store';
import { Flame, Hammer, Wrench, Trophy, Crown } from 'lucide-vue-next';
import { UiSpinner } from '../ui';

const gamification = useGamificationStore();
const router = useRouter();

const profile = computed(() => gamification.profile);
const xpPercent = computed(() => {
  if (!profile.value) return 0;
  return Math.min(100, Math.round((profile.value.xpCurrentLevel / profile.value.xpToNextLevel) * 100));
});

const rankIcons: Record<string, unknown> = {
  apprentice: Hammer,
  journeyman: Wrench,
  master: Trophy,
  grandmaster: Crown,
};
const rankLabels: Record<string, string> = {
  apprentice: 'Подмастерье',
  journeyman: 'Ремесленник',
  master: 'Мастер',
  grandmaster: 'Гроссмейстер',
};

const rankIcon = computed(() => rankIcons[gamification.rank] ?? Hammer);
const rankLabel = computed(() => rankLabels[gamification.rank] ?? 'Подмастерье');

onMounted(() => {
  if (!profile.value) gamification.fetchProfile();
});
</script>
