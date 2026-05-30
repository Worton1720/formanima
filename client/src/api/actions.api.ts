import client from './client';
import type { Action } from '../types';

export const actionsApi = {
  create: (habitId: string, title: string, order: number): Promise<Action> =>
    client.post<Action>(`/habits/${habitId}/actions`, { title, order }).then((r) => r.data),

  delete: (habitId: string, actionId: string): Promise<void> =>
    client.delete(`/habits/${habitId}/actions/${actionId}`).then(() => undefined),
};
