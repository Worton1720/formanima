<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background: linear-gradient(180deg, #1a0f3d 0%, #121212 45%);">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold tracking-widest" style="color: #6366f1;">FORMANIMA</h1>
        <p class="text-sm mt-2" style="color: rgba(255,255,255,0.6);">Кузня характера</p>
      </div>

      <div class="rounded-2xl p-6 shadow-xl" style="background: #1a1a1a; border: 1px solid rgba(255,255,255,0.08);">
        <h2 class="text-lg font-semibold mb-5">Войти</h2>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
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
            label="Пароль"
            type="password"
            placeholder="••••••••"
            :error="errors.password"
            autocomplete="current-password"
          />

          <p v-if="authError" class="text-sm" style="color: #ef4444;">{{ authError }}</p>

          <UiButton type="submit" :loading="loading" class="w-full mt-1" style="background: linear-gradient(135deg, #6366f1, #4338ca);">
            Войти
          </UiButton>
        </form>

        <p class="text-center text-sm mt-4" style="color: rgba(255,255,255,0.5);">
          Нет аккаунта?
          <router-link to="/register" style="color: #6366f1;">Зарегистрироваться</router-link>
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
const email = ref('');
const password = ref('');
const errors = ref({ email: '', password: '' });

async function submit() {
  errors.value = { email: '', password: '' };
  authError.value = '';
  if (!email.value) { errors.value.email = 'Введите email'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errors.value.email = 'Некорректный email'; return; }
  if (!password.value) { errors.value.password = 'Введите пароль'; return; }

  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push('/dashboard');
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 401) authError.value = 'Неверный email или пароль';
    else if (status === 400) authError.value = 'Проверьте правильность введённых данных';
    else authError.value = 'Ошибка сервера. Попробуйте позже';
  } finally {
    loading.value = false;
  }
}
</script>
