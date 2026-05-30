<template>
  <div class="max-w-4xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">Мои привычки</h1>
        <span class="px-2 py-0.5 rounded-full text-xs font-medium" style="background: rgba(99,102,241,0.15); color: #6366f1;">
          {{ store.habits.length }}/10
        </span>
      </div>
      <UiButton :disabled="store.habits.length >= 10" @click="showForm = true">
        <Plus class="w-4 h-4 mr-1" />
        Добавить
      </UiButton>
    </div>

    <UiDialog v-model="showForm" max-width="lg">
      <HabitForm :habit="editingHabit" @submit="onSubmit" @cancel="closeForm" />
    </UiDialog>

    <div v-if="store.loading" class="flex justify-center py-8">
      <UiSpinner />
    </div>

    <div v-else-if="store.habits.length" class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
      <HabitCard
        v-for="habit in store.habits"
        :key="habit.id"
        :habit="habit"
        @edit="startEdit"
        @archive="archiveHabit"
      />
    </div>

    <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-8">
      <Flame class="w-12 h-12 mx-auto mb-4" style="color: rgba(255,255,255,0.2);" />
      <h3 class="text-lg font-medium mb-2">Нет привычек</h3>
      <p class="text-sm mb-6" style="color: rgba(255,255,255,0.4);">Создайте первую привычку, чтобы начать</p>
      <UiButton @click="showForm = true">
        <Plus class="w-4 h-4 mr-1" /> Создать привычку
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Flame } from 'lucide-vue-next';
import { useHabitsStore } from '../stores/habits.store';
import { useNotify } from '../composables/useNotify';
import { actionsApi } from '../api/actions.api';
import { UiButton, UiDialog, UiSpinner } from '../components/ui';
import HabitCard from '../components/habits/HabitCard.vue';
import HabitForm from '../components/habits/HabitForm.vue';
import type { Habit } from '../types';

const store = useHabitsStore();
const { notify } = useNotify();
const showForm = ref(false);
const editingHabit = ref<Habit | undefined>();

onMounted(async () => {
  try {
    await store.fetchAll();
  } catch {
    notify('Не удалось загрузить привычки');
  }
});

function startEdit(habit: Habit) {
  editingHabit.value = habit;
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  editingHabit.value = undefined;
}

async function onSubmit(
  data: Partial<Habit>,
  actions: { id?: string; title: string; order: number }[],
  removedIds: string[],
) {
  try {
    let habitId: string;
    if (editingHabit.value) {
      await store.update(editingHabit.value.id, data);
      habitId = editingHabit.value.id;
    } else {
      const habit = await store.create(data);
      habitId = habit.id;
    }

    await Promise.all(removedIds.map((id) => actionsApi.delete(habitId, id)));

    const newActions = actions.filter((a) => !a.id);
    for (const a of newActions) {
      await actionsApi.create(habitId, a.title, actions.indexOf(a));
    }

    await store.fetchAll();
    closeForm();
  } catch (e: any) {
    const msg = e?.response?.data?.message;
    notify(typeof msg === 'string' ? msg : 'Не удалось сохранить привычку');
  }
}

async function archiveHabit(habitId: string) {
  try {
    await store.archive(habitId);
  } catch {
    notify('Не удалось архивировать привычку');
  }
}
</script>
