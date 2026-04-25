<template>
  <v-container v-if="habit">
    <div class="d-flex align-center mb-6">
      <v-btn icon="mdi-arrow-left" variant="text" to="/habits" />
      <v-icon :icon="habit.icon" :color="habit.color" class="mx-2" />
      <h1 class="text-h5">{{ habit.title }}</h1>
      <v-btn icon="mdi-pencil" variant="text" size="small" class="ml-2" @click="showEditForm = true" />
    </div>

    <v-row class="mb-6">
      <v-col cols="6" md="3">
        <v-card rounded="xl" variant="tonal" color="primary" class="text-center pa-4">
          <div class="text-h4 font-weight-bold">{{ streak?.current ?? 0 }}</div>
          <div class="text-caption">Текущий streak</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" variant="tonal" class="text-center pa-4">
          <div class="text-h4 font-weight-bold">{{ streak?.best ?? 0 }}</div>
          <div class="text-caption">Лучший streak</div>
        </v-card>
      </v-col>
    </v-row>

    <HeatmapCalendar :habit-id="id" :color="habit.color" class="mb-6" />

    <div class="d-flex align-center mb-4">
      <h2 class="text-h6">Действия</h2>
      <v-spacer />
      <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="showAddAction = true">
        Добавить
      </v-btn>
    </div>

    <v-dialog v-model="showAddAction" max-width="400">
      <v-card rounded="xl">
        <v-card-title>Новое действие</v-card-title>
        <v-card-text>
          <v-text-field v-model="newActionTitle" label="Название действия" autofocus />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showAddAction = false">Отмена</v-btn>
          <v-btn color="primary" :loading="addingAction" @click="addAction">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-list v-if="habit.actions.length" lines="one">
      <v-list-item
        v-for="(action, idx) in habit.actions"
        :key="action.id"
        :title="action.title"
        :subtitle="`Порядок: ${idx + 1}`"
      >
        <template #append>
          <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="removeAction(action.id)" />
        </template>
      </v-list-item>
    </v-list>

    <v-empty-state
      v-else
      icon="mdi-checkbox-blank-outline"
      title="Нет действий"
      text="Добавьте действия, которые нужно выполнять для поддержания этой привычки"
    />

    <!-- Диалог редактирования привычки -->
    <v-dialog v-model="showEditForm" max-width="560">
      <HabitForm v-if="habit" :habit="habit" @submit="onEditSubmit" @cancel="showEditForm = false" />
    </v-dialog>
  </v-container>

  <v-container v-else class="d-flex justify-center align-center" style="height: 50vh">
    <v-progress-circular indeterminate color="primary" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { habitsApi } from '../api/habits.api';
import { actionsApi } from '../api/actions.api';
import { statsApi } from '../api/stats.api';
import { useNotify } from '../composables/useNotify';
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
