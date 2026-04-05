import client from './client';
import type { StreakStats, HabitOverview, HeatmapEntry } from '../types';

export const statsApi = {
  getStreak: (habitId: string) =>
    client.get<StreakStats>(`/stats/streak/${habitId}`).then((r) => r.data),
  getOverview: (days = 7) =>
    client.get<HabitOverview[]>(`/stats/overview?days=${days}`).then((r) => r.data),
  getHeatmap: (habitId: string, days = 90) =>
    client.get<HeatmapEntry[]>(`/stats/heatmap/${habitId}?days=${days}`).then((r) => r.data),
};
