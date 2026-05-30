<template>
  <div
    class="flex items-center gap-3 px-4 py-3 rounded-xl mb-2 cursor-pointer transition-colors"
    :class="isCompleted ? 'opacity-60' : ''"
    style="border: 1px solid rgba(255,255,255,0.08);"
    @click="handleToggle"
  >
    <!-- Circular indicator -->
    <div
      class="flex-shrink-0 flex items-center justify-center"
      :style="{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: isCompleted ? 'none' : `2px solid ${habit.color}`,
        background: isCompleted ? habit.color : 'transparent',
        transition: 'all 0.2s',
      }"
    >
      <Check v-if="isCompleted" class="w-4 h-4 text-white" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <component :is="habitIcon" class="w-4 h-4 flex-shrink-0" :style="{ color: habit.color }" />
        <span
          class="text-sm font-medium truncate"
          :style="isCompleted ? 'text-decoration: line-through; color: rgba(255,255,255,0.4);' : 'color: rgba(255,255,255,0.87);'"
        >{{ habit.title }}</span>
        <div
          v-if="streak >= 2"
          class="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0"
          style="background: rgba(249,115,22,0.15);"
        >
          <Flame class="w-3 h-3 text-orange-400" />
          <span class="text-[10px] font-medium text-orange-400">{{ streak }}</span>
        </div>
      </div>

      <div v-if="progressPercent > 0 && !isCompleted" class="mt-1 max-w-[120px] rounded-full overflow-hidden" style="background: rgba(255,255,255,0.1); height: 3px;">
        <div :style="{ width: `${progressPercent}%`, height: '100%', backgroundColor: habit.color, borderRadius: '9999px' }" />
      </div>
    </div>

    <button
      class="p-1 flex-shrink-0 transition-colors rounded"
      style="color: rgba(255,255,255,0.3);"
      @click.stop="router.push(`/habits/${habit.id}`)"
    >
      <ChevronRight class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Flame, ChevronRight } from 'lucide-vue-next';
import { useTrackingStore } from '../../stores/tracking.store';
import { getIcon } from '../../utils/iconMap';
import type { Habit } from '../../types';

const props = defineProps<{ habit: Habit; date: string; streak?: number }>();
const tracking = useTrackingStore();
const router = useRouter();

const habitIcon = computed(() => getIcon(props.habit.icon ?? 'mdi-fire'));
const status = computed(() => tracking.getStatus(props.habit.id, props.date));
const completedCount = computed(() => Object.values(status.value).filter(Boolean).length);
const progressPercent = computed(() =>
  props.habit.actions.length
    ? Math.round((completedCount.value / props.habit.actions.length) * 100)
    : 0,
);
const isCompleted = computed(() =>
  props.habit.actions.length > 0 && props.habit.actions.every((a) => status.value[a.id] ?? false),
);
const streak = computed(() => props.streak ?? 0);

function handleToggle() {
  tracking.toggleHabit(props.habit, props.date);
}
</script>
