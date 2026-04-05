<template>
  <v-container>
    <div class="d-flex align-center mb-6">
      <h1 class="text-h5">Мои привычки</h1>
      <v-chip class="ml-3" size="small" variant="tonal" color="primary">
        {{ store.habits.length }}/10
      </v-chip>
      <v-spacer />
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        :disabled="store.habits.length >= 10"
        @click="showForm = true"
      >
        Добавить
      </v-btn>
    </div>

    <v-dialog v-model="showForm" max-width="500">
      <HabitForm :habit="editingHabit" @submit="onSubmit" @cancel="closeForm" />
    </v-dialog>

    <v-progress-linear v-if="store.loading" indeterminate color="primary" class="mb-4" />

    <v-row v-if="store.habits.length">
      <v-col v-for="habit in store.habits" :key="habit.id" cols="12" md="6" lg="4">
        <HabitCard :habit="habit" @edit="startEdit" @archive="archiveHabit" />
      </v-col>
    </v-row>

    <v-empty-state
      v-else-if="!store.loading"
      icon="mdi-fire"
      title="Нет привычек"
      text="Создайте первую привычку, чтобы начать"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHabitsStore } from '../stores/habits.store';
import { useNotify } from '../composables/useNotify';
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

async function onSubmit(data: Partial<Habit>) {
  try {
    if (editingHabit.value) {
      await store.update(editingHabit.value.id, data);
    } else {
      await store.create(data);
    }
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
