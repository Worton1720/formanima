import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ACHIEVEMENTS } from './achievements.config';

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  private getRank(totalStrikes: number): string {
    if (totalStrikes >= 1500) return 'grandmaster';
    if (totalStrikes >= 500) return 'master';
    if (totalStrikes >= 100) return 'journeyman';
    return 'apprentice';
  }

  private getLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private xpFloor(level: number): number {
    return 100 * (level - 1) * (level - 1);
  }

  async recalculate(userId: string): Promise<void> {
    // 1. Total strikes
    const totalStrikes = await this.prisma.completion.count({ where: { userId } });

    // 2. Load active habits
    const habits = await this.prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { actions: true },
    });

    // 3. Load all completions
    const allCompletions = await this.prisma.completion.findMany({
      where: { userId },
      select: { actionId: true, date: true, completedAt: true },
    });

    // 4. Compute best streak across all habits
    let bestStreak = 0;
    const toDateStr = (d: Date) => d.toISOString().split('T')[0];

    for (const habit of habits) {
      if (habit.actions.length === 0) continue;
      const actionIds = new Set(habit.actions.map((a) => a.id));
      const byDate = new Map<string, Set<string>>();
      for (const c of allCompletions) {
        if (!actionIds.has(c.actionId)) continue;
        const key = toDateStr(c.date);
        if (!byDate.has(key)) byDate.set(key, new Set());
        byDate.get(key)!.add(c.actionId);
      }
      const isCompleteDay = (d: string) => {
        const s = byDate.get(d);
        return s ? [...actionIds].every((id) => s.has(id)) : false;
      };
      let streak = 0;
      for (const d of [...byDate.keys()].sort()) {
        if (isCompleteDay(d)) {
          streak++;
          bestStreak = Math.max(bestStreak, streak);
        } else {
          streak = 0;
        }
      }
    }

    // 5. Perfect days (all active habits with actions completed)
    const habitsWithActions = habits.filter((h) => h.actions.length > 0);
    let perfectDayCount = 0;
    let consecutivePerfectDays = 0;
    if (habitsWithActions.length > 0) {
      const allDates = new Set(allCompletions.map((c) => toDateStr(c.date)));
      const completionByDateAction = new Map<string, Set<string>>();
      for (const c of allCompletions) {
        const key = toDateStr(c.date);
        if (!completionByDateAction.has(key)) completionByDateAction.set(key, new Set());
        completionByDateAction.get(key)!.add(c.actionId);
      }
      const isPerfectDay = (dateStr: string) => {
        const done = completionByDateAction.get(dateStr);
        if (!done) return false;
        return habitsWithActions.every((h) => h.actions.every((a) => done.has(a.id)));
      };
      const sortedDates = [...allDates].sort();
      let streak = 0;
      for (const d of sortedDates) {
        if (isPerfectDay(d)) {
          streak++;
          perfectDayCount++;
        } else {
          streak = 0;
        }
      }
      consecutivePerfectDays = streak;
    }

    // 6. Time-based checks
    const hasEarlyBird = allCompletions.some((c) => c.completedAt.getHours() < 6);
    const hasNightOwl = allCompletions.some((c) => c.completedAt.getHours() >= 23);

    // 7. Already unlocked achievements
    const existingUnlocks = await this.prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(existingUnlocks.map((u) => u.achievementId));

    // 8. Check new achievements
    for (const ach of ACHIEVEMENTS) {
      if (unlockedIds.has(ach.id)) continue;
      let qualifies = false;
      if (ach.type === 'totalStrikes') qualifies = totalStrikes >= (ach.threshold ?? 0);
      else if (ach.type === 'streak') qualifies = bestStreak >= (ach.threshold ?? 0);
      else if (ach.type === 'perfectWeek') qualifies = consecutivePerfectDays >= (ach.threshold ?? 0);
      else if (ach.type === 'timeBased') {
        if (ach.timeHourMax !== undefined) qualifies = hasEarlyBird;
        else if (ach.timeHourMin !== undefined) qualifies = hasNightOwl;
      }
      if (qualifies) {
        await this.prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: ach.id } },
          create: { userId, achievementId: ach.id },
          update: {},
        });
        unlockedIds.add(ach.id);
      }
    }

    // 9. Compute XP
    const achievementXp = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id)).reduce(
      (sum, a) => sum + a.xpReward,
      0,
    );
    const xp = totalStrikes * 10 + perfectDayCount * 50 + achievementXp;

    // 10. Level and rank
    const level = this.getLevel(xp);
    const rank = this.getRank(totalStrikes);

    // 11. Upsert UserRank
    await this.prisma.userRank.upsert({
      where: { userId },
      create: { userId, xp, level, totalStrikes, rank },
      update: { xp, level, totalStrikes, rank },
    });
  }

  async getProfile(userId: string) {
    const rankRecord = await this.prisma.userRank.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
    });
    const unlockedMap = new Map(userAchievements.map((a) => [a.achievementId, a.unlockedAt]));

    const level = rankRecord.level;
    const xp = rankRecord.xp;
    const xpFloorCurrent = 100 * (level - 1) * (level - 1);
    const xpCurrentLevel = xp - xpFloorCurrent;
    const xpToNextLevel = 100 * level;

    return {
      xp,
      level,
      xpCurrentLevel,
      xpToNextLevel,
      totalStrikes: rankRecord.totalStrikes,
      rank: rankRecord.rank,
      achievements: ACHIEVEMENTS.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        xpReward: a.xpReward,
        unlocked: unlockedMap.has(a.id),
        unlockedAt: unlockedMap.get(a.id)?.toISOString() ?? null,
      })),
    };
  }
}
