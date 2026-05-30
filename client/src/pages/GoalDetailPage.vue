<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)]">

    <!-- Loading -->
    <div v-if="store.loading && !store.currentGoal" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <template v-else-if="store.currentGoal">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-6">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          :style="{ background: hexToAlpha(store.currentGoal.color || '#6366f1', 0.2) }"
        >
          {{ store.currentGoal.icon || '🎯' }}
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold">{{ store.currentGoal.title }}</h1>
          <p v-if="store.currentGoal.description" class="text-sm mt-0.5" style="color: rgba(255,255,255,0.5);">
            {{ store.currentGoal.description }}
          </p>
        </div>
        <div class="flex items-center gap-1 flex-shrink-0">
          <button class="p-2 rounded-lg" style="color: rgba(255,255,255,0.4);" @click="showEditDialog = true">
            <Pencil class="w-4 h-4" />
          </button>
          <button class="p-2 rounded-lg" style="color: rgba(255,255,255,0.3);" @click="confirmDelete">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Progress -->
      <template v-if="store.currentGoal.targetValue && store.currentGoal.targetValue > 0">
        <div class="px-4 py-4 rounded-xl mb-4" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
          <div class="flex justify-between text-sm mb-2">
            <span style="color: rgba(255,255,255,0.7);">Прогресс</span>
            <span class="font-semibold" :style="{ color: store.currentGoal.color || '#6366f1' }">
              {{ progressPercent }}%
            </span>
          </div>
          <UiProgress
            :model-value="progressPercent"
            :color="store.currentGoal.color || '#6366f1'"
            height="md"
            class="mb-2"
          />
          <div class="flex justify-between text-xs" style="color: rgba(255,255,255,0.4);">
            <span>{{ store.currentGoal.currentValue }}</span>
            <span>{{ store.currentGoal.targetValue }}</span>
          </div>
        </div>
      </template>

      <!-- Mark progress today button -->
      <UiButton
        class="w-full mb-4"
        :variant="markedToday ? 'ghost' : 'default'"
        :loading="markingProgress"
        @click="toggleTodayMark"
      >
        <CheckCircle v-if="markedToday" class="w-4 h-4 mr-1" />
        <Plus v-else class="w-4 h-4 mr-1" />
        {{ markedToday ? 'Прогресс отмечен сегодня' : 'Отметить прогресс сегодня' }}
      </UiButton>

      <!-- Milestones -->
      <div class="px-4 py-4 rounded-xl mb-4" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold">Шаги к цели</h2>
          <UiButton variant="ghost" size="sm" @click="showMilestoneDialog = true">
            <Plus class="w-3.5 h-3.5 mr-1" />Добавить
          </UiButton>
        </div>

        <div v-if="!milestones.length" class="text-center py-4" style="color: rgba(255,255,255,0.3);">
          <p class="text-sm">Нет шагов. Добавь промежуточные цели.</p>
        </div>

        <div v-for="ms in milestones" :key="ms.id" class="flex items-center gap-3 py-2.5 border-b" style="border-color: rgba(255,255,255,0.06);">
          <button
            class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border"
            :style="ms.isDone ? 'background: #6366f1; border-color: #6366f1;' : 'background: transparent; border-color: rgba(255,255,255,0.2);'"
            @click="toggleMilestone(ms)"
          >
            <Check v-if="ms.isDone" class="w-3 h-3 text-white" />
          </button>
          <span class="flex-1 text-sm" :style="ms.isDone ? 'text-decoration: line-through; color: rgba(255,255,255,0.4);' : ''">
            {{ ms.title }}
          </span>
          <button class="p-1" style="color: rgba(255,255,255,0.25);" @click="deleteMilestone(ms.id)">
            <Trash2 class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Progress History (last 7 days) -->
      <div class="px-4 py-4 rounded-xl" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
        <h2 class="text-sm font-semibold mb-3">История прогресса (7 дней)</h2>
        <div class="flex gap-2">
          <div
            v-for="day in last7Days"
            :key="day.date"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <div
              class="w-full h-8 rounded-lg flex items-center justify-center"
              :style="day.done
                ? `background: ${store.currentGoal.color || '#6366f1'}33; border: 1px solid ${store.currentGoal.color || '#6366f1'}66;`
                : 'background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);'"
            >
              <CheckCircle v-if="day.done" class="w-4 h-4" :style="{ color: store.currentGoal.color || '#6366f1' }" />
            </div>
            <p class="text-xs" style="color: rgba(255,255,255,0.3);">{{ day.label }}</p>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="text-center py-12" style="color: rgba(255,255,255,0.4);">
        <p>Цель не найдена</p>
        <router-link to="/goals" class="text-sm mt-2 block" style="color: #6366f1;">← Вернуться к целям</router-link>
      </div>
    </template>

    <!-- Edit Dialog -->
    <UiDialog v-model="showEditDialog" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Редактировать цель</h3>
        <div class="flex flex-col gap-4">
          <UiInput v-model="editForm.title" label="Название" :error="editErrors.title" />
          <UiTextarea v-model="editForm.description" label="Описание" />
          <UiSelect v-model="editForm.type" label="Тип" :options="GOAL_TYPES" />
          <UiInput v-model="editForm.targetValueStr" label="Целевое значение" type="number" />
          <div>
            <label class="text-sm block mb-1" style="color: rgba(255,255,255,0.5);">Дедлайн</label>
            <input
              v-model="editForm.deadline"
              type="date"
              class="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style="background: #242424; border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.87);"
            />
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showEditDialog = false">Отмена</UiButton>
          <UiButton :loading="savingEdit" @click="submitEdit">Сохранить</UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Add Milestone Dialog -->
    <UiDialog v-model="showMilestoneDialog" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Добавить шаг</h3>
        <div class="flex flex-col gap-4">
          <UiInput v-model="milestoneForm.title" label="Название *" :error="milestoneErrors.title" />
          <UiTextarea v-model="milestoneForm.description" label="Описание (необязательно)" />
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showMilestoneDialog = false">Отмена</UiButton>
          <UiButton :loading="savingMilestone" @click="submitMilestone">Добавить</UiButton>
        </div>
      </div>
    </UiDialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Plus, Pencil, Trash2, Check, CheckCircle } from 'lucide-vue-next';
import { useGoalsStore } from '../stores/goals.store';
import { goalsApi } from '../api/goals.api';
import { useNotify } from '../composables/useNotify';
import { UiButton, UiDialog, UiInput, UiTextarea, UiSelect, UiSpinner, UiProgress } from '../components/ui';
import type { Milestone } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const route = useRoute();
const router = useRouter();
const store = useGoalsStore();
const { notify } = useNotify();

const goalId = computed(() => route.params.id as string);
const milestones = ref<Milestone[]>([]);
const progressDates = ref<string[]>([]);
const markingProgress = ref(false);
const today = dayjs().format('YYYY-MM-DD');

const markedToday = computed(() =>
  progressDates.value.includes(today),
);

const progressPercent = computed(() => {
  const goal = store.currentGoal;
  if (!goal?.targetValue) return 0;
  return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
});

const last7Days = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = dayjs().subtract(6 - i, 'day').format('YYYY-MM-DD');
    return {
      date,
      label: dayjs(date).format('dd')[0],
      done: progressDates.value.includes(date),
    };
  });
});

function hexToAlpha(hex: string, alpha: number) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(99,102,241,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

async function loadProgress() {
  try {
    const startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    const endDate = today;
    const data = await goalsApi.getProgress(goalId.value, { startDate, endDate });
    progressDates.value = data.map((p) => p.date.slice(0, 10));
  } catch {
    // ignore
  }
}

async function loadMilestones() {
  try {
    milestones.value = await goalsApi.getMilestones(goalId.value);
  } catch {
    // ignore
  }
}

async function toggleTodayMark() {
  markingProgress.value = true;
  try {
    if (markedToday.value) {
      await goalsApi.removeProgress(goalId.value, { date: today });
      progressDates.value = progressDates.value.filter((d) => d !== today);
      notify('Прогресс отменён', 'info');
    } else {
      await goalsApi.addProgress(goalId.value, { date: today, value: 1 });
      progressDates.value.push(today);
      if (store.currentGoal) {
        store.currentGoal.currentValue = (store.currentGoal.currentValue ?? 0) + 1;
      }
      notify('Прогресс отмечен', 'success');
    }
  } catch {
    notify('Не удалось обновить прогресс');
  } finally {
    markingProgress.value = false;
  }
}

async function toggleMilestone(ms: Milestone) {
  try {
    if (!ms.isDone) {
      const updated = await goalsApi.completeMilestone(goalId.value, ms.id);
      const idx = milestones.value.findIndex((m) => m.id === ms.id);
      if (idx !== -1) milestones.value[idx] = updated;
    }
  } catch {
    notify('Не удалось обновить шаг');
  }
}

async function deleteMilestone(msId: string) {
  try {
    await goalsApi.deleteMilestone(goalId.value, msId);
    milestones.value = milestones.value.filter((m) => m.id !== msId);
    notify('Шаг удалён', 'success');
  } catch {
    notify('Не удалось удалить шаг');
  }
}

async function confirmDelete() {
  try {
    await store.deleteGoal(goalId.value);
    notify('Цель удалена', 'success');
    router.push('/goals');
  } catch {
    notify('Не удалось удалить цель');
  }
}

// Edit
const showEditDialog = ref(false);
const savingEdit = ref(false);
const editErrors = ref({ title: '' });
const GOAL_TYPES = [
  { value: 'habit', label: 'Привычка' },
  { value: 'project', label: 'Проект' },
  { value: 'nutrition', label: 'Питание' },
  { value: 'finance', label: 'Финансы' },
  { value: 'fitness', label: 'Фитнес' },
  { value: 'other', label: 'Другое' },
];
const editForm = ref({
  title: '',
  description: '',
  type: 'habit' as 'habit' | 'project' | 'nutrition' | 'finance' | 'fitness' | 'other',
  targetValueStr: '',
  deadline: '',
});

watch(showEditDialog, (open) => {
  if (open && store.currentGoal) {
    editForm.value = {
      title: store.currentGoal.title,
      description: store.currentGoal.description || '',
      type: store.currentGoal.type,
      targetValueStr: store.currentGoal.targetValue ? String(store.currentGoal.targetValue) : '',
      deadline: store.currentGoal.deadline ? store.currentGoal.deadline.slice(0, 10) : '',
    };
    editErrors.value = { title: '' };
  }
});

async function submitEdit() {
  editErrors.value = { title: '' };
  if (!editForm.value.title.trim()) {
    editErrors.value.title = 'Введите название';
    return;
  }
  savingEdit.value = true;
  try {
    await store.updateGoal(goalId.value, {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim() || undefined,
      type: editForm.value.type,
      targetValue: editForm.value.targetValueStr ? Number(editForm.value.targetValueStr) : undefined,
      deadline: editForm.value.deadline || undefined,
    });
    notify('Цель обновлена', 'success');
    showEditDialog.value = false;
  } catch {
    notify('Не удалось обновить цель');
  } finally {
    savingEdit.value = false;
  }
}

// Milestone
const showMilestoneDialog = ref(false);
const savingMilestone = ref(false);
const milestoneErrors = ref({ title: '' });
const milestoneForm = ref({ title: '', description: '' });

async function submitMilestone() {
  milestoneErrors.value = { title: '' };
  if (!milestoneForm.value.title.trim()) {
    milestoneErrors.value.title = 'Введите название';
    return;
  }
  savingMilestone.value = true;
  try {
    const ms = await goalsApi.createMilestone(goalId.value, {
      title: milestoneForm.value.title.trim(),
      description: milestoneForm.value.description.trim() || undefined,
      order: milestones.value.length,
    });
    milestones.value.push(ms);
    milestoneForm.value = { title: '', description: '' };
    showMilestoneDialog.value = false;
    notify('Шаг добавлен', 'success');
  } catch {
    notify('Не удалось добавить шаг');
  } finally {
    savingMilestone.value = false;
  }
}

onMounted(async () => {
  try {
    await store.fetchGoal(goalId.value);
    await Promise.all([loadMilestones(), loadProgress()]);
  } catch {
    notify('Не удалось загрузить цель');
  }
});
</script>
