<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="8" rounded="xl">
          <v-card-title class="text-h5 pa-6 text-center">FORMANIMA</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submit">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="[v => !!v || 'Обязательно']"
                class="mb-2"
              />
              <v-text-field
                v-model="password"
                label="Пароль"
                type="password"
                prepend-inner-icon="mdi-lock"
                :rules="[v => !!v || 'Обязательно']"
                class="mb-4"
              />
              <v-alert v-if="error" type="error" class="mb-4" density="compact">{{ error }}</v-alert>
              <v-btn type="submit" color="primary" block size="large" :loading="loading">
                Войти
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center pb-4">
            <span class="text-body-2">Нет аккаунта?</span>
            <v-btn variant="text" color="primary" to="/register">Зарегистрироваться</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push('/dashboard');
  } catch {
    error.value = 'Неверный email или пароль';
  } finally {
    loading.value = false;
  }
}
</script>
