<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="8" rounded="xl">
          <v-card-title class="text-h5 pa-6 text-center">Регистрация</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="submit">
              <v-text-field v-model="name" label="Имя" prepend-inner-icon="mdi-account" class="mb-2" />
              <v-text-field v-model="email" label="Email" type="email" prepend-inner-icon="mdi-email" class="mb-2" />
              <v-text-field
                v-model="password"
                label="Пароль (мин. 8 символов)"
                type="password"
                prepend-inner-icon="mdi-lock"
                class="mb-4"
              />
              <v-alert v-if="error" type="error" class="mb-4" density="compact">{{ error }}</v-alert>
              <v-btn type="submit" color="primary" block size="large" :loading="loading">
                Создать аккаунт
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="justify-center pb-4">
            <span class="text-body-2">Уже есть аккаунт?</span>
            <v-btn variant="text" color="primary" to="/login">Войти</v-btn>
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
const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function submit() {
  loading.value = true;
  error.value = '';
  try {
    await auth.register(email.value, password.value, name.value);
    router.push('/dashboard');
  } catch {
    error.value = 'Ошибка регистрации. Возможно, email уже используется.';
  } finally {
    loading.value = false;
  }
}
</script>
