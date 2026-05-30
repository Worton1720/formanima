import client from './client';
import type {
  CalorieProfile,
  CreateFoodEntryDto,
  DailyCalorieSummary,
  FoodEntry,
  UpdateCalorieProfileDto,
  WeeklyCalorieDay,
} from '../types';

export const caloriesApi = {
  getEntries: (date: string): Promise<FoodEntry[]> =>
    client.get<FoodEntry[]>('/calories/entries', { params: { date } }).then((r) => r.data),

  createEntry: (dto: CreateFoodEntryDto): Promise<FoodEntry> =>
    client.post<FoodEntry>('/calories/entries', dto).then((r) => r.data),

  deleteEntry: (id: string): Promise<void> =>
    client.delete(`/calories/entries/${id}`).then(() => undefined),

  getProfile: (): Promise<CalorieProfile> =>
    client.get<CalorieProfile>('/calories/profile').then((r) => r.data),

  updateProfile: (dto: UpdateCalorieProfileDto): Promise<CalorieProfile> =>
    client.put<CalorieProfile>('/calories/profile', dto).then((r) => r.data),

  getDailySummary: (date: string): Promise<DailyCalorieSummary> =>
    client.get<DailyCalorieSummary>('/calories/summary', { params: { date } }).then((r) => r.data),

  getWeeklySummary: (startDate: string): Promise<WeeklyCalorieDay[]> =>
    client.get<WeeklyCalorieDay[]>('/calories/weekly', { params: { startDate } }).then((r) => r.data),
};
