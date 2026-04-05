import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth.api';
import type { UserRole } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const userId = ref<string | null>(localStorage.getItem('userId'));
  const userName = ref<string | null>(localStorage.getItem('userName'));
  const userEmail = ref<string | null>(localStorage.getItem('userEmail'));
  const userRole = ref<UserRole | null>(localStorage.getItem('userRole') as UserRole | null);

  const isAuthenticated = computed(() => !!accessToken.value);

  function saveTokens(data: { accessToken: string; refreshToken: string; userId: string }) {
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;
    userId.value = data.userId;
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('userId', data.userId);
  }

  async function login(email: string, password: string) {
    const data = await authApi.login({ email, password });
    saveTokens(data);
    userEmail.value = email;
    localStorage.setItem('userEmail', email);
    try {
      const me = await authApi.getMe();
      userRole.value = me.role ?? 'user';
      localStorage.setItem('userRole', userRole.value);
      userName.value = me.name;
      localStorage.setItem('userName', me.name);
    } catch {
      userRole.value = 'user';
      localStorage.setItem('userRole', 'user');
    }
  }

  async function register(email: string, password: string, name: string) {
    const data = await authApi.register({ email, password, name });
    saveTokens(data);
    userName.value = name;
    userEmail.value = email;
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    userRole.value = 'user';
    localStorage.setItem('userRole', 'user');
  }

  async function refresh() {
    const token = refreshToken.value;
    if (!token) throw new Error('No refresh token');
    const data = await authApi.refresh(token);
    saveTokens(data);
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore errors on logout
    }
    accessToken.value = null;
    refreshToken.value = null;
    userId.value = null;
    userName.value = null;
    userEmail.value = null;
    userRole.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
  }

  return { accessToken, refreshToken, userId, userName, userEmail, userRole, isAuthenticated, login, register, refresh, logout };
});
