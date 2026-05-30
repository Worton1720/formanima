import { Injectable, NotFoundException } from '@nestjs/common';
import { CalorieProfile, FoodEntry } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFoodEntryDto } from './dto/create-food-entry.dto';
import { UpdateCalorieProfileDto } from './dto/update-calorie-profile.dto';

export interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  entries: FoodEntry[];
  profile: CalorieProfile | null;
}

export interface WeeklyDay {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
}

@Injectable()
export class CaloriesService {
  constructor(private prisma: PrismaService) {}

  // ─── Entries ──────────────────────────────────────────────────────────────────

  getEntries(userId: string, date: string): Promise<FoodEntry[]> {
    const dateObj = new Date(date);
    return this.prisma.foodEntry.findMany({
      where: { userId, date: dateObj },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createEntry(userId: string, dto: CreateFoodEntryDto): Promise<FoodEntry> {
    const entry = await this.prisma.foodEntry.create({
      data: {
        userId,
        name: dto.name,
        mealType: dto.mealType,
        calories: dto.calories,
        protein: dto.protein ?? 0,
        fat: dto.fat ?? 0,
        carbs: dto.carbs ?? 0,
        weight: dto.weight ?? null,
        date: new Date(dto.date),
      },
    });
    await this.syncWithNutritionGoal(userId, dto.date);
    return entry;
  }

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    const entry = await this.prisma.foodEntry.findFirst({
      where: { id: entryId, userId },
    });
    if (!entry) throw new NotFoundException('Food entry not found');

    const dateStr = entry.date.toISOString().split('T')[0];
    await this.prisma.foodEntry.delete({ where: { id: entryId } });
    await this.syncWithNutritionGoal(userId, dateStr);
  }

  // ─── Profile ──────────────────────────────────────────────────────────────────

  async getProfile(userId: string): Promise<CalorieProfile> {
    return this.prisma.calorieProfile.upsert({
      where: { userId },
      create: { userId, updatedAt: new Date() },
      update: {},
    });
  }

  async updateProfile(userId: string, dto: UpdateCalorieProfileDto): Promise<CalorieProfile> {
    return this.prisma.calorieProfile.upsert({
      where: { userId },
      create: {
        userId,
        targetCalories: dto.targetCalories ?? 2000,
        targetProtein: dto.targetProtein ?? 150,
        targetFat: dto.targetFat ?? 65,
        targetCarbs: dto.targetCarbs ?? 250,
        updatedAt: new Date(),
      },
      update: {
        ...(dto.targetCalories !== undefined && { targetCalories: dto.targetCalories }),
        ...(dto.targetProtein !== undefined && { targetProtein: dto.targetProtein }),
        ...(dto.targetFat !== undefined && { targetFat: dto.targetFat }),
        ...(dto.targetCarbs !== undefined && { targetCarbs: dto.targetCarbs }),
      },
    });
  }

  // ─── Summary ──────────────────────────────────────────────────────────────────

  async getDailySummary(userId: string, date: string): Promise<DailySummary> {
    const entries = await this.getEntries(userId, date);
    const profile = await this.prisma.calorieProfile.findUnique({ where: { userId } });

    const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
    const totalProtein = entries.reduce((s, e) => s + e.protein, 0);
    const totalFat = entries.reduce((s, e) => s + e.fat, 0);
    const totalCarbs = entries.reduce((s, e) => s + e.carbs, 0);

    return { totalCalories, totalProtein, totalFat, totalCarbs, entries, profile };
  }

  async getWeeklySummary(userId: string, startDate: string): Promise<WeeklyDay[]> {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 6);

    const entries = await this.prisma.foodEntry.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    const dayMap = new Map<string, { calories: number; protein: number; fat: number; carbs: number }>();

    // Pre-populate all 7 days with zeros
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dayMap.set(key, { calories: 0, protein: 0, fat: 0, carbs: 0 });
    }

    for (const e of entries) {
      const key = e.date.toISOString().split('T')[0];
      const day = dayMap.get(key);
      if (day) {
        day.calories += e.calories;
        day.protein += e.protein;
        day.fat += e.fat;
        day.carbs += e.carbs;
      }
    }

    return [...dayMap.entries()].map(([date, v]) => ({
      date,
      totalCalories: v.calories,
      totalProtein: v.protein,
      totalFat: v.fat,
      totalCarbs: v.carbs,
    }));
  }

  // ─── Sync with nutrition Goal ─────────────────────────────────────────────────

  // QA-CONTRACT: создаёт/обновляет GoalProgress для nutrition-цели
  // НЕ вызывает recalculate напрямую
  private async syncWithNutritionGoal(userId: string, dateStr: string): Promise<void> {
    const nutritionGoal = await this.prisma.goal.findFirst({
      where: { userId, type: 'nutrition', status: 'active' },
    });
    if (!nutritionGoal) return;

    const summary = await this.getDailySummary(userId, dateStr);
    const dateObj = new Date(dateStr);

    // QA-FIX: nullable milestoneId (NULL != NULL in PostgreSQL, so no @@unique)
    const existing = await this.prisma.goalProgress.findFirst({
      where: { goalId: nutritionGoal.id, userId, date: dateObj, milestoneId: null },
    });

    if (existing) {
      await this.prisma.goalProgress.update({
        where: { id: existing.id },
        data: { value: summary.totalCalories },
      });
    } else {
      await this.prisma.goalProgress.create({
        data: {
          goalId: nutritionGoal.id,
          userId,
          date: dateObj,
          value: summary.totalCalories,
          milestoneId: null,
        },
      });
    }

    await this.prisma.goal.update({
      where: { id: nutritionGoal.id },
      data: { currentValue: summary.totalCalories },
    });
  }
}
