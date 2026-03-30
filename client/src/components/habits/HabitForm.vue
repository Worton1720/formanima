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
        <v-text-field v-model="form.color" label="Цвет" type="color" class="mb-4" />
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

const loading = ref(false);
const form = ref({
  title: props.habit?.title ?? '',
  description: props.habit?.description ?? '',
  category: props.habit?.category ?? 'other',
  frequency: props.habit?.frequency ?? 'daily',
  color: props.habit?.color ?? '#6366f1',
});

watch(() => props.habit, (h) => {
  if (h) {
    form.value = {
      title: h.title,
      description: h.description ?? '',
      category: h.category,
      frequency: h.frequency,
      color: h.color,
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
