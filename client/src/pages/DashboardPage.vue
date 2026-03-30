<template>
  <v-container>
    <div class="d-flex align-center mb-2">
      <h1 class="text-h5">Дашборд</h1>
      <v-spacer />
      <v-btn icon="mdi-logout" variant="text" @click="logout" />
    </div>
    <p class="text-body-2 text-medium-emphasis mb-6">{{ formattedDate }}</p>

    <v-row class="mb-4">
      <v-col cols="12">
        <v-card rounded="xl" color="primary" variant="tonal">
          <v-card-text class="d-flex align-center">
            <div>
              <div class="text-h4 font-weight-bold">{{ totalCompleted }}/{{ totalActions }}</div>
              <div class="text-body-2">действий выполнено сегодня</div>
            </div>
            <v-spacer />
            <v-progress-circular
              :model-value="overallProgress"
              color="primary"
              size="64"
              width="6"
            >
              {{ overallProgress }}%
            </v-progress-circular>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row v-if="habitsWithActions.length">
      <v-col v-for="habit in habitsWithActions" :key="habit.id" cols="12" md="6">
        <DailyHabitCard :habit="habit" :date="today" />
      </v-col>
    </v-row>

    <v-empty-state
      v-else-if="!loading"
      icon="mdi-fire"
      title="Нет привычек"
      text="Перейдите в раздел привычек, чтобы создать первую"
    >
      <template #actions>
        <v-btn color="primary" to="/habits">Управление привычками</v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { useAuthStore } from '../stores/auth.store';
import { useHabitsStore } from '../stores/habits.store';
import { useTrackingStore } from '../stores/tracking.store';
import DailyHabitCard from '../components/tracking/DailyHabitCard.vue';

dayjs.locale('ru');

const auth = useAuthStore();
const habitsStore = useHabitsStore();
const trackingStore = useTrackingStore();
const router = useRouter();
const loading = ref(true);
const today = dayjs().format('YYYY-MM-DD');
const formattedDate = dayjs().format('dddd, D MMMM YYYY');

const habitsWithActions = computed(() =>
  habitsStore.habits.filter((h) => h.actions && h.actions.length > 0),
);
const totalActions = computed(() =>
  habitsWithActions.value.reduce((acc, h) => acc + h.actions.length, 0),
);
const totalCompleted = computed(() =>
  habitsWithActions.value.reduce((acc, h) => {
    const status = trackingStore.getStatus(h.id, today);
    return acc + Object.values(status).filter(Boolean).length;
  }, 0),
);
const overallProgress = computed(() =>
  totalActions.value ? Math.round((totalCompleted.value / totalActions.value) * 100) : 0,
);

async function logout() {
  await auth.logout();
  router.push('/');
}

onMounted(async () => {
  await habitsStore.fetchAll();
  await Promise.all(
    habitsWithActions.value.map((h) => trackingStore.loadStatus(h.id, today)),
  );
  loading.value = false;
});
</script>
