<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Мои цели</h1>
      <div class="flex items-center gap-2">
        <router-link to="/goals/archive" class="text-sm" style="color: rgba(255,255,255,0.4);">
          Архив
        </router-link>
        <UiButton size="sm" @click="showCreateDialog = true">
          <Plus class="w-4 h-4 mr-1" />Добавить цель
        </UiButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <!-- Empty State -->
    <template v-else-if="store.goals.length === 0">
      <div class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color: rgba(255,255,255,0.3);">
        <div class="text-6xl mb-4">🎯</div>
        <p class="font-medium mb-1">Нет активных целей</p>
        <p class="text-sm mb-4">Создай первую цель, чтобы начать отслеживать прогресс</p>
        <UiButton @click="showCreateDialog = true">
          <Plus class="w-4 h-4 mr-1" />Создать цель
        </UiButton>
      </div>
    </template>

    <!-- Goals List -->
    <template v-else>
      <div class="flex flex-col gap-3">
        <div
          v-for="goal in store.goals"
          :key="goal.id"
          class="px-4 py-4 rounded-xl"
          style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);"
        >
          <!-- Goal header -->
          <div class="flex items-start gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              :style="{ background: hexToAlpha(goal.color || '#6366f1', 0.15) }"
            >
              {{ goal.icon || '🎯' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-semibold truncate">{{ goal.title }}</p>
                <span
                  class="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  :style="typeBadgeStyle(goal.type)"
                >{{ typeLabel(goal.type) }}</span>
              </div>
              <p v-if="goal.description" class="text-xs mt-0.5 truncate" style="color: rgba(255,255,255,0.4);">
                {{ goal.description }}
              </p>
            </div>
          </div>

          <!-- Progress bar -->
          <template v-if="goal.targetValue && goal.targetValue > 0">
            <div class="flex justify-between text-xs mb-1" style="color: rgba(255,255,255,0.5);">
              <span>Прогресс</span>
              <span>{{ goal.currentValue }} / {{ goal.targetValue }}</span>
            </div>
            <UiProgress
              :model-value="(goal.currentValue / goal.targetValue) * 100"
              :color="goal.color || '#6366f1'"
              height="sm"
              class="mb-3"
            />
          </template>

          <!-- Deadline -->
          <p v-if="goal.deadline" class="text-xs mb-3" style="color: rgba(255,255,255,0.4);">
            Срок: {{ formatDate(goal.deadline) }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2">
            <router-link :to="`/goals/${goal.id}`" class="flex-1">
              <UiButton variant="tonal" size="sm" class="w-full">
                <Eye class="w-3.5 h-3.5 mr-1" />Открыть
              </UiButton>
            </router-link>
            <UiButton variant="ghost" size="sm" @click="onArchive(goal.id)">
              <Archive class="w-3.5 h-3.5" />
            </UiButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Create Goal Dialog -->
    <UiDialog v-model="showCreateDialog" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Новая цель</h3>
        <div class="flex flex-col gap-4">
          <UiInput
            v-model="form.title"
            label="Название *"
            placeholder="Например, бегать по утрам"
            :error="formErrors.title"
          />
          <UiTextarea
            v-model="form.description"
            label="Описание (необязательно)"
            placeholder="Подробнее о цели..."
          />
          <UiSelect
            v-model="form.type"
            label="Тип цели"
            :options="GOAL_TYPES"
          />
          <UiInput
            v-model="form.category"
            label="Категория (необязательно)"
            placeholder="Здоровье, Обучение..."
          />
          <UiInput
            v-model="form.targetValueStr"
            label="Целевое значение (необязательно)"
            placeholder="100"
            type="number"
          />
          <UiSelect
            v-model="form.frequency"
            label="Частота"
            :options="FREQUENCIES"
          />
          <div>
            <label class="text-sm block mb-1" style="color: rgba(255,255,255,0.5);">Дедлайн (необязательно)</label>
            <input
              v-model="form.deadline"
              type="date"
              class="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style="background: #242424; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.87);"
            />
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="closeCreateDialog">Отмена</UiButton>
          <UiButton :loading="saving" @click="submitCreate">Создать</UiButton>
        </div>
      </div>
    </UiDialog>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Eye, Archive } from 'lucide-vue-next';
import { useGoalsStore } from '../stores/goals.store';
import { useNotify } from '../composables/useNotify';
import { UiButton, UiDialog, UiInput, UiTextarea, UiSelect, UiSpinner, UiProgress } from '../components/ui';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const store = useGoalsStore();
const { notify } = useNotify();

const showCreateDialog = ref(false);
const saving = ref(false);

const GOAL_TYPES = [
  { value: 'habit', label: 'Привычка' },
  { value: 'project', label: 'Проект' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'finance', label: 'Финансы' },
  { value: 'fitness', label: 'Фитнес' },
  { value: 'other', label: 'Другое' },
];

const FREQUENCIES = [
  { value: 'daily', label: 'Ежедневно' },
  { value: 'weekly', label: 'Еженедельно' },
  { value: 'monthly', label: 'Ежемесячно' },
  { value: 'once', label: 'Однократно' },
];

const TYPE_COLORS: Record<string, string> = {
  habit: 'rgba(99,102,241,0.2)',
  project: 'rgba(59,130,246,0.2)',
  nutrition: 'rgba(34,197,94,0.2)',
  finance: 'rgba(234,179,8,0.2)',
  fitness: 'rgba(249,115,22,0.2)',
  other: 'rgba(107,114,128,0.2)',
};

const TYPE_TEXT_COLORS: Record<string, string> = {
  habit: '#818cf8',
  project: '#60a5fa',
  nutrition: '#4ade80',
  finance: '#facc15',
  fitness: '#fb923c',
  other: '#9ca3af',
};

const TYPE_LABELS: Record<string, string> = {
  habit: 'Привычка',
  project: 'Проект',
  nutrition: 'Питание',
  finance: 'Финансы',
  fitness: 'Фитнес',
  other: 'Другое',
};

function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type;
}

function typeBadgeStyle(type: string) {
  return {
    background: TYPE_COLORS[type] ?? 'rgba(107,114,128,0.2)',
    color: TYPE_TEXT_COLORS[type] ?? '#9ca3af',
  };
}

function hexToAlpha(hex: string, alpha: number) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(99,102,241,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatDate(d: string) {
  return dayjs(d).format('D MMM YYYY');
}

const form = ref({
  title: '',
  description: '',
  type: 'habit' as const,
  category: '',
  targetValueStr: '',
  frequency: 'daily',
  deadline: '',
});

const formErrors = ref({ title: '' });

function closeCreateDialog() {
  showCreateDialog.value = false;
  form.value = { title: '', description: '', type: 'habit', category: '', targetValueStr: '', frequency: 'daily', deadline: '' };
  formErrors.value = { title: '' };
}

async function submitCreate() {
  formErrors.value = { title: '' };
  if (!form.value.title.trim()) {
    formErrors.value.title = 'Введите название';
    return;
  }
  saving.value = true;
  try {
    await store.createGoal({
      title: form.value.title.trim(),
      description: form.value.description.trim() || undefined,
      type: form.value.type,
      category: form.value.category.trim() || undefined,
      targetValue: form.value.targetValueStr ? Number(form.value.targetValueStr) : undefined,
      frequency: form.value.frequency || undefined,
      deadline: form.value.deadline || undefined,
    });
    notify('Цель создана', 'success');
    closeCreateDialog();
  } catch {
    notify('Не удалось создать цель');
  } finally {
    saving.value = false;
  }
}

async function onArchive(id: string) {
  try {
    await store.archiveGoal(id);
    notify('Цель перемещена в архив', 'success');
  } catch {
    notify('Не удалось архивировать цель');
  }
}

onMounted(async () => {
  try {
    await store.fetchGoals();
  } catch {
    notify('Не удалось загрузить цели');
  }
});
</script>
