<template>
  <div
    class="rounded-2xl p-4"
    :style="{ background: '#211a12', border: `1px solid rgba(243,234,214,0.10)`, borderLeftWidth: '4px', borderLeftColor: habit.color || '#e2532b' }"
  >
    <div class="flex items-start justify-between mb-2">
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <component :is="habitIcon" class="w-5 h-5 flex-shrink-0" :style="{ color: habit.color || '#e2532b' }" />
        <h3 class="font-medium text-sm truncate">{{ habit.title }}</h3>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <UiButton variant="ghost" size="sm" @click="$emit('edit', habit)">
          <Pencil class="w-4 h-4" />
        </UiButton>
        <UiButton variant="ghost" size="sm" @click="$emit('archive', habit.id)">
          <Archive class="w-4 h-4" style="color: #e0aa4e;" />
        </UiButton>
      </div>
    </div>

    <p v-if="habit.description" class="text-xs mb-3 truncate" style="color: rgba(168,153,124,0.82);">
      {{ habit.description }}
    </p>

    <div class="flex items-center gap-2 mb-3 flex-wrap">
      <span class="px-2 py-0.5 rounded-full text-xs" style="background: rgba(243,234,214,0.10); color: rgba(168,153,124,0.92);">
        {{ categoryLabel }}
      </span>
      <span class="px-2 py-0.5 rounded-full text-xs" style="background: rgba(243,234,214,0.10); color: rgba(168,153,124,0.92);">
        {{ frequencyLabel }}
      </span>
    </div>

    <div class="flex items-center gap-2">
      <UiButton
        size="sm"
        class="flex-1"
        :variant="markedToday ? 'ghost' : 'primary'"
        :loading="marking"
        @click="$emit('toggle', habit.id)"
      >
        <CheckCircle v-if="markedToday" class="w-4 h-4 mr-1" style="color: #86a861;" />
        <Plus v-else class="w-4 h-4 mr-1" />
        {{ markedToday ? 'Выполнено сегодня' : 'Отметить' }}
      </UiButton>
      <router-link
        :to="`/goals/${habit.id}`"
        class="text-xs font-medium whitespace-nowrap"
        style="color: #e2532b;"
      >
        Подробнее →
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Pencil, Archive, CheckCircle, Plus } from 'lucide-vue-next';
import { getIcon } from '../../utils/iconMap';
import { UiButton } from '../ui';
import type { Goal } from '../../types';

const props = defineProps<{ habit: Goal; markedToday?: boolean; marking?: boolean }>();
defineEmits<{ edit: [habit: Goal]; archive: [id: string]; toggle: [id: string] }>();

const habitIcon = computed(() => getIcon(props.habit.icon ?? 'mdi-fire'));

const categoryMap: Record<string, string> = {
  sport: 'Спорт', health: 'Здоровье', learning: 'Обучение',
  work: 'Работа', finance: 'Финансы', other: 'Другое',
};
const frequencyMap: Record<string, string> = {
  daily: 'Ежедневно', weekly: 'Еженедельно', monthly: 'Ежемесячно',
};

const categoryLabel = computed(() => categoryMap[props.habit.category] ?? props.habit.category);
const frequencyLabel = computed(() => frequencyMap[props.habit.frequency] ?? props.habit.frequency);
</script>
