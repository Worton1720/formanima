<template>
  <v-card rounded="xl" variant="tonal" color="secondary" class="mb-4">
    <v-card-text>
      <div class="d-flex align-center gap-3">
        <v-icon :icon="rankIcon" size="32" :color="rankColor" />
        <div class="flex-grow-1">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-body-2 font-weight-medium text-capitalize">{{ rankLabel }}</span>
            <span class="text-caption text-medium-emphasis">Уровень {{ profile?.level ?? 1 }}</span>
          </div>
          <v-progress-linear
            :model-value="xpPercent"
            color="secondary"
            bg-color="surface-variant"
            rounded
            height="6"
          />
          <div class="d-flex justify-space-between mt-1">
            <span class="text-caption text-medium-emphasis">{{ profile?.xpCurrentLevel ?? 0 }} XP</span>
            <span class="text-caption text-medium-emphasis">{{ profile?.xpToNextLevel ?? 100 }} XP</span>
          </div>
        </div>
        <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-fire">
          {{ profile?.totalStrikes ?? 0 }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGamificationStore } from '../../stores/gamification.store';

const gamification = useGamificationStore();
const profile = computed(() => gamification.profile);

const xpPercent = computed(() => {
  if (!profile.value) return 0;
  return Math.min(100, Math.round((profile.value.xpCurrentLevel / profile.value.xpToNextLevel) * 100));
});

const rankConfig: Record<string, { icon: string; color: string; label: string }> = {
  apprentice: { icon: 'mdi-hammer', color: 'grey', label: 'Подмастерье' },
  journeyman: { icon: 'mdi-tools', color: 'blue', label: 'Ремесленник' },
  master: { icon: 'mdi-trophy', color: 'orange', label: 'Мастер' },
  grandmaster: { icon: 'mdi-crown', color: 'amber', label: 'Гроссмейстер' },
};

const rankIcon = computed(() => rankConfig[gamification.rank]?.icon ?? 'mdi-hammer');
const rankColor = computed(() => rankConfig[gamification.rank]?.color ?? 'grey');
const rankLabel = computed(() => rankConfig[gamification.rank]?.label ?? 'Подмастерье');

onMounted(() => {
  if (!profile.value) gamification.fetchProfile();
});
</script>
