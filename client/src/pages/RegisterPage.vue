<template>
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
    <div class="pointer-events-none absolute left-1/2 top-0 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[120px] ember-pulse"
         style="background: radial-gradient(circle, rgba(224,170,78,0.22), rgba(224,170,78,0) 70%);" />

    <div class="relative w-full max-w-sm forge-rise">
      <div class="mb-8 text-center">
        <router-link to="/" class="font-display text-4xl tracking-tight text-text">FORMANIMA</router-link>
        <p class="mt-2 font-stat text-[11px] uppercase tracking-[0.4em] text-gold">Кузня характера</p>
      </div>

      <div class="forge-card forge-glow rounded-2xl p-7">
        <h2 class="mb-1 font-display text-2xl text-text">Стань подмастерьем</h2>
        <p class="mb-6 text-sm text-text-muted">Первый удар молота — здесь</p>

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

          <p v-if="authError" class="text-sm text-error">{{ authError }}</p>

          <UiButton type="submit" size="lg" :loading="loading" class="mt-1 w-full">
            Зажечь горн
          </UiButton>
        </form>

        <p class="mt-6 text-center text-sm text-text-muted">
          Уже в кузне?
          <router-link to="/login" class="font-medium text-gold hover:underline">Войти</router-link>
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
