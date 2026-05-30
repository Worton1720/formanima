import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { goals: true } },
        rank: { select: { totalStrikes: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      goalsCount: u._count.goals,
      strikesCount: u.rank?.totalStrikes ?? 0,
    }));
  }

  async blockUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const newRole = user.role === 'blocked' ? 'user' : 'blocked';
    return this.prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, email: true, role: true },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { deleted: true };
  }

  async getSystemStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr + 'T00:00:00.000Z');

    const [totalUsers, totalGoals, totalStrikes, activeTodayGroups] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.goal.count({ where: { status: 'active' } }),
      this.prisma.goalProgress.count(),
      this.prisma.goalProgress.groupBy({
        by: ['userId'],
        where: { date: { gte: today } },
      }),
    ]);

    return {
      totalUsers,
      totalGoals,
      totalCompletions: totalStrikes,
      activeToday: activeTodayGroups.length,
    };
  }
}
