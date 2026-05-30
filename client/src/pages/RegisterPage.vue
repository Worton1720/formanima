<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background: #0f0f0f;">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold" style="color: #6366f1;">FORMANIMA</h1>
        <p class="text-sm mt-1" style="color: rgba(255,255,255,0.5);">Кузня характера</p>
      </div>

      <div class="rounded-2xl p-6 shadow-xl" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
        <h2 class="text-lg font-semibold mb-5">Регистрация</h2>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
          <UiInput
            v-model="name"
            label="Имя"
            placeholder="Ваше имя"
            :error="errors.name"
            autocomplete="name"
          />
          <UiInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            :error="errors.email"
            autocomplete="email"
          />
          <UiInput
            v-model="password"
            label="Пароль (мин. 8 символов)"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
            autocomplete="new-password"
          />

          <p v-if="authError" class="text-sm" style="color: #ef4444;">{{ authError }}</p>

          <UiButton type="submit" :loading="loading" class="w-full mt-1">
            Создать аккаунт
          </UiButton>
        </form>

        <p class="text-center text-sm mt-4" style="color: rgba(255,255,255,0.5);">
          Уже есть аккаунт?
          <router-link to="/login" style="color: #6366f1;">Войти</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { UiButton, UiInput } from '../components/ui';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);
const authError = ref('');
const name = ref('');
const email = ref('');
const password = ref('');
const errors = ref({ name: '', email: '', password: '' });

async function submit() {
  errors.value = { name: '', email: '', password: '' };
  authError.value = '';
  let hasError = false;
  if (!name.value?.trim() || name.value.trim().length < 2) { errors.value.name = 'Введите имя (мин. 2 символа)'; hasError = true; }
  if (!email.value) { errors.value.email = 'Введите email'; hasError = true; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errors.value.email = 'Некорректный email'; hasError = true; }
  if (!password.value || password.value.length < 8) { errors.value.password = 'Минимум 8 символов'; hasError = true; }
  if (hasError) return;

  loading.value = true;
  try {
    await auth.register(email.value, password.value, name.value);
    router.push('/dashboard');
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 409) authError.value = 'Этот email уже зарегистрирован';
    else if (status === 400) authError.value = 'Проверьте правильность введённых данных';
    else authError.value = 'Ошибка сервера. Попробуйте позже';
  } finally {
    loading.value = false;
  }
}
</script>
