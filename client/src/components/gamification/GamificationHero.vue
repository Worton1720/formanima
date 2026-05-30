<template>
  <div
    class="rounded-2xl p-4 mb-4 cursor-pointer relative overflow-hidden"
    style="background: linear-gradient(135deg, #1a1060 0%, #6366f1 100%);"
    @click="router.push('/achievements')"
  >
    <!-- Faint rank icon background -->
    <component
      :is="rankIcon"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-white pointer-events-none"
      style="opacity: 0.1;"
    />

    <div class="relative">
      <div v-if="!profile" class="flex justify-center">
        <UiSpinner size="sm" class="text-white" />
      </div>
      <template v-else>
        <p class="text-[11px] font-bold uppercase tracking-widest mb-2" style="color: rgba(255,255,255,0.7);">
          {{ rankLabel }} · Уровень {{ profile.level }}
        </p>

        <div class="rounded-full overflow-hidden mb-1" style="background: rgba(255,255,255,0.2); height: 8px;">
          <div
            :style="{ width: `${xpPercent}%`, height: '100%', background: 'white', borderRadius: '9999px', transition: 'width 0.3s ease' }"
          />
        </div>

        <div class="flex justify-between mb-3">
          <span class="text-[11px]" style="color: rgba(255,255,255,0.6);">{{ profile.xpCurrentLevel }} XP</span>
          <span class="text-[11px]" style="color: rgba(255,255,255,0.6);">{{ profile.xpToNextLevel }} XP</span>
        </div>

        <div class="flex items-center gap-1">
          <Flame class="w-4 h-4 text-orange-400" />
          <span class="text-sm font-bold text-white">{{ profile.totalStrikes }}</span>
          <span class="text-[11px]" style="color: rgba(255,255,255,0.6);">страйков</span>
        </div>
      </template>
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
