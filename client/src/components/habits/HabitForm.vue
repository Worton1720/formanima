<template>
  <v-card rounded="xl" elevation="4">
    <v-card-title>{{ habit ? 'Редактировать привычку' : 'Новая привычка' }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field
          v-model="form.title"
          label="Название"
          :rules="[v => !!v || 'Обязательно']"
          class="mb-2"
        />
        <v-textarea v-model="form.description" label="Описание (необязательно)" rows="2" class="mb-2" />
        <v-select
          v-model="form.category"
          :items="categories"
          label="Категория"
          class="mb-2"
        />
        <v-select
          v-model="form.frequency"
          :items="frequencies"
          label="Частота"
          class="mb-2"
        />
        <v-text-field v-model="form.color" label="Цвет" type="color" class="mb-2" />
        <v-select
          v-model="form.icon"
          :items="icons"
          label="Иконка"
          class="mb-4"
        >
          <template #item="{ item, props: itemProps }">
            <v-list-item v-bind="itemProps">
              <template #prepend>
                <v-icon :icon="item.value" class="mr-2" />
              </template>
            </v-list-item>
          </template>
          <template #selection="{ item }">
            <v-icon :icon="item.value" class="mr-2" />
            {{ item.title }}
          </template>
        </v-select>
        <div class="d-flex gap-2 justify-end">
          <v-btn variant="text" @click="$emit('cancel')">Отмена</v-btn>
          <v-btn type="submit" color="primary" :loading="loading">Сохранить</v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Habit } from '../../types';

const props = defineProps<{ habit?: Habit }>();
const emit = defineEmits<{ submit: [data: Partial<Habit>]; cancel: [] }>();

const categories = [
  { title: 'Спорт', value: 'sport' },
  { title: 'Здоровье', value: 'health' },
  { title: 'Обучение', value: 'learning' },
  { title: 'Работа', value: 'work' },
  { title: 'Финансы', value: 'finance' },
  { title: 'Другое', value: 'other' },
];
const frequencies = [
  { title: 'Ежедневно', value: 'daily' },
  { title: 'По будням', value: 'weekdays' },
  { title: 'Кастомная', value: 'custom' },
];
const icons = [
  { title: 'Огонь', value: 'mdi-fire' },
  { title: 'Сердце', value: 'mdi-heart' },
  { title: 'Звезда', value: 'mdi-star' },
  { title: 'Гантеля', value: 'mdi-dumbbell' },
  { title: 'Книга', value: 'mdi-book-open-variant' },
  { title: 'Бег', value: 'mdi-run' },
  { title: 'Еда', value: 'mdi-food-apple' },
  { title: 'Вода', value: 'mdi-cup-water' },
  { title: 'Медитация', value: 'mdi-meditation' },
  { title: 'Велосипед', value: 'mdi-bike' },
  { title: 'Музыка', value: 'mdi-music' },
  { title: 'Код', value: 'mdi-code-braces' },
  { title: 'Деньги', value: 'mdi-cash' },
  { title: 'Сон', value: 'mdi-sleep' },
  { title: 'Кисть', value: 'mdi-brush' },
];

const loading = ref(false);
const form = ref({
  title: props.habit?.title ?? '',
  description: props.habit?.description ?? '',
  category: props.habit?.category ?? 'other',
  frequency: props.habit?.frequency ?? 'daily',
  color: props.habit?.color ?? '#6366f1',
  icon: props.habit?.icon ?? 'mdi-fire',
});

watch(() => props.habit, (h) => {
  if (h) {
    form.value = {
      title: h.title,
      description: h.description ?? '',
      category: h.category,
      frequency: h.frequency,
      color: h.color,
      icon: h.icon ?? 'mdi-fire',
    };
  }
});

async function submit() {
  loading.value = true;
  try {
    emit('submit', { ...form.value });
  } finally {
    loading.value = false;
  }
}
</script>
