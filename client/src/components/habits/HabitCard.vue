<template>
  <div
    class="rounded-2xl p-4"
    :style="{ background: '#1a1a1a', borderLeft: `4px solid ${habit.color}`, border: `1px solid rgba(255,255,255,0.08)`, borderLeftWidth: '4px', borderLeftColor: habit.color }"
  >
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <component :is="habitIcon" class="w-5 h-5 flex-shrink-0" :style="{ color: habit.color }" />
        <h3 class="font-medium text-sm truncate">{{ habit.title }}</h3>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <UiButton variant="ghost" size="sm" @click="$emit('edit', habit)">
          <Pencil class="w-4 h-4" />
        </UiButton>
        <UiButton variant="ghost" size="sm" @click="$emit('archive', habit.id)">
          <Archive class="w-4 h-4" style="color: #f59e0b;" />
        </UiButton>
      </div>
    </div>

    <p v-if="habit.description" class="text-xs mb-3 truncate" style="color: rgba(255,255,255,0.5);">
      {{ habit.description }}
    </p>

    <div class="flex items-center gap-2 mb-3">
      <span class="px-2 py-0.5 rounded-full text-xs" style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6);">
        {{ categoryLabel }}
      </span>
      <span class="px-2 py-0.5 rounded-full text-xs" style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6);">
        {{ frequencyLabel }}
      </span>
      <span class="text-xs" style="color: rgba(255,255,255,0.4);">{{ habit.actions?.length ?? 0 }} действий</span>
    </div>

    <router-link
      :to="`/habits/${habit.id}`"
      class="text-xs font-medium"
      style="color: #6366f1;"
    >
      Подробнее →
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pencil, Archive } from 'lucide-vue-next';
import { getIcon } from '../../utils/iconMap';
import { UiButton } from '../ui';
import type { Habit } from '../../types';

const props = defineProps<{ habit: Habit }>();
defineEmits<{ edit: [habit: Habit]; archive: [id: string] }>();

const habitIcon = computed(() => getIcon(props.habit.icon ?? 'mdi-fire'));

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
