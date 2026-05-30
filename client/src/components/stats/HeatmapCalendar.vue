<template>
  <div>
    <div v-if="loading" class="flex justify-center py-4">
      <UiSpinner size="sm" />
    </div>
    <div v-else class="overflow-x-auto">
      <div class="heatmap-grid" style="width: max-content;">
        <div
          v-for="entry in entries"
          :key="entry.date"
          class="heatmap-cell"
          :style="{ background: entry.completed ? color : 'rgba(128,128,128,0.18)' }"
          :title="entry.date + (entry.completed ? ' — выполнено' : ' — не выполнено')"
        />
      </div>
      <div class="flex items-center gap-1 mt-2">
        <span class="text-[11px]" style="color: rgba(255,255,255,0.4);">Меньше</span>
        <div class="heatmap-cell" style="background: rgba(128,128,128,0.18);" />
        <div class="heatmap-cell" :style="{ background: color, opacity: '0.4' }" />
        <div class="heatmap-cell" :style="{ background: color }" />
        <span class="text-[11px]" style="color: rgba(255,255,255,0.4);">Больше</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { statsApi } from '../../api/stats.api';
import { UiSpinner } from '../ui';
import type { HeatmapEntry } from '../../types';

const props = defineProps<{ habitId: string; color?: string }>();
const loading = ref(true);
const entries = ref<HeatmapEntry[]>([]);
const color = props.color ?? '#6366f1';

onMounted(async () => {
  try {
    entries.value = await statsApi.getHeatmap(props.habitId, 90);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  grid-auto-flow: column;
  gap: 3px;
}
.heatmap-cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}
</style>
