import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HabitsService } from '../habits/habits.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class TrackingService {
  constructor(
    private prisma: PrismaService,
    private habits: HabitsService,
    private gamification: GamificationService,
  ) {}

  async complete(userId: string, actionId: string, dateStr: string) {
    const date = new Date(dateStr);
    const completion = await this.prisma.completion.upsert({
      where: { actionId_userId_date: { actionId, userId, date } },
      create: { actionId, userId, date },
      update: {},
    });
    await this.gamification.recalculate(userId);
    const gamification = await this.gamification.getProfile(userId);
    return { completion, gamification };
  }

  async uncomplete(userId: string, actionId: string, dateStr: string) {
    const result = await this.prisma.completion.deleteMany({
      where: { actionId, userId, date: new Date(dateStr) },
    });
    await this.gamification.recalculate(userId);
    const gamification = await this.gamification.getProfile(userId);
    return { completion: result, gamification };
  }

  async getStatusForDate(userId: string, habitId: string, dateStr: string): Promise<Record<string, boolean>> {
    await this.habits.findOne(habitId, userId);
    const date = new Date(dateStr);
    const actions = await this.prisma.action.findMany({ where: { habitId } });
    const actionIds = actions.map((a) => a.id);

    const completions = await this.prisma.completion.findMany({
      where: { userId, actionId: { in: actionIds }, date },
    });

    const completedSet = new Set(completions.map((c) => c.actionId));
    return Object.fromEntries(actionIds.map((id) => [id, completedSet.has(id)]));
  }
}
