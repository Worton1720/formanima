<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h5">Аналитика</h1>
      <v-spacer />
      <v-btn-toggle v-model="period" mandatory density="compact" variant="outlined" @update:model-value="load">
        <v-btn :value="7" size="small">7 дней</v-btn>
        <v-btn :value="30" size="small">30 дней</v-btn>
      </v-btn-toggle>
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- KPI карточки -->
    <v-row v-if="!loading && overview.length" class="mb-4">
      <v-col cols="4">
        <v-card rounded="xl" variant="tonal" color="primary" class="text-center pa-3">
          <div class="text-h5 font-weight-bold" style="color: #6366f1;">{{ avgCompletion }}%</div>
          <div class="text-caption text-medium-emphasis">выполнений</div>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card rounded="xl" variant="tonal" color="warning" class="text-center pa-3">
          <div class="text-h5 font-weight-bold" style="color: #f59e0b;">{{ maxStreak }}</div>
          <div class="text-caption text-medium-emphasis">streak дней 🔥</div>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card rounded="xl" variant="tonal" color="success" class="text-center pa-3">
          <div class="text-h5 font-weight-bold" style="color: #22c55e;">{{ perfectDays }}</div>
          <div class="text-caption text-medium-emphasis">идеал. дней</div>
        </v-card>
      </v-col>
    </v-row>

    <template v-if="!loading">
      <v-row class="mb-4">
        <v-col cols="12">
          <v-card rounded="xl" variant="tonal" color="primary">
            <v-card-title class="text-body-1 font-weight-medium pt-4 px-4 pb-0">
              Выполнения по дням
            </v-card-title>
            <v-card-text>
              <canvas ref="lineChartRef" height="120" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-4" v-if="overview.length">
        <v-col cols="12">
          <v-card rounded="xl">
            <v-card-title class="text-body-1 font-weight-medium pt-4 px-4 pb-0">
              % выполнения по привычкам
            </v-card-title>
            <v-card-text>
              <canvas ref="barChartRef" height="120" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-if="streakRows.length">
        <v-col cols="12">
          <v-card rounded="xl">
            <v-card-title class="text-body-1 font-weight-medium pt-4 px-4 pb-2">
              Streak по привычкам
            </v-card-title>
            <v-table density="compact">
              <thead>
                <tr>
                  <th>Привычка</th>
                  <th class="text-center">Текущий</th>
                  <th class="text-center">Лучший</th>
                  <th class="text-center">% за период</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in streakRows" :key="row.habitId">
                  <td>
                    <div class="d-flex align-center gap-2">
                      <span
                        class="rounded-circle d-inline-block"
                        :style="{ width: '10px', height: '10px', background: row.color }"
                      />
                      {{ row.title }}
                    </div>
                  </td>
                  <td class="text-center">
                    <v-chip size="x-small" color="primary" variant="tonal">{{ row.current }} дн.</v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip size="x-small" variant="tonal">{{ row.best }} дн.</v-chip>
                  </td>
                  <td class="text-center">{{ row.completionRate }}%</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- Heatmap аккордеоны -->
      <v-row v-if="habitsWithActions.length" class="mt-2">
        <v-col cols="12">
          <v-card rounded="xl">
            <v-card-title class="text-body-1 font-weight-medium pt-4 px-4 pb-2">
              История выполнений
            </v-card-title>
            <v-expansion-panels v-model="openPanel" variant="accordion">
              <v-expansion-panel
                v-for="(habit, idx) in habitsWithActions"
                :key="habit.id"
                :value="idx"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center gap-2 w-100">
                    <v-icon :icon="habit.icon" :color="habit.color" size="18" />
                    <span class="text-body-2">{{ habit.title }}</span>
                    <v-spacer />
                    <v-chip
                      v-if="streakMap[habit.id] >= 2"
                      size="x-small"
                      color="orange"
                      variant="tonal"
                      prepend-icon="mdi-fire"
                    >{{ streakMap[habit.id] }}</v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <HeatmapCalendar :habit-id="habit.id" :color="habit.color" />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card>
        </v-col>
      </v-row>

      <v-empty-state
        v-if="!loading && overview.length === 0"
        icon="mdi-chart-line"
        title="Нет данных"
        text="Начни выполнять привычки, чтобы видеть статистику"
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { statsApi } from '../api/stats.api';
import { useHabitsStore } from '../stores/habits.store';
import HeatmapCalendar from '../components/stats/HeatmapCalendar.vue';
import type { HabitOverview, DailyStats, StreakStats } from '../types';

Chart.register(...registerables);

const habitsStore = useHabitsStore();
const loading = ref(true);
const period = ref(30);
const openPanel = ref(0);
const streakMap = ref<Record<string, number>>({});

const overview = ref<HabitOverview[]>([]);
const dailyStats = ref<DailyStats[]>([]);
const streakRows = ref<{ habitId: string; title: string; color: string; current: number; best: number; completionRate: number }[]>([]);

const lineChartRef = ref<HTMLCanvasElement | null>(null);
const barChartRef = ref<HTMLCanvasElement | null>(null);
let lineChart: Chart | null = null;
let barChart: Chart | null = null;

const habitsWithActions = computed(() =>
  habitsStore.habits.filter((h) => h.actions && h.actions.length > 0),
);

const avgCompletion = computed(() => {
  if (!overview.value.length) return 0;
  return Math.round(overview.value.reduce((acc, h) => acc + h.completionRate, 0) / overview.value.length);
});

const maxStreak = computed(() =>
  streakRows.value.length ? Math.max(...streakRows.value.map((r) => r.current)) : 0,
);

const perfectDays = computed(() =>
  dailyStats.value.filter((d) => d.completedCount > 0).length,
);

function destroyCharts() {
  lineChart?.destroy();
  lineChart = null;
  barChart?.destroy();
  barChart = null;
}

function buildLineChart() {
  if (!lineChartRef.value || !dailyStats.value.length) return;
  const labels = dailyStats.value.map((d) => {
    const [, m, day] = d.date.split('-');
    return `${day}.${m}`;
  });
  lineChart = new Chart(lineChartRef.value, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Выполнений',
          data: dailyStats.value.map((d) => d.completedCount),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.12)',
          tension: 0.4,
          fill: true,
          pointRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { ticks: { maxTicksLimit: period.value === 7 ? 7 : 15 } },
      },
    },
  });
}

function buildBarChart() {
  if (!barChartRef.value || !overview.value.length) return;
  barChart = new Chart(barChartRef.value, {
    type: 'bar',
    data: {
      labels: overview.value.map((h) => h.title),
      datasets: [
        {
          label: '% выполнения',
          data: overview.value.map((h) => h.completionRate),
          backgroundColor: 'rgba(99,102,241,0.7)',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, max: 100, ticks: { callback: (v) => v + '%' } },
      },
    },
  });
}

async function load() {
  loading.value = true;
  destroyCharts();
  try {
    await habitsStore.fetchAll();
    const habits = habitsStore.habits;

    [overview.value, dailyStats.value] = await Promise.all([
      statsApi.getOverview(period.value),
      statsApi.getDailyStats(period.value),
    ]);

    const streakResults = await Promise.all(
      habits.map((h) => statsApi.getStreak(h.id).then((s: StreakStats) => ({ habitId: h.id, ...s }))),
    );

    streakRows.value = habits.map((h) => {
      const sr = streakResults.find((s) => s.habitId === h.id);
      const ov = overview.value.find((o) => o.habitId === h.id);
      return {
        habitId: h.id,
        title: h.title,
        color: h.color,
        current: sr?.current ?? 0,
        best: sr?.best ?? 0,
        completionRate: ov?.completionRate ?? 0,
      };
    });

    for (const row of streakRows.value) {
      streakMap.value[row.habitId] = row.current;
    }

    await nextTick();
    buildLineChart();
    buildBarChart();
  } finally {
    loading.value = false;
  }
}

onMounted(load);
onUnmounted(destroyCharts);
</script>
