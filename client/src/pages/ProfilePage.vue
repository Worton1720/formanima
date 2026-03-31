<template>
  <v-container>
    <h1 class="text-h5 mb-6">Профиль</h1>
    <v-card rounded="xl" max-width="500">
      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
        <v-text-field
          :model-value="profile?.name ?? auth.userName ?? '—'"
          label="Имя"
          readonly
          prepend-inner-icon="mdi-account"
          class="mb-2"
        />
        <v-text-field
          :model-value="profile?.email ?? auth.userEmail ?? '—'"
          label="Email"
          readonly
          prepend-inner-icon="mdi-email"
          class="mb-2"
        />
        <v-text-field
          v-if="profile?.createdAt"
          :model-value="formatDate(profile.createdAt)"
          label="Дата регистрации"
          readonly
          prepend-inner-icon="mdi-calendar"
        />
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-btn color="error" variant="text" prepend-icon="mdi-logout" @click="logout">
          Выйти
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { useNotify } from '../composables/useNotify';
import { authApi } from '../api/auth.api';
import type { User } from '../types';

interface UserWithDate extends User {
  createdAt?: string;
}

const auth = useAuthStore();
const router = useRouter();
const { notify } = useNotify();
const profile = ref<UserWithDate | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    profile.value = await authApi.getMe() as UserWithDate;
  } catch {
    notify('Не удалось загрузить профиль');
  } finally {
    loading.value = false;
  }
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>
