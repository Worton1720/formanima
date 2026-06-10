<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Аналитика</h1>
      <div class="flex rounded-xl overflow-hidden border" style="border-color: rgba(243,234,214,0.12);">
        <button
          v-for="p in [7, 30]"
          :key="p"
          class="px-3 py-1.5 text-sm transition-colors"
          :style="period === p
            ? 'background: #e2532b; color: #fff;'
            : 'background: transparent; color: rgba(168,153,124,0.82);'"
          @click="period = p; load()"
        >{{ p }} дней</button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="!overview.length" class="flex-1 flex flex-col items-center justify-center text-center py-8" style="color: rgba(243,234,214,0.3);">
        <BarChart3 class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
        <p class="text-lg font-medium mb-1">Нет данных</p>
        <p class="text-sm">Начни выполнять привычки, чтобы видеть статистику</p>
      </div>

      <template v-else>
        <!-- KPI карточки -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="rounded-xl p-3 text-center" style="background: rgba(226,83,43,0.1); border: 1px solid rgba(226,83,43,0.2);">
            <p class="text-2xl font-bold" style="color: #e2532b;">{{ avgCompletion }}%</p>
            <p class="text-xs mt-1" style="color: rgba(168,153,124,0.82);">выполнений</p>
          </div>
          <div class="rounded-xl p-3 text-center" style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);">
            <p class="text-2xl font-bold" style="color: #e0aa4e;">{{ maxStreak }}</p>
            <p class="text-xs mt-1" style="color: rgba(168,153,124,0.82);">streak {{ plural(maxStreak, 'день', 'дня', 'дней') }} 🔥</p>
          </div>
          <div class="rounded-xl p-3 text-center" style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);">
            <p class="text-2xl font-bold" style="color: #86a861;">{{ perfectDays }}</p>
            <p class="text-xs mt-1" style="color: rgba(168,153,124,0.82);">идеал. дней</p>
          </div>
        </div>

        <!-- Line chart -->
        <div class="rounded-2xl p-4 mb-4" style="background: #211a12; border: 1px solid rgba(243,234,214,0.10);">
          <p class="text-sm font-medium mb-3">Выполнения по дням</p>
          <canvas ref="lineChartRef" height="120" />
        </div>

        <!-- Bar chart -->
        <div v-if="overview.length" class="rounded-2xl p-4 mb-4" style="background: #211a12; border: 1px solid rgba(243,234,214,0.10);">
          <p class="text-sm font-medium mb-3">% выполнения по привычкам</p>
          <canvas ref="barChartRef" height="120" />
        </div>

        <!-- Streak table -->
        <div v-if="streakRows.length" class="rounded-2xl mb-4 overflow-hidden" style="background: #211a12; border: 1px solid rgba(243,234,214,0.10);">
          <p class="text-sm font-medium px-4 pt-4 pb-2">Streak по привычкам</p>
          <table class="w-full text-sm">
            <thead>
              <tr style="border-bottom: 1px solid rgba(243,234,214,0.10);">
                <th class="px-4 py-2 text-left text-xs font-medium" style="color: rgba(168,153,124,0.62);">Привычка</th>
                <th class="px-4 py-2 text-center text-xs font-medium" style="color: rgba(168,153,124,0.62);">Текущий</th>
                <th class="px-4 py-2 text-center text-xs font-medium" style="color: rgba(168,153,124,0.62);">Лучший</th>
                <th class="px-4 py-2 text-center text-xs font-medium" style="color: rgba(168,153,124,0.62);">% за период</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in streakRows"
                :key="row.habitId"
                style="border-bottom: 1px solid rgba(243,234,214,0.05);"
              >
                <td class="px-4 py-2">
                  <div class="flex items-center gap-2">
                    <span class="rounded-full flex-shrink-0" :style="{ width: '8px', height: '8px', background: row.color }" />
                    <span>{{ row.title }}</span>
                  </div>
                </td>
                <td class="px-4 py-2 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs" style="background: rgba(226,83,43,0.15); color: #e2532b;">
                    {{ pluralDays(row.current) }}
                  </span>
                </td>
                <td class="px-4 py-2 text-center">
                  <span class="px-2 py-0.5 rounded-full text-xs" style="background: rgba(243,234,214,0.10); color: rgba(168,153,124,0.92);">
                    {{ pluralDays(row.best) }}
                  </span>
                </td>
                <td class="px-4 py-2 text-center" style="color: rgba(168,153,124,0.95);">{{ row.completionRate }}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Heatmap аккордеоны -->
        <div v-if="habitsWithActions.length" class="rounded-2xl overflow-hidden" style="background: #211a12; border: 1px solid rgba(243,234,214,0.10);">
          <p class="text-sm font-medium px-4 pt-4 pb-2">История выполнений</p>
          <UiDisclosure
            v-for="(habit, idx) in habitsWithActions"
            :key="habit.id"
            :default-open="idx === 0"
          >
            <template #button>
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <component :is="getIcon(habit.icon)" class="w-4 h-4 flex-shrink-0" :style="{ color: habit.color }" />
                <span class="text-sm truncate">{{ habit.title }}</span>
                <span
                  v-if="streakMap[habit.id] >= 2"
                  class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs flex-shrink-0"
                  style="background: rgba(226,83,43,0.15); color: #fb923c;"
                >
                  <Flame class="w-3 h-3" />{{ streakMap[habit.id] }}
                </span>
              </div>
            </template>
            <template #panel>
              <HeatmapCalendar :habit-id="habit.id" :color="habit.color" />
            </template>
          </UiDisclosure>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { Flame, BarChart3 } from 'lucide-vue-next';
import { statsApi } from '../api/stats.api';
import { useGoalsStore } from '../stores/goals.store';
import { getIcon } from '../utils/iconMap';
import { plural, pluralDays } from '../utils/plural';
import { UiSpinner, UiDisclosure } from '../components/ui';
import HeatmapCalendar from '../components/stats/HeatmapCalendar.vue';
import type { HabitOverview, DailyStats, StreakStats } from '../types';

Chart.register(...registerables);

const goalsStore = useGoalsStore();
const loading = ref(true);
const period = ref(30);
const streakMap = ref<Record<string, number>>({});

const overview = ref<HabitOverview[]>([]);
const dailyStats = ref<DailyStats[]>([]);
const streakRows = ref<{ habitId: string; title: string; color: string; current: number; best: number; completionRate: number }[]>([]);

const lineChartRef = ref<HTMLCanvasElement | null>(null);
const barChartRef = ref<HTMLCanvasElement | null>(null);
let lineChart: Chart | null = null;
let barChart: Chart | null = null;

// Привычки = цели типа 'habit'.
const habitsWithActions = computed(() => goalsStore.habitGoals);

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
          borderColor: '#e2532b',
          backgroundColor: 'rgba(226,83,43,0.12)',
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
          backgroundColor: 'rgba(226,83,43,0.7)',
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
    await goalsStore.fetchGoals();
    const habits = goalsStore.habitGoals;

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
  } catch {
    loading.value = false;
    return;
  }

  loading.value = false;
  await nextTick();
  buildLineChart();
  buildBarChart();
}

onMounted(load);
onUnmounted(destroyCharts);
</script>
