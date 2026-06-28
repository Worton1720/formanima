<template>
  <div class="rounded-2xl p-6 shadow-2xl" style="background: #211a12; border: 1px solid rgba(243,234,214,0.10);">
    <h2 class="text-lg font-semibold mb-5">{{ goal ? 'Редактировать привычку' : 'Новая привычка' }}</h2>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <UiInput
        v-model="form.title"
        label="Название"
        placeholder="Бег по утрам"
        :error="titleError"
      />
      <UiTextarea
        v-model="form.description"
        label="Описание (необязательно)"
        :rows="2"
        placeholder="Описание привычки..."
      />

      <div class="grid grid-cols-2 gap-3">
        <UiSelect v-model="form.category" label="Категория" :options="categories" />
        <UiSelect v-model="form.frequency" label="Частота" :options="frequencies" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="text-sm block mb-1" style="color: rgba(168,153,124,0.82);">Цвет</label>
          <input
            v-model="form.color"
            type="color"
            class="w-full h-10 rounded-xl cursor-pointer"
            style="background: #2b2118; border: 1px solid rgba(243,234,214,0.10);"
          />
        </div>
        <div>
          <label class="text-sm block mb-1.5" style="color: rgba(168,153,124,0.82);">Иконка</label>
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="opt in iconOptions"
              :key="opt.value"
              type="button"
              class="flex items-center justify-center p-2.5 rounded-xl transition-colors"
              :style="form.icon === opt.value
                ? 'background: rgba(226,83,43,0.2); border: 1px solid #e2532b;'
                : 'background: #2b2118; border: 1px solid rgba(243,234,214,0.10);'"
              :title="opt.label"
              @click="form.icon = opt.value"
            >
              <component
                :is="getIcon(opt.value)"
                class="w-5 h-5"
                :style="form.icon === opt.value ? 'color: #e2532b;' : 'color: rgba(168,153,124,0.82);'"
              />
            </button>
          </div>
        </div>
      </div>

      <p class="text-xs" style="color: rgba(168,153,124,0.62);">
        Отмечай выполнение каждый день на странице привычки — серия (streak) и история
        соберутся автоматически. Промежуточные шаги можно добавить внутри привычки.
      </p>

      <div class="flex gap-2 justify-end pt-2">
        <UiButton variant="ghost" type="button" @click="$emit('cancel')">Отмена</UiButton>
        <UiButton type="submit" :loading="loading">Сохранить</UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { UiButton, UiInput, UiTextarea, UiSelect } from '../ui';
import { getIcon } from '../../utils/iconMap';
import type { Goal, CreateGoalDto } from '../../types';

const props = defineProps<{ goal?: Goal }>();
const emit = defineEmits<{
  submit: [data: CreateGoalDto];
  cancel: [];
}>();

const categories = [
  { value: 'sport', label: 'Спорт' }, { value: 'health', label: 'Здоровье' },
  { value: 'learning', label: 'Обучение' }, { value: 'work', label: 'Работа' },
  { value: 'finance', label: 'Финансы' }, { value: 'other', label: 'Другое' },
];
const frequencies = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'monthly', label: 'Ежемесячно' },
];
const iconOptions = [
  { value: 'mdi-fire', label: 'Огонь' }, { value: 'mdi-heart', label: 'Сердце' },
  { value: 'mdi-star', label: 'Звезда' }, { value: 'mdi-dumbbell', label: 'Гантеля' },
  { value: 'mdi-book-open-variant', label: 'Книга' }, { value: 'mdi-run', label: 'Бег' },
  { value: 'mdi-food-apple', label: 'Еда' }, { value: 'mdi-cup-water', label: 'Вода' },
  { value: 'mdi-meditation', label: 'Медитация' }, { value: 'mdi-bike', label: 'Велосипед' },
  { value: 'mdi-music', label: 'Музыка' }, { value: 'mdi-code-braces', label: 'Код' },
  { value: 'mdi-cash', label: 'Деньги' }, { value: 'mdi-sleep', label: 'Сон' },
  { value: 'mdi-brush', label: 'Кисть' },
];

const loading = ref(false);
const titleError = ref('');

const form = ref({
  title: props.goal?.title ?? '',
  description: props.goal?.description ?? '',
  category: props.goal?.category ?? 'other',
  frequency: props.goal?.frequency ?? 'daily',
  color: props.goal?.color ?? '#e2532b',
  icon: props.goal?.icon ?? 'mdi-fire',
});

watch(
  () => props.goal,
  (g) => {
    if (g) {
      form.value = {
        title: g.title,
        description: g.description ?? '',
        category: g.category,
        frequency: ['daily', 'weekly', 'monthly'].includes(g.frequency) ? g.frequency : 'daily',
        color: g.color,
        icon: g.icon ?? 'mdi-fire',
      };
    }
  },
  { immediate: true },
);

function submit() {
  titleError.value = '';
  if (!form.value.title.trim()) { titleError.value = 'Введите название'; return; }
  loading.value = true;
  try {
    emit('submit', {
      title: form.value.title.trim(),
      description: form.value.description.trim() || undefined,
      type: 'habit',
      category: form.value.category,
      frequency: form.value.frequency,
      color: form.value.color,
      icon: form.value.icon,
    });
  } finally {
    loading.value = false;
  }
}
</script>
