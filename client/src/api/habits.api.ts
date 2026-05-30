import client from './client';
import type { Habit } from '../types';

export const habitsApi = {
  getAll: (): Promise<Habit[]> =>
    client.get<Habit[]>('/habits').then((r) => r.data),

  getOne: (id: string): Promise<Habit> =>
    client.get<Habit>(`/habits/${id}`).then((r) => r.data),

  create: (data: Partial<Habit>): Promise<Habit> =>
    client.post<Habit>('/habits', data).then((r) => r.data),

  update: (id: string, data: Partial<Habit>): Promise<Habit> =>
    client.patch<Habit>(`/habits/${id}`, data).then((r) => r.data),

  archive: (id: string): Promise<Habit> =>
    client.patch<Habit>(`/habits/${id}/archive`).then((r) => r.data),
};
