import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HabitsService } from '../habits/habits.service';

@Injectable()
export class StatsService {
  constructor(
    private prisma: PrismaService,
    private habits: HabitsService,
  ) {}

  async getStreak(habitId: string, userId: string): Promise<{ current: number; best: number }> {
    await this.habits.findOne(habitId, userId);
    const actions = await this.prisma.action.findMany({ where: { habitId } });
    if (actions.length === 0) return { current: 0, best: 0 };

    const actionIds = actions.map((a) => a.id);
    const completions = await this.prisma.completion.findMany({
      where: { userId, actionId: { in: actionIds } },
      select: { date: true, actionId: true },
      orderBy: { date: 'desc' },
    });

    // Group completions by date
    const byDate = new Map<string, Set<string>>();
    for (const c of completions) {
      const key = c.date.toISOString().split('T')[0];
      if (!byDate.has(key)) byDate.set(key, new Set());
      byDate.get(key)!.add(c.actionId);
    }

    const isCompleteDay = (dateStr: string) => {
      const s = byDate.get(dateStr);
      return s ? actionIds.every((id) => s.has(id)) : false;
    };

    const toStr = (d: Date) => d.toISOString().split('T')[0];
    const today = toStr(new Date());
    const dayBefore = (s: string) => {
      const d = new Date(s);
      d.setDate(d.getDate() - 1);
      return toStr(d);
    };

    // Current streak
    let current = 0;
    let day = today;
    while (isCompleteDay(day)) {
      current++;
      day = dayBefore(day);
    }

    // Best streak
    let best = 0;
    let streak = 0;
    const allDates = [...byDate.keys()].sort();
    for (const d of allDates) {
      if (isCompleteDay(d)) {
        streak++;
        best = Math.max(best, streak);
      } else {
        streak = 0;
      }
    }

    return { current, best };
  }

  async getOverview(userId: string, days: number = 7) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { actions: true },
    });

    const results: { habitId: string; title: string; completionRate: number; completedDays: number; totalDays: number }[] = [];
    for (const habit of habits) {
      if (habit.actions.length === 0) continue;
      const actionIds = habit.actions.map((a) => a.id);

      const from = new Date();
      from.setDate(from.getDate() - days + 1);

      const completions = await this.prisma.completion.findMany({
        where: { userId, actionId: { in: actionIds }, date: { gte: from } },
        select: { date: true, actionId: true },
      });

      const byDate = new Map<string, Set<string>>();
      for (const c of completions) {
        const key = c.date.toISOString().split('T')[0];
        if (!byDate.has(key)) byDate.set(key, new Set());
        byDate.get(key)!.add(c.actionId);
      }

      let completedDays = 0;
      for (const [, set] of byDate) {
        if (actionIds.every((id) => set.has(id))) completedDays++;
      }

      results.push({
        habitId: habit.id,
        title: habit.title,
        completionRate: Math.round((completedDays / days) * 100),
        completedDays,
        totalDays: days,
      });
    }

    return results;
  }
}
