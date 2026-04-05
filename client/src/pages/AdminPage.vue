<template>
  <v-container>
    <h1 class="text-h5 mb-6">Панель администратора</h1>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-row class="mb-6" v-if="stats">
      <v-col cols="6" md="3">
        <v-card rounded="xl" variant="tonal" color="primary">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">{{ stats.totalUsers }}</div>
            <div class="text-body-2">Пользователей</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" variant="tonal" color="secondary">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">{{ stats.totalHabits }}</div>
            <div class="text-body-2">Привычек</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" variant="tonal" color="success">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">{{ stats.totalCompletions }}</div>
            <div class="text-body-2">Выполнений</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card rounded="xl" variant="tonal" color="info">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold">{{ stats.activeToday }}</div>
            <div class="text-body-2">Активны сегодня</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-h6 mb-3">Пользователи</h2>

    <v-table v-if="users.length">
      <thead>
        <tr>
          <th>Email</th>
          <th>Имя</th>
          <th>Роль</th>
          <th>Привычек</th>
          <th>Страйков</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.email }}</td>
          <td>{{ user.name }}</td>
          <td>
            <v-chip
              size="x-small"
              :color="user.role === 'admin' ? 'primary' : user.role === 'blocked' ? 'error' : 'default'"
              variant="tonal"
            >
              {{ user.role }}
            </v-chip>
          </td>
          <td>{{ user.habitsCount }}</td>
          <td>{{ user.strikesCount }}</td>
          <td>
            <v-btn
              v-if="user.role !== 'admin'"
              size="small"
              variant="text"
              :color="user.role === 'blocked' ? 'success' : 'warning'"
              :icon="user.role === 'blocked' ? 'mdi-account-check' : 'mdi-account-off'"
              @click="toggleBlock(user.id)"
            />
            <v-btn
              v-if="user.role !== 'admin'"
              size="small"
              variant="text"
              color="error"
              icon="mdi-delete"
              @click="remove(user.id)"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-empty-state
      v-if="!loading && users.length === 0"
      icon="mdi-account-group"
      title="Нет пользователей"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminApi } from '../api/admin.api';
import type { AdminUser, AdminStats } from '../types';

const loading = ref(true);
const users = ref<AdminUser[]>([]);
const stats = ref<AdminStats | null>(null);

async function load() {
  loading.value = true;
  try {
    [users.value, stats.value] = await Promise.all([adminApi.getUsers(), adminApi.getStats()]);
  } finally {
    loading.value = false;
  }
}

async function toggleBlock(id: string) {
  await adminApi.blockUser(id);
  await load();
}

async function remove(id: string) {
  await adminApi.deleteUser(id);
  await load();
}

onMounted(load);
</script>
