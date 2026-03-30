import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth.api';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const userId = ref<string | null>(localStorage.getItem('userId'));

  const isAuthenticated = computed(() => !!accessToken.value);

  async function login(email: string, password: string) {
    const data = await authApi.login({ email, password });
    accessToken.value = data.accessToken;
    userId.value = data.userId;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('userId', data.userId);
  }

  async function register(email: string, password: string, name: string) {
    const data = await authApi.register({ email, password, name });
    accessToken.value = data.accessToken;
    userId.value = data.userId;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('userId', data.userId);
  }

  async function logout() {
    await authApi.logout();
    accessToken.value = null;
    userId.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
  }

  return { accessToken, userId, isAuthenticated, login, register, logout };
});
