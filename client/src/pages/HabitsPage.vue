<template>
  <div class="max-w-4xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Мои привычки</h1>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background: rgba(226,83,43,0.15); color: #e2532b;">
          {{ habits.length }}/10
        </span>
      </div>
      <UiButton :disabled="habits.length >= 10" @click="showForm = true">
        <Plus class="w-4 h-4 mr-1" />
        Добавить
      </UiButton>
    </div>

    <UiDialog v-model="showForm" max-width="lg">
      <HabitForm :goal="editingHabit" @submit="onSubmit" @cancel="closeForm" />
    </UiDialog>

    <div v-if="store.loading && !habits.length" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <div v-else-if="habits.length" class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
      <HabitCard
        v-for="habit in habits"
        :key="habit.id"
        :habit="habit"
        :marked-today="store.isMarkedToday(habit.id, today)"
        :marking="markingId === habit.id"
        @edit="startEdit"
        @archive="archiveHabit"
        @toggle="toggleToday"
      />
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-8">
      <Flame class="w-12 h-12 mx-auto mb-4" style="color: rgba(243,234,214,0.18);" />
      <h3 class="text-lg font-medium mb-2">Нет привычек</h3>
      <p class="text-sm mb-6" style="color: rgba(168,153,124,0.62);">Создайте первую привычку, чтобы начать</p>
      <UiButton @click="showForm = true">
        <Plus class="w-4 h-4 mr-1" /> Создать привычку
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Plus, Flame } from 'lucide-vue-next';
import dayjs from 'dayjs';
import { useGoalsStore } from '../stores/goals.store';
import { useNotify } from '../composables/useNotify';
import { UiButton, UiDialog, UiSpinner } from '../components/ui';
import HabitCard from '../components/habits/HabitCard.vue';
import HabitForm from '../components/habits/HabitForm.vue';
import type { Goal, CreateGoalDto } from '../types';

const store = useGoalsStore();
const { notify } = useNotify();
const showForm = ref(false);
const editingHabit = ref<Goal | undefined>();
const markingId = ref<string | null>(null);
const today = dayjs().format('YYYY-MM-DD');

const habits = computed(() => store.habitGoals);

onMounted(async () => {
  try {
    await Promise.all([store.fetchGoals(), store.fetchTodayGoals()]);
  } catch {
    notify('Не удалось загрузить привычки');
  }
});

function startEdit(habit: Goal) {
  editingHabit.value = habit;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingHabit.value = undefined;
}

async function onSubmit(data: CreateGoalDto) {
  try {
    if (editingHabit.value) {
      await store.updateGoal(editingHabit.value.id, data);
    } else {
      await store.createGoal(data);
    }
    closeForm();
  } catch (e: any) {
    const msg = e?.response?.data?.message;
    notify(typeof msg === 'string' ? msg : 'Не удалось сохранить привычку');
  }
}

async function archiveHabit(id: string) {
  try {
    await store.archiveGoal(id);
  } catch {
    notify('Не удалось архивировать привычку');
  }
}

async function toggleToday(id: string) {
  markingId.value = id;
  try {
    await store.toggleTodayProgress(id, today);
  } catch {
    notify('Не удалось обновить прогресс');
  } finally {
    markingId.value = null;
  }
}
</script>
