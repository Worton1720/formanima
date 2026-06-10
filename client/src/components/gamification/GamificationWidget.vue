<template>
  <div class="forge-card mb-4 rounded-2xl p-4">
    <div class="flex items-center gap-3">
      <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface-variant">
        <component :is="rankIcon" class="h-5 w-5" :style="{ color: rankColor }" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="mb-1 flex items-center justify-between">
          <span class="font-display text-base text-text">{{ rankLabel }}</span>
          <span class="font-stat text-[11px] text-text-muted">LV {{ profile?.level ?? 1 }}</span>
        </div>
        <div class="mb-1 h-2 overflow-hidden rounded-full" style="background: rgba(243,234,214,0.08);">
          <div
            :style="{
              width: `${xpPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #d6451f, #e2532b 45%, #e0aa4e)',
              borderRadius: '9999px',
              boxShadow: '0 0 8px rgba(226,83,43,0.5)',
              transition: 'width 0.4s ease',
            }"
          />
        </div>
        <div class="flex justify-between font-stat text-[11px] text-text-muted">
          <span>{{ profile?.xpCurrentLevel ?? 0 }} XP</span>
          <span class="text-text-faint">{{ profile?.xpToNextLevel ?? 100 }} XP</span>
        </div>
      </div>
      <div class="flex items-center gap-1 rounded-full border border-border px-2 py-1" style="background: rgba(226,83,43,0.12);">
        <Flame class="h-3.5 w-3.5 text-primary" />
        <span class="font-stat text-xs font-bold text-gold">{{ profile?.totalStrikes ?? 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGamificationStore } from '../../stores/gamification.store';
import { Flame, Hammer, Wrench, Trophy, Crown } from 'lucide-vue-next';

const gamification = useGamificationStore();
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
const rankColors: Record<string, string> = {
  apprentice: 'rgba(168,153,124,0.62)',
  journeyman: '#9a7a47',
  master: '#e2532b',
  grandmaster: '#e0aa4e',
};
const rankLabels: Record<string, string> = {
  apprentice: 'Подмастерье',
  journeyman: 'Ремесленник',
  master: 'Мастер',
  grandmaster: 'Гроссмейстер',
};

const rankIcon = computed(() => rankIcons[gamification.rank] ?? Hammer);
const rankColor = computed(() => rankColors[gamification.rank] ?? 'rgba(168,153,124,0.62)');
const rankLabel = computed(() => rankLabels[gamification.rank] ?? 'Подмастерье');

onMounted(() => {
  if (!profile.value) gamification.fetchProfile();
});
</script>
