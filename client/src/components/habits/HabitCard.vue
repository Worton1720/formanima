<template>
  <v-card rounded="xl" :style="{ borderLeft: `4px solid ${habit.color}` }">
    <v-card-title class="d-flex align-center">
      <v-icon :icon="habit.icon" :color="habit.color" class="mr-2" />
      {{ habit.title }}
      <v-spacer />
      <v-btn icon="mdi-pencil" variant="text" size="small" @click="$emit('edit', habit)" />
      <v-btn icon="mdi-archive" variant="text" size="small" color="warning" @click="$emit('archive', habit.id)" />
    </v-card-title>
    <v-card-subtitle v-if="habit.description">{{ habit.description }}</v-card-subtitle>
    <v-card-text>
      <v-chip size="small" class="mr-1">{{ categoryLabel }}</v-chip>
      <v-chip size="small">{{ frequencyLabel }}</v-chip>
      <div class="mt-2 text-caption text-medium-emphasis">
        {{ habit.actions?.length ?? 0 }} действий
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" color="primary" :to="`/habits/${habit.id}`">Подробнее</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Habit } from '../../types';

const props = defineProps<{ habit: Habit }>();
defineEmits<{ edit: [habit: Habit]; archive: [id: string] }>();

const categoryMap: Record<string, string> = {
  sport: 'Спорт', health: 'Здоровье', learning: 'Обучение',
  work: 'Работа', finance: 'Финансы', other: 'Другое',
};
const frequencyMap: Record<string, string> = {
  daily: 'Ежедневно', weekdays: 'По будням', custom: 'Кастомная',
};

const categoryLabel = computed(() => categoryMap[props.habit.category] ?? props.habit.category);
const frequencyLabel = computed(() => frequencyMap[props.habit.frequency] ?? props.habit.frequency);
</script>
