export type UserRole = 'user' | 'admin' | 'blocked';

export interface User {
  id: string;
  email: string;
  name: string;
  role?: UserRole;
  createdAt?: string;
}

export interface DailyStats {
  date: string;
  completedCount: number;
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

export interface HeatmapEntry {
  date: string;
  completed: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;
  createdAt: string;
  isRecurring?: boolean;
  recurringInterval?: string | null;
  recurringParentId?: string | null;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface FinanceSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
}

export interface Budget {
  id: string;
  category: string;
  month: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  createdAt: string;
  goalId?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  habitsCount: number;
  strikesCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalHabits: number;
  totalCompletions: number;
  activeToday: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'habit' | 'project' | 'nutrition' | 'finance' | 'fitness' | 'other';
  status: 'active' | 'completed' | 'archived' | 'paused';
  category: string;
  color: string;
  icon: string;
  targetValue?: number;
  currentValue: number;
  frequency: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
  progresses?: GoalProgress[];
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  description?: string;
  order: number;
  isDone: boolean;
  doneAt?: string;
  createdAt: string;
}

export interface GoalProgress {
  id: string;
  goalId: string;
  userId: string;
  milestoneId?: string;
  date: string;
  value: number;
  note?: string;
  completedAt: string;
}

export interface CreateGoalDto {
  title: string;
  description?: string;
  type: 'habit' | 'project' | 'nutrition' | 'finance' | 'fitness' | 'other';
  category?: string;
  color?: string;
  icon?: string;
  targetValue?: number;
  frequency?: string;
  deadline?: string;
}

export interface UpdateGoalDto {
  title?: string;
  description?: string;
  type?: 'habit' | 'project' | 'nutrition' | 'finance' | 'fitness' | 'other';
  status?: 'active' | 'completed' | 'archived' | 'paused';
  category?: string;
  color?: string;
  icon?: string;
  targetValue?: number;
  frequency?: string;
  deadline?: string;
}

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  order?: number;
}

export interface AddProgressDto {
  date: string;
  value?: number;
  note?: string;
  milestoneId?: string;
}

export interface RemoveProgressDto {
  date: string;
}

export interface FoodEntry {
  id: string;
  userId: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight?: number;
  date: string;
  createdAt: string;
}

export interface CalorieProfile {
  id: string;
  userId: string;
  targetCalories: number;
  targetProtein: number;
  targetFat: number;
  targetCarbs: number;
  updatedAt: string;
}

export interface DailyCalorieSummary {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  entries: FoodEntry[];
  profile: CalorieProfile | null;
}

export interface WeeklyCalorieDay {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

export interface CreateFoodEntryDto {
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  weight?: number;
  date: string;
}

export interface UpdateCalorieProfileDto {
  targetCalories?: number;
  targetProtein?: number;
  targetFat?: number;
  targetCarbs?: number;
}
