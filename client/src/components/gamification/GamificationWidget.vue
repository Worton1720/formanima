<template>
  <div class="rounded-2xl p-4 mb-4" style="background: #242424; border: 1px solid rgba(255,255,255,0.08);">
    <div class="flex items-center gap-3">
      <component :is="rankIcon" class="w-8 h-8 flex-shrink-0" :style="{ color: rankColor }" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-medium">{{ rankLabel }}</span>
          <span class="text-xs" style="color: rgba(255,255,255,0.5);">Уровень {{ profile?.level ?? 1 }}</span>
        </div>
        <div class="rounded-full overflow-hidden mb-1" style="background: rgba(255,255,255,0.1); height: 6px;">
          <div
            :style="{ width: `${xpPercent}%`, height: '100%', background: '#6366f1', borderRadius: '9999px', transition: 'width 0.3s ease' }"
          />
        </div>
        <div class="flex justify-between">
          <span class="text-[11px]" style="color: rgba(255,255,255,0.5);">{{ profile?.xpCurrentLevel ?? 0 }} XP</span>
          <span class="text-[11px]" style="color: rgba(255,255,255,0.5);">{{ profile?.xpToNextLevel ?? 100 }} XP</span>
        </div>
      </div>
      <div class="flex items-center gap-1 px-2 py-1 rounded-full" style="background: rgba(249,115,22,0.15);">
        <Flame class="w-3.5 h-3.5 text-orange-400" />
        <span class="text-xs font-medium text-orange-400">{{ profile?.totalStrikes ?? 0 }}</span>
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
  apprentice: 'rgba(255,255,255,0.4)',
  journeyman: '#60a5fa',
  master: '#f97316',
  grandmaster: '#f59e0b',
};
const rankLabels: Record<string, string> = {
  apprentice: 'Подмастерье',
  journeyman: 'Ремесленник',
  master: 'Мастер',
  grandmaster: 'Гроссмейстер',
};

const rankIcon = computed(() => rankIcons[gamification.rank] ?? Hammer);
const rankColor = computed(() => rankColors[gamification.rank] ?? 'rgba(255,255,255,0.4)');
const rankLabel = computed(() => rankLabels[gamification.rank] ?? 'Подмастерье');

onMounted(() => {
  if (!profile.value) gamification.fetchProfile();
});
</script>
