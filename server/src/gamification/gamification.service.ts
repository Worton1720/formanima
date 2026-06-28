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
    // 1. Total strikes = кол-во записей GoalProgress пользователя
    const totalStrikes = await this.prisma.goalProgress.count({ where: { userId } });

    // 2. Загрузить активные цели (только habit-тип нужен для perfectDay/perfectWeek)
    const habitGoals = await this.prisma.goal.findMany({
      where: { userId, status: 'active', type: 'habit' },
    });

    // 3. Загрузить все GoalProgress пользователя
    const allProgresses = await this.prisma.goalProgress.findMany({
      where: { userId },
      select: { goalId: true, milestoneId: true, date: true, completedAt: true, value: true },
    });

    const toDateStr = (d: Date) => d.toISOString().split('T')[0];

    // 4. Streak — день считается выполненным если есть хотя бы одна GoalProgress запись
    const progressDates = new Set(allProgresses.map((p) => toDateStr(p.date)));
    const sortedDates = [...progressDates].sort();
    let bestStreak = 0;
    let streak = 0;
    for (const d of sortedDates) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      // Проверяем непрерывность: если следующая дата не следует за текущей — сброс
      const idx = sortedDates.indexOf(d);
      if (idx < sortedDates.length - 1) {
        const current = new Date(d);
        const next = new Date(sortedDates[idx + 1]);
        const diffDays = (next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays !== 1) streak = 0;
      }
    }

    // 5. Perfect days — день совершенен если есть прогресс по каждой активной habit-цели
    let perfectDayCount = 0;
    let consecutivePerfectDays = 0;
    if (habitGoals.length > 0) {
      const habitGoalIds = new Set(habitGoals.map((g) => g.id));
      // Группируем GoalProgress по дате: Set goalId
      const progressByDate = new Map<string, Set<string>>();
      for (const p of allProgresses) {
        if (!habitGoalIds.has(p.goalId)) continue;
        const key = toDateStr(p.date);
        if (!progressByDate.has(key)) progressByDate.set(key, new Set());
        progressByDate.get(key)!.add(p.goalId);
      }
      const isPerfectDay = (dateStr: string) => {
        const done = progressByDate.get(dateStr);
        if (!done) return false;
        return [...habitGoalIds].every((id) => done.has(id));
      };
      const allHabitDates = new Set<string>();
      for (const p of allProgresses) {
        if (habitGoalIds.has(p.goalId)) allHabitDates.add(toDateStr(p.date));
      }
      const sortedHabitDates = [...allHabitDates].sort();
      let pStreak = 0;
      for (const d of sortedHabitDates) {
        if (isPerfectDay(d)) {
          pStreak++;
          perfectDayCount++;
        } else {
          pStreak = 0;
        }
      }
      consecutivePerfectDays = pStreak;
    }

    // 6. Time-based checks
    const hasEarlyBird = allProgresses.some((p) => p.completedAt.getHours() < 6);
    const hasNightOwl = allProgresses.some((p) => p.completedAt.getHours() >= 23);

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
      } else if (ach.type === 'calorieStreak') {
        const nutritionGoal = await this.prisma.goal.findFirst({
          where: { userId, type: 'nutrition', status: 'active' },
        });
        if (nutritionGoal && nutritionGoal.targetValue !== null) {
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          });
          const progresses = await this.prisma.goalProgress.findMany({
            where: {
              goalId: nutritionGoal.id,
              userId,
              date: { in: last7Days.map((d) => new Date(d)) },
              milestoneId: null,
            },
          });
          const progressByDate = new Map(
            progresses.map((p) => [toDateStr(p.date), p.value]),
          );
          qualifies = last7Days.every((d) => {
            const val = progressByDate.get(d);
            return val !== undefined && val <= nutritionGoal.targetValue!;
          });
        }
      } else if (ach.type === 'savingsGoalCompleted') {
        const result = await this.prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) as count FROM "SavingsGoal"
          WHERE "userId" = ${userId} AND "currentAmount" >= "targetAmount"
        `;
        qualifies = Number(result[0].count) >= (ach.threshold ?? 1);
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
    // Уровень L занимает диапазон XP [100·(L-1)², 100·L²), т.к.
    // level = floor(sqrt(xp/100)) + 1. Ширина диапазона = 100·(2L-1).
    const xpFloorCurrent = 100 * (level - 1) * (level - 1);
    const xpCurrentLevel = xp - xpFloorCurrent;
    const xpToNextLevel = 100 * (2 * level - 1);

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
