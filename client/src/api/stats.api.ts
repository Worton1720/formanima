import client from './client';
import type { StreakStats, HabitOverview } from '../types';

export const statsApi = {
  getStreak: (habitId: string) =>
    client.get<StreakStats>(`/stats/streak/${habitId}`).then((r) => r.data),
  getOverview: (days = 7) =>
    client.get<HabitOverview[]>(`/stats/overview?days=${days}`).then((r) => r.data),
};
