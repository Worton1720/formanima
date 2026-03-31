<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="8" rounded="xl">
          <v-card-title class="text-h5 pa-6 text-center">Регистрация</v-card-title>
          <v-card-text>
            <v-form ref="form" @submit.prevent="submit">
              <v-text-field
                v-model="name"
                label="Имя"
                prepend-inner-icon="mdi-account"
                :rules="nameRules"
                class="mb-2"
              />
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
                class="mb-2"
              />
              <v-text-field
                v-model="password"
                label="Пароль (мин. 8 символов)"
                type="password"
                prepend-inner-icon="mdi-lock"
                :rules="passwordRules"
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
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const nameRules = [
  (v: string) => !!v?.trim() || 'Введите имя',
  (v: string) => v.trim().length >= 2 || 'Минимум 2 символа',
];
const emailRules = [
  (v: string) => !!v || 'Введите email',
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Некорректный email',
];
const passwordRules = [
  (v: string) => !!v || 'Введите пароль',
  (v: string) => v.length >= 8 || 'Минимум 8 символов',
];

async function submit() {
  const { valid } = await form.value!.validate();
  if (!valid) return;

  loading.value = true;
  error.value = '';
  try {
    await auth.register(email.value, password.value, name.value);
    router.push('/dashboard');
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 409) {
      error.value = 'Этот email уже зарегистрирован';
    } else if (status === 400) {
      error.value = 'Проверьте правильность введённых данных';
    } else {
      error.value = 'Ошибка сервера. Попробуйте позже';
    }
  } finally {
    loading.value = false;
  }
}
</script>
