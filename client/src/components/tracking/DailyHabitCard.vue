<template>
  <v-card rounded="xl" :style="{ borderLeft: `4px solid ${habit.color}` }">
    <v-card-title class="d-flex align-center">
      <v-icon :icon="habit.icon" :color="habit.color" class="mr-2" />
      {{ habit.title }}
      <v-spacer />
      <span class="text-body-2 text-medium-emphasis">{{ completedCount }}/{{ habit.actions.length }}</span>
    </v-card-title>
    <v-card-text class="pt-0">
      <v-progress-linear
        :model-value="progressPercent"
        :color="habit.color"
        rounded
        height="4"
        class="mb-3"
      />
      <div v-for="action in habit.actions" :key="action.id" class="d-flex align-center py-1">
        <v-checkbox
          :model-value="status[action.id] ?? false"
          :label="action.title"
          :color="habit.color"
          hide-details
          density="compact"
          @update:model-value="toggle(action.id)"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTrackingStore } from '../../stores/tracking.store';
import type { Habit } from '../../types';

const props = defineProps<{ habit: Habit; date: string }>();
const tracking = useTrackingStore();

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
