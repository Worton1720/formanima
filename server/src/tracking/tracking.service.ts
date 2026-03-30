import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async complete(userId: string, actionId: string, dateStr: string) {
    const date = new Date(dateStr);
    return this.prisma.completion.upsert({
      where: { actionId_userId_date: { actionId, userId, date } },
      create: { actionId, userId, date },
      update: {},
    });
  }

  async uncomplete(userId: string, actionId: string, dateStr: string) {
    const date = new Date(dateStr);
    return this.prisma.completion.deleteMany({
      where: { actionId, userId, date },
    });
  }

  async getStatusForDate(userId: string, habitId: string, dateStr: string): Promise<Record<string, boolean>> {
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
