<template>
  <v-container>
    <h1 class="text-h5 mb-6">Аналитика</h1>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row class="mb-4">
      <v-col
        v-for="item in overview"
        :key="item.habitId"
        cols="12"
        md="6"
      >
        <v-card rounded="xl" variant="tonal" color="primary">
          <v-card-text>
            <div class="text-body-1 font-weight-medium mb-2">{{ item.title }}</div>
            <div class="d-flex align-center gap-4">
              <v-progress-circular
                :model-value="Math.round(item.completionRate * 100)"
                color="primary"
                size="56"
                width="5"
              >
                {{ Math.round(item.completionRate * 100) }}%
              </v-progress-circular>
              <div>
                <div class="text-body-2">
                  Выполнено: {{ item.completedDays }} из {{ item.totalDays }} дней
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-empty-state
      v-if="!loading && overview.length === 0"
      icon="mdi-chart-line"
      title="Нет данных"
      text="Начни выполнять привычки, чтобы видеть статистику"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { statsApi } from '../api/stats.api';
import type { HabitOverview } from '../types';

const loading = ref(true);
const overview = ref<HabitOverview[]>([]);

onMounted(async () => {
  try {
    overview.value = await statsApi.getOverview(30);
  } finally {
    loading.value = false;
  }
});
</script>
