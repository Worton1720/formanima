<template>
  <v-list-item
    :class="['px-4 py-3 rounded-xl mb-2', isCompleted ? 'opacity-60' : '']"
    style="border: 1px solid rgba(255,255,255,0.08);"
    @click="handleToggle"
  >
    <template #prepend>
      <div
        :style="{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: isCompleted ? 'none' : `2px solid ${habit.color}`,
          background: isCompleted ? habit.color : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: '0',
          marginRight: '12px',
          transition: 'all 0.2s',
        }"
      >
        <v-icon v-if="isCompleted" icon="mdi-check" size="16" color="white" />
      </div>
    </template>

    <div style="flex: 1; min-width: 0;">
      <div class="d-flex align-center gap-2">
        <v-icon :icon="habit.icon" :color="habit.color" size="18" />
        <span
          class="text-body-2 font-weight-medium"
          :style="isCompleted ? 'text-decoration: line-through; color: rgba(255,255,255,0.4)' : ''"
        >{{ habit.title }}</span>
        <v-chip
          v-if="streak >= 2"
          size="x-small"
          color="orange"
          variant="tonal"
          prepend-icon="mdi-fire"
        >{{ streak }}</v-chip>
      </div>

      <v-progress-linear
        v-if="progressPercent > 0 && !isCompleted"
        :model-value="progressPercent"
        :color="habit.color"
        rounded
        height="3"
        class="mt-1"
        style="max-width: 120px;"
      />
    </div>

    <template #append>
      <v-btn
        icon="mdi-chevron-right"
        variant="text"
        size="small"
        density="compact"
        @click.stop="router.push(`/habits/${habit.id}`)"
      />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTrackingStore } from '../../stores/tracking.store';
import type { Habit } from '../../types';

const props = defineProps<{ habit: Habit; date: string; streak?: number }>();
const tracking = useTrackingStore();
const router = useRouter();

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
