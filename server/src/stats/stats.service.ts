import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsService } from '../goals/goals.service';

@Injectable()
export class StatsService {
  constructor(
    private prisma: PrismaService,
    private goals: GoalsService,
  ) {}

  async getStreak(goalId: string, userId: string): Promise<{ current: number; best: number }> {
    // Проверяем существование и доступность цели
    await this.goals.findOne(userId, goalId);

    const progresses = await this.prisma.goalProgress.findMany({
      where: { userId, goalId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    if (progresses.length === 0) return { current: 0, best: 0 };

    // Уникальные даты
    const toStr = (d: Date) => d.toISOString().split('T')[0];
    const dateSet = new Set(progresses.map((p) => toStr(p.date)));

    const today = toStr(new Date());
    const dayBefore = (s: string) => {
      const d = new Date(s);
      d.setDate(d.getDate() - 1);
      return toStr(d);
    };

    // Current streak
    let current = 0;
    let day = today;
    while (dateSet.has(day)) {
      current++;
      day = dayBefore(day);
    }

    // Best streak
    const sortedDates = [...dateSet].sort();
    let best = 0;
    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays === 1) {
          streak++;
        } else {
          streak = 1;
        }
      }
      best = Math.max(best, streak);
    }

    return { current, best };
  }

  async getOverview(userId: string, days: number = 7) {
    const goals = await this.prisma.goal.findMany({
      where: { userId, status: 'active', type: 'habit' },
      orderBy: { createdAt: 'asc' },
    });

    const results: {
      habitId: string;
      title: string;
      completionRate: number;
      completedDays: number;
      totalDays: number;
    }[] = [];

    for (const goal of goals) {
      const from = new Date();
      from.setDate(from.getDate() - days + 1);
      from.setHours(0, 0, 0, 0);

      const progresses = await this.prisma.goalProgress.findMany({
        where: { userId, goalId: goal.id, date: { gte: from } },
        select: { date: true },
      });

      // Уникальные дни с прогрессом
      const completedDaysSet = new Set(progresses.map((p) => p.date.toISOString().split('T')[0]));
      const completedDays = completedDaysSet.size;

      results.push({
        habitId: goal.id,
        title: goal.title,
        completionRate: Math.round((completedDays / days) * 100),
        completedDays,
        totalDays: days,
      });
    }

    return results;
  }

  async getHeatmap(
    goalId: string,
    userId: string,
    days = 90,
  ): Promise<{ date: string; completed: boolean }[]> {
    await this.goals.findOne(userId, goalId);

    const dateRange = this.buildDateRange(days);
    const from = new Date(dateRange[0] + 'T00:00:00.000Z');

    const progresses = await this.prisma.goalProgress.findMany({
      where: { userId, goalId, date: { gte: from } },
      select: { date: true },
    });

    const completedDates = new Set(progresses.map((p) => p.date.toISOString().split('T')[0]));

    return dateRange.map((date) => ({
      date,
      completed: completedDates.has(date),
    }));
  }

  async getDailyStats(userId: string, days = 30): Promise<{ date: string; completedCount: number }[]> {
    const dateRange = this.buildDateRange(days);
    const from = new Date(dateRange[0] + 'T00:00:00.000Z');

    const progresses = await this.prisma.goalProgress.findMany({
      where: { userId, date: { gte: from } },
      select: { date: true },
    });

    const countByDate = new Map<string, number>();
    for (const p of progresses) {
      const key = p.date.toISOString().split('T')[0];
      countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
    }

    return dateRange.map((date) => ({ date, completedCount: countByDate.get(date) ?? 0 }));
  }

  private buildDateRange(days: number): string[] {
    const result: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(d.toISOString().split('T')[0]);
    }
    return result;
  }
}
