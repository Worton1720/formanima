<template>
  <UiDialog v-model="visible" max-width="sm">
    <div class="p-6 text-center" style="border: 2px solid #6366f1; border-radius: 1rem; box-shadow: 0 0 30px rgba(99,102,241,0.3);">
      <div class="text-4xl mb-3">⚒️ ✨</div>
      <h3 class="text-lg font-bold mb-1">Выполнено!</h3>
      <p class="text-3xl font-bold mb-1" style="color: #6366f1;">+10 XP</p>
      <p v-if="totalStrikes >= 2" class="text-sm mb-4" style="color: rgba(255,255,255,0.5);">
        Streak: {{ totalStrikes }} дней 🔥
      </p>
      <div v-else class="mb-4" />
      <UiProgress :model-value="xpPercent" height="sm" class="mb-2" />
      <p class="text-xs" style="color: rgba(255,255,255,0.5);">
        {{ gamification.burstData?.xpCurrentLevel ?? 0 }}/{{ gamification.burstData?.xpToNextLevel ?? 100 }} XP до Ур.{{ gamification.burstData?.level ?? 1 }}
      </p>
    </div>
  </UiDialog>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useGamificationStore } from '../../stores/gamification.store';
import { UiDialog, UiProgress } from '../ui';

const gamification = useGamificationStore();
const visible = ref(false);
let timer: ReturnType<typeof setTimeout> | null = null;

const xpPercent = computed(() => {
  const p = gamification.burstData;
  if (!p) return 0;
  return Math.min(100, Math.round((p.xpCurrentLevel / p.xpToNextLevel) * 100));
});
const totalStrikes = computed(() => gamification.burstData?.totalStrikes ?? 0);

watch(() => gamification.burstData, (data) => {
  if (data) {
    visible.value = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      visible.value = false;
      gamification.clearBurst();
    }, 2000);
  }
});

watch(visible, (v) => {
  if (!v) {
    gamification.clearBurst();
    if (timer) clearTimeout(timer);
  }
});
</script>
