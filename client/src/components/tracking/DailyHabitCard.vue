<template>
  <div
    class="rounded-2xl p-4"
    :style="{ background: '#1a1a1a', borderLeft: `4px solid ${habit.color}` }"
  >
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <component :is="habitIcon" class="w-5 h-5" :style="{ color: habit.color }" />
        <span class="font-medium text-sm">{{ habit.title }}</span>
      </div>
      <span class="text-xs" style="color: rgba(255,255,255,0.5);">
        {{ completedCount }}/{{ habit.actions.length }}
      </span>
    </div>

    <div class="rounded-full overflow-hidden mb-3" style="background: rgba(255,255,255,0.1); height: 4px;">
      <div
        :style="{ width: `${progressPercent}%`, height: '100%', backgroundColor: habit.color, borderRadius: '9999px', transition: 'width 0.3s ease' }"
      />
    </div>

    <div v-for="action in habit.actions" :key="action.id" class="flex items-center gap-3 py-1.5">
      <button
        :class="['w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors', status[action.id] ? 'border-0' : 'border border-white/30']"
        :style="status[action.id] ? { background: habit.color } : {}"
        type="button"
        @click="toggle(action.id)"
      >
        <Check v-if="status[action.id]" class="w-3 h-3 text-white" />
      </button>
      <span
        class="text-sm"
        :style="status[action.id] ? 'text-decoration: line-through; color: rgba(255,255,255,0.4);' : 'color: rgba(255,255,255,0.87);'"
      >
        {{ action.title }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Check } from 'lucide-vue-next';
import { useTrackingStore } from '../../stores/tracking.store';
import { getIcon } from '../../utils/iconMap';
import type { Habit } from '../../types';

const props = defineProps<{ habit: Habit; date: string }>();
const tracking = useTrackingStore();

const habitIcon = computed(() => getIcon(props.habit.icon ?? 'mdi-fire'));
const status = computed(() => tracking.getStatus(props.habit.id, props.date));
const completedCount = computed(() => Object.values(status.value).filter(Boolean).length);
const progressPercent = computed(() =>
  props.habit.actions.length
    ? Math.round((completedCount.value / props.habit.actions.length) * 100)
    : 0,
);

function toggle(actionId: string) {
  tracking.toggle(actionId, props.habit.id, props.date, status.value[actionId] ?? false);
}
</script>
