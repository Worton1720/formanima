import client from './client';
import type { AdminUser, AdminStats } from '../types';

export const adminApi = {
  getUsers: () => client.get<AdminUser[]>('/admin/users').then((r) => r.data),
  blockUser: (id: string) =>
    client.put<Pick<AdminUser, 'id' | 'email' | 'role'>>(`/admin/users/${id}/block`).then((r) => r.data),
  deleteUser: (id: string) => client.delete<{ deleted: boolean }>(`/admin/users/${id}`).then((r) => r.data),
  getStats: () => client.get<AdminStats>('/admin/stats').then((r) => r.data),
};
