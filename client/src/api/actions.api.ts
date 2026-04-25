import client from './client';
import type { Action } from '../types';

export const actionsApi = {
  create: (habitId: string, title: string, order: number) =>
    client.post<Action>(`/habits/${habitId}/actions`, { title, order }).then((r) => r.data),

  delete: (habitId: string, actionId: string) =>
    client.delete(`/habits/${habitId}/actions/${actionId}`),
};
