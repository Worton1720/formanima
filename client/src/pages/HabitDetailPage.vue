<template>
  <div v-if="habit" class="max-w-2xl mx-auto px-4 py-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <router-link to="/habits" class="p-2 rounded-lg transition-colors" style="color: rgba(255,255,255,0.5);">
        <ChevronLeft class="w-5 h-5" />
      </router-link>
      <component :is="habitIcon" class="w-6 h-6 flex-shrink-0" :style="{ color: habit.color }" />
      <h1 class="text-xl font-bold flex-1 truncate">{{ habit.title }}</h1>
      <UiButton variant="ghost" size="sm" @click="showEditForm = true">
        <Pencil class="w-4 h-4" />
      </UiButton>
    </div>

    <!-- Streak cards -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="rounded-xl p-4 text-center" style="background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);">
        <p class="text-3xl font-bold" style="color: #6366f1;">{{ streak?.current ?? 0 }}</p>
        <p class="text-xs mt-1" style="color: rgba(255,255,255,0.5);">Текущий streak</p>
      </div>
      <div class="rounded-xl p-4 text-center" style="background: #242424; border: 1px solid rgba(255,255,255,0.08);">
        <p class="text-3xl font-bold">{{ streak?.best ?? 0 }}</p>
        <p class="text-xs mt-1" style="color: rgba(255,255,255,0.5);">Лучший streak</p>
      </div>
    </div>

    <!-- Heatmap -->
    <div class="rounded-2xl p-4 mb-6" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
      <p class="text-sm font-medium mb-3">История выполнений</p>
      <HeatmapCalendar :habit-id="id" :color="habit.color" />
    </div>

    <!-- Actions section -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold">Действия</h2>
      <UiButton variant="tonal" size="sm" @click="showAddAction = true">
        <Plus class="w-4 h-4 mr-1" />Добавить
      </UiButton>
    </div>

    <div v-if="habit.actions.length" class="flex flex-col gap-2">
      <div
        v-for="(action, idx) in habit.actions"
        :key="action.id"
        class="flex items-center justify-between px-4 py-3 rounded-xl"
        style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);"
      >
        <p class="text-sm font-medium">{{ action.title }}</p>
        <UiButton variant="ghost" size="sm" @click="removeAction(action.id)">
          <Trash2 class="w-4 h-4" style="color: #ef4444;" />
        </UiButton>
      </div>
    </div>

    <div v-else class="text-center py-8" style="color: rgba(255,255,255,0.3);">
      <p class="text-sm">Нет действий. Добавьте действия для отслеживания.</p>
    </div>

    <!-- Add action dialog -->
    <UiDialog v-model="showAddAction" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Новое действие</h3>
        <UiInput
          v-model="newActionTitle"
          label="Название действия"
          placeholder="Отжимания 20 раз"
          class="mb-4"
        />
        <div class="flex gap-2 justify-end">
          <UiButton variant="ghost" @click="showAddAction = false">Отмена</UiButton>
          <UiButton :loading="addingAction" @click="addAction">Добавить</UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Edit habit dialog -->
    <UiDialog v-model="showEditForm" max-width="lg">
      <HabitForm v-if="habit" :habit="habit" @submit="onEditSubmit" @cancel="showEditForm = false" />
    </UiDialog>
  </div>

  <div v-else class="flex justify-center items-center" style="height: 50vh;">
    <UiSpinner />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ChevronLeft, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import { habitsApi } from '../api/habits.api';
import { actionsApi } from '../api/actions.api';
import { statsApi } from '../api/stats.api';
import { useNotify } from '../composables/useNotify';
import { getIcon } from '../utils/iconMap';
import { UiButton, UiDialog, UiInput, UiSpinner } from '../components/ui';
import type { Habit, StreakStats } from '../types';
import HeatmapCalendar from '../components/stats/HeatmapCalendar.vue';
import HabitForm from '../components/habits/HabitForm.vue';

const route = useRoute();
const id = route.params.id as string;
const habit = ref<Habit | null>(null);
const streak = ref<StreakStats | null>(null);
const showAddAction = ref(false);
const showEditForm = ref(false);
const newActionTitle = ref('');
const addingAction = ref(false);
const { notify } = useNotify();

const habitIcon = computed(() => getIcon(habit.value?.icon ?? 'mdi-fire'));

onMounted(async () => {
  try {
    [habit.value, streak.value] = await Promise.all([
      habitsApi.getOne(id),
      statsApi.getStreak(id),
    ]);
  } catch {
    notify('Не удалось загрузить данные привычки');
  }
});

async function addAction() {
  if (!newActionTitle.value.trim()) return;
  addingAction.value = true;
  try {
    const order = habit.value?.actions.length ?? 0;
    const action = await actionsApi.create(id, newActionTitle.value.trim(), order);
    habit.value?.actions.push(action);
    newActionTitle.value = '';
    showAddAction.value = false;
  } catch {
    notify('Не удалось добавить действие');
  } finally {
    addingAction.value = false;
  }
}

async function removeAction(actionId: string) {
  try {
    await actionsApi.delete(id, actionId);
    if (habit.value) {
      habit.value.actions = habit.value.actions.filter((a) => a.id !== actionId);
    }
  } catch {
    notify('Не удалось удалить действие');
  }
}

async function onEditSubmit(
  data: Partial<Habit>,
  actions: { id?: string; title: string; order: number }[],
  removedIds: string[],
) {
  try {
    await habitsApi.update(id, data);
    await Promise.all(removedIds.map((rid) => actionsApi.delete(id, rid)));
    const newActions = actions.filter((a) => !a.id);
    for (const a of newActions) {
      await actionsApi.create(id, a.title, actions.indexOf(a));
    }
    habit.value = await habitsApi.getOne(id);
    showEditForm.value = false;
  } catch {
    notify('Не удалось обновить привычку');
  }
}
</script>
