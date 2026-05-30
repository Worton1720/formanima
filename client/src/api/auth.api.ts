import client from './client';
import type { AuthResponse, User } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    client.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    client.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    client.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),

  getMe: () => client.get<User>('/auth/me').then((r) => r.data),

  logout: () => client.post('/auth/logout'),
  updateProfile: (data: { name: string }) =>
    client.patch<User>('/auth/profile', data).then((r) => r.data),
};
