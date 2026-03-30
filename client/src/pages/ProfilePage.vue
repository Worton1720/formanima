<template>
  <v-container>
    <h1 class="text-h5 mb-6">Профиль</h1>
    <v-card rounded="xl" max-width="500">
      <v-card-text>
        <v-text-field
          :model-value="auth.userId"
          label="ID пользователя"
          readonly
          prepend-inner-icon="mdi-identifier"
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();

async function logout() {
  await auth.logout();
  router.push('/');
}
</script>
