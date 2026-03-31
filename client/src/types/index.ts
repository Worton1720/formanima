export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Action {
  id: string;
  habitId: string;
  title: string;
  order: number;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  frequency: string;
  color: string;
  icon: string;
  isArchived: boolean;
  createdAt: string;
  actions: Action[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface StreakStats {
  current: number;
  best: number;
}

export interface HabitOverview {
  habitId: string;
  title: string;
  completionRate: number;
  completedDays: number;
  totalDays: number;
}

export interface AchievementStatus {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  xpCurrentLevel: number;
  xpToNextLevel: number;
  totalStrikes: number;
  rank: 'apprentice' | 'journeyman' | 'master' | 'grandmaster';
  achievements: AchievementStatus[];
}
