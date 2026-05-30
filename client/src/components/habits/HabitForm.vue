<template>
  <div class="rounded-2xl p-6 shadow-2xl" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
    <h2 class="text-lg font-semibold mb-5">{{ habit ? 'Редактировать привычку' : 'Новая привычка' }}</h2>

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

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="text-sm block mb-1" style="color: rgba(255,255,255,0.5);">Цвет</label>
          <input
            v-model="form.color"
            type="color"
            class="w-full h-10 rounded-xl cursor-pointer"
            style="background: #242424; border: 1px solid rgba(255,255,255,0.08);"
          />
        </div>
        <div>
          <label class="text-sm block mb-1.5" style="color: rgba(255,255,255,0.5);">Иконка</label>
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="opt in iconOptions"
              :key="opt.value"
              type="button"
              class="flex items-center justify-center p-2.5 rounded-xl transition-colors"
              :style="form.icon === opt.value
                ? 'background: rgba(99,102,241,0.2); border: 1px solid #6366f1;'
                : 'background: #242424; border: 1px solid rgba(255,255,255,0.08);'"
              :title="opt.label"
              @click="form.icon = opt.value"
            >
              <component
                :is="getIcon(opt.value)"
                class="w-5 h-5"
                :style="form.icon === opt.value ? 'color: #6366f1;' : 'color: rgba(255,255,255,0.5);'"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Actions section -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="h-px flex-1" style="background: rgba(255,255,255,0.08);" />
          <span class="text-xs px-2" style="color: rgba(255,255,255,0.4);">Действия</span>
          <div class="h-px flex-1" style="background: rgba(255,255,255,0.08);" />
        </div>

        <draggable v-model="localActions" item-key="title" handle=".drag-handle" ghost-class="opacity-40">
          <template #item="{ index }">
            <div class="flex items-center gap-2 mb-2">
              <GripVertical
                class="drag-handle w-4 h-4 flex-shrink-0 cursor-grab"
                style="color: rgba(255,255,255,0.3);"
              />
              <input
                v-model="localActions[index].title"
                class="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                style="background: #242424; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.87);"
              />
              <UiButton variant="ghost" size="sm" type="button" @click="removeAction(index)">
                <X class="w-4 h-4" style="color: #ef4444;" />
              </UiButton>
            </div>
          </template>
        </draggable>

        <div class="flex gap-2">
          <input
            v-model="newActionTitle"
            placeholder="Добавить действие..."
            class="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
            style="background: #242424; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.87);"
            :disabled="localActions.length >= 10"
            @keydown.enter.prevent="addAction"
          />
          <UiButton
            variant="tonal"
            size="sm"
            type="button"
            :disabled="!newActionTitle.trim() || localActions.length >= 10"
            @click="addAction"
          >
            <Plus class="w-4 h-4" />
          </UiButton>
        </div>
        <p v-if="showActionsError" class="text-xs mt-1" style="color: #ef4444;">
          Добавь хотя бы одно действие
        </p>
      </div>

      <div class="flex gap-2 justify-end pt-2">
        <UiButton variant="ghost" type="button" @click="$emit('cancel')">Отмена</UiButton>
        <UiButton type="submit" :loading="loading" :disabled="localActions.length === 0">
          Сохранить
        </UiButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import draggable from 'vuedraggable';
import { GripVertical, X, Plus } from 'lucide-vue-next';
import { UiButton, UiInput, UiTextarea, UiSelect } from '../ui';
import { getIcon } from '../../utils/iconMap';
import type { Habit } from '../../types';

const props = defineProps<{ habit?: Habit }>();
const emit = defineEmits<{
  submit: [data: Partial<Habit>, actions: { id?: string; title: string; order: number }[], removedIds: string[]];
  cancel: [];
}>();

const categories = [
  { value: 'sport', label: 'Спорт' }, { value: 'health', label: 'Здоровье' },
  { value: 'learning', label: 'Обучение' }, { value: 'work', label: 'Работа' },
  { value: 'finance', label: 'Финансы' }, { value: 'other', label: 'Другое' },
];
const frequencies = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekdays', label: 'По будням' },
  { value: 'custom', label: 'Кастомная' },
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
  titleError.value = '';
  if (!form.value.title.trim()) { titleError.value = 'Введите название'; return; }
  if (localActions.value.length === 0) { showActionsError.value = true; return; }
  loading.value = true;
  try {
    const orderedActions = localActions.value.map((a, i) => ({ ...a, order: i }));
    emit('submit', { ...form.value }, orderedActions, removedActionIds.value);
  } finally {
    loading.value = false;
  }
}
</script>
