<template>
  <v-card
    rounded="xl"
    class="mb-4 cursor-pointer"
    style="background: linear-gradient(135deg, #1a1060 0%, #6366f1 100%); overflow: hidden; position: relative;"
    @click="router.push('/achievements')"
  >
    <!-- Полупрозрачная иконка ранга фоном -->
    <v-icon
      :icon="rankIcon"
      size="80"
      style="position: absolute; right: 16px; top: 50%; transform: translateY(-50%); opacity: 0.15; color: white;"
    />

    <v-card-text class="pa-4" style="position: relative;">
      <div v-if="!profile" class="d-flex justify-center">
        <v-progress-circular indeterminate color="white" size="24" />
      </div>
      <template v-else>
        <div class="text-caption font-weight-bold mb-2" style="color: rgba(255,255,255,0.7); letter-spacing: 1px; text-transform: uppercase;">
          {{ rankLabel }} · Уровень {{ profile.level }}
        </div>

        <v-progress-linear
          :model-value="xpPercent"
          color="white"
          bg-color="rgba(255,255,255,0.2)"
          rounded
          height="8"
          class="mb-1"
        />
        <div class="d-flex justify-space-between mb-3">
          <span class="text-caption" style="color: rgba(255,255,255,0.6);">{{ profile.xpCurrentLevel }} XP</span>
          <span class="text-caption" style="color: rgba(255,255,255,0.6);">{{ profile.xpToNextLevel }} XP</span>
        </div>

        <div class="d-flex gap-4">
          <div class="d-flex align-center gap-1">
            <v-icon icon="mdi-fire" size="16" color="orange" />
            <span class="text-body-2 font-weight-bold text-white">{{ profile.totalStrikes }}</span>
            <span class="text-caption" style="color: rgba(255,255,255,0.6);">страйков</span>
          </div>
        </div>
      </template>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGamificationStore } from '../../stores/gamification.store';

const gamification = useGamificationStore();
const router = useRouter();

const profile = computed(() => gamification.profile);
const xpPercent = computed(() => {
  if (!profile.value) return 0;
  return Math.min(100, Math.round((profile.value.xpCurrentLevel / profile.value.xpToNextLevel) * 100));
});

const rankConfig: Record<string, { icon: string; label: string }> = {
  apprentice: { icon: 'mdi-hammer', label: 'Подмастерье' },
  journeyman: { icon: 'mdi-tools', label: 'Ремесленник' },
  master: { icon: 'mdi-trophy', label: 'Мастер' },
  grandmaster: { icon: 'mdi-crown', label: 'Гроссмейстер' },
};

const rankIcon = computed(() => rankConfig[gamification.rank]?.icon ?? 'mdi-hammer');
const rankLabel = computed(() => rankConfig[gamification.rank]?.label ?? 'Подмастерье');

onMounted(() => {
  if (!profile.value) gamification.fetchProfile();
});
</script>
