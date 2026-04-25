<template>
  <v-dialog v-model="visible" max-width="280" :scrim="false">
    <v-card rounded="xl" class="text-center pa-6" style="border: 2px solid #6366f1; box-shadow: 0 0 30px rgba(99,102,241,0.4);">
      <div style="font-size: 40px; margin-bottom: 8px;">⚒️ ✨</div>
      <div class="text-h6 font-weight-bold mb-1">Выполнено!</div>
      <div class="text-h4 font-weight-bold mb-1" style="color: #6366f1;">+10 XP</div>
      <div v-if="totalStrikes >= 2" class="text-body-2 text-medium-emphasis mb-4">
        Streak: {{ totalStrikes }} дней 🔥
      </div>
      <div v-else class="mb-4" />
      <v-progress-linear
        :model-value="xpPercent"
        color="primary"
        bg-color="surface-variant"
        rounded
        height="8"
        class="mb-1"
      />
      <div class="text-caption text-medium-emphasis">
        {{ gamification.burstData?.xpCurrentLevel ?? 0 }}/{{ gamification.burstData?.xpToNextLevel ?? 100 }} XP до Ур.{{ gamification.burstData?.level ?? 1 }}
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useGamificationStore } from '../../stores/gamification.store';

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
