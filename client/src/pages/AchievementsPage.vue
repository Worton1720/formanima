<template>
  <v-container>
    <h1 class="text-h5 mb-2">Достижения</h1>
    <p class="text-body-2 text-medium-emphasis mb-6">
      {{ unlockedCount }} из {{ total }} разблокировано
    </p>

    <v-progress-linear v-if="gamification.loading" indeterminate color="primary" class="mb-4" />

    <v-row>
      <v-col
        v-for="ach in achievements"
        :key="ach.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          rounded="xl"
          :variant="ach.unlocked ? 'tonal' : 'outlined'"
          :color="ach.unlocked ? 'primary' : undefined"
          :style="ach.unlocked ? '' : 'opacity: 0.5'"
          height="100%"
        >
          <v-card-text>
            <div class="d-flex align-center gap-2 mb-2">
              <v-icon
                :icon="ach.unlocked ? 'mdi-trophy' : 'mdi-lock'"
                :color="ach.unlocked ? 'primary' : 'grey'"
              />
              <span class="text-body-1 font-weight-medium">{{ ach.name }}</span>
              <v-spacer />
              <v-chip size="x-small" color="amber" variant="tonal">+{{ ach.xpReward }} XP</v-chip>
            </div>
            <p class="text-body-2 text-medium-emphasis">{{ ach.description }}</p>
            <p v-if="ach.unlockedAt" class="text-caption text-success mt-1">
              Получено: {{ formatDate(ach.unlockedAt) }}
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-empty-state
      v-if="!gamification.loading && achievements.length === 0"
      icon="mdi-trophy-outline"
      title="Нет данных"
      text="Начни выполнять привычки, чтобы получить достижения"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGamificationStore } from '../stores/gamification.store';
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
