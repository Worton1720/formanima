<template>
  <v-card rounded="xl" elevation="4">
    <v-card-title>{{ habit ? 'Редактировать привычку' : 'Новая привычка' }}</v-card-title>
    <v-card-text>
      <v-form @submit.prevent="submit">
        <v-text-field v-model="form.title" label="Название" :rules="[v => !!v || 'Обязательно']" class="mb-2" />
        <v-textarea v-model="form.description" label="Описание (необязательно)" rows="2" class="mb-2" />

        <v-row dense class="mb-2">
          <v-col cols="12" sm="6">
            <v-select v-model="form.category" :items="categories" label="Категория" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select v-model="form.frequency" :items="frequencies" label="Частота" />
          </v-col>
        </v-row>

        <v-row dense class="mb-4">
          <v-col cols="6">
            <v-text-field v-model="form.color" label="Цвет" type="color" />
          </v-col>
          <v-col cols="6">
            <v-select v-model="form.icon" :items="icons" label="Иконка">
              <template #item="{ item, props: p }">
                <v-list-item v-bind="p">
                  <template #prepend><v-icon :icon="item.value" class="mr-2" /></template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <v-icon :icon="item.value" class="mr-2" />{{ item.title }}
              </template>
            </v-select>
          </v-col>
        </v-row>

        <!-- Секция действий -->
        <v-divider class="mb-3">
          <span class="text-caption text-medium-emphasis px-2">Действия</span>
        </v-divider>

        <draggable v-model="localActions" item-key="title" handle=".drag-handle" ghost-class="opacity-50">
          <template #item="{ element, index }">
            <div class="d-flex align-center gap-2 mb-2">
              <v-icon
                class="drag-handle"
                icon="mdi-drag"
                size="20"
                style="cursor: grab; color: rgba(255,255,255,0.3); flex-shrink: 0;"
              />
              <v-text-field
                v-model="localActions[index].title"
                density="compact"
                hide-details
                variant="outlined"
                class="flex-grow-1"
              />
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                density="compact"
                color="error"
                @click="removeAction(index)"
              />
            </div>
          </template>
        </draggable>

        <!-- Поле добавления -->
        <div class="d-flex align-center gap-2 mb-2">
          <v-text-field
            v-model="newActionTitle"
            density="compact"
            hide-details
            variant="outlined"
            placeholder="Добавить действие..."
            class="flex-grow-1"
            :disabled="localActions.length >= 10"
            @keydown.enter.prevent="addAction"
          />
          <v-btn
            icon="mdi-plus"
            variant="tonal"
            size="small"
            :disabled="!newActionTitle.trim() || localActions.length >= 10"
            @click="addAction"
          />
        </div>

        <div v-if="showActionsError" class="text-caption text-error mb-2">
          Добавь хотя бы одно действие
        </div>

        <div class="d-flex gap-2 justify-end mt-4">
          <v-btn variant="text" @click="$emit('cancel')">Отмена</v-btn>
          <v-btn
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="localActions.length === 0"
          >
            Сохранить
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import type { Habit } from '../../types';

const props = defineProps<{ habit?: Habit }>();
const emit = defineEmits<{
  submit: [data: Partial<Habit>, actions: { id?: string; title: string; order: number }[], removedIds: string[]];
  cancel: [];
}>();

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
const newActionTitle = ref('');
const showActionsError = ref(false);
const removedActionIds = ref<string[]>([]);
const localActions = ref<{ id?: string; title: string; order: number }[]>([]);

const form = ref({
  title: props.habit?.title ?? '',
  description: props.habit?.description ?? '',
  category: props.habit?.category ?? 'other',
  frequency: props.habit?.frequency ?? 'daily',
  color: props.habit?.color ?? '#6366f1',
  icon: props.habit?.icon ?? 'mdi-fire',
});

watch(
  () => props.habit,
  (h) => {
    if (h) {
      form.value = {
        title: h.title,
        description: h.description ?? '',
        category: h.category,
        frequency: h.frequency,
        color: h.color,
        icon: h.icon ?? 'mdi-fire',
      };
      localActions.value = h.actions.map((a) => ({ id: a.id, title: a.title, order: a.order }));
    }
    removedActionIds.value = [];
  },
  { immediate: true },
);

function addAction() {
  const title = newActionTitle.value.trim();
  if (!title || localActions.value.length >= 10) return;
  localActions.value.push({ title, order: localActions.value.length });
  newActionTitle.value = '';
  showActionsError.value = false;
}

function removeAction(index: number) {
  const action = localActions.value[index];
  if (action.id) removedActionIds.value.push(action.id);
  localActions.value.splice(index, 1);
}

async function submit() {
  if (localActions.value.length === 0) {
    showActionsError.value = true;
    return;
  }
  loading.value = true;
  try {
    const orderedActions = localActions.value.map((a, i) => ({ ...a, order: i }));
    emit('submit', { ...form.value }, orderedActions, removedActionIds.value);
  } finally {
    loading.value = false;
  }
}
</script>
