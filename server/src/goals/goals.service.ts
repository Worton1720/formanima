import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AddProgressDto } from './dto/add-progress.dto';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private gamification: GamificationService,
  ) {}

  // ─── Goals ───────────────────────────────────────────────────────────────────

  findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId, status: 'active' },
      include: { milestones: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  findArchived(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId, status: 'archived' },
      include: { milestones: { orderBy: { order: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, goalId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        milestones: { orderBy: { order: 'asc' } },
        progresses: { where: { date: today } },
      },
    });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();
    return goal;
  }

  async findToday(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const goals = await this.prisma.goal.findMany({
      where: { userId, status: 'active' },
      include: { milestones: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    const progresses = await this.prisma.goalProgress.findMany({
      where: { userId, date: today },
    });

    return { goals, progresses };
  }

  async create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        ...dto,
        userId,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
      include: { milestones: true },
    });
  }

  async update(userId: string, goalId: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async remove(userId: string, goalId: string): Promise<void> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    await this.prisma.goal.delete({ where: { id: goalId } });
  }

  async archive(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    return this.prisma.goal.update({
      where: { id: goalId },
      data: { status: 'archived' },
    });
  }

  async restore(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    return this.prisma.goal.update({
      where: { id: goalId },
      data: { status: 'active' },
    });
  }

  // ─── Milestones ───────────────────────────────────────────────────────────────

  async getMilestones(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    return this.prisma.milestone.findMany({
      where: { goalId },
      orderBy: { order: 'asc' },
    });
  }

  async createMilestone(userId: string, goalId: string, dto: CreateMilestoneDto) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    return this.prisma.milestone.create({
      data: { ...dto, goalId },
    });
  }

  async updateMilestone(userId: string, goalId: string, milestoneId: string, dto: UpdateMilestoneDto) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    const milestone = await this.prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.goalId !== goalId) throw new ForbiddenException();

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: dto,
    });
  }

  async removeMilestone(userId: string, goalId: string, milestoneId: string): Promise<void> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    const milestone = await this.prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.goalId !== goalId) throw new ForbiddenException();

    await this.prisma.milestone.delete({ where: { id: milestoneId } });
  }

  async completeMilestone(userId: string, goalId: string, milestoneId: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    const milestone = await this.prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.goalId !== goalId) throw new ForbiddenException();

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { isDone: true, doneAt: new Date() },
    });
  }

  // ─── Progress ─────────────────────────────────────────────────────────────────

  async addProgress(userId: string, goalId: string, dto: AddProgressDto) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    const date = new Date(dto.date);

    // QA-FIX: GoalProgress не имеет @@unique с nullable milestoneId (NULL != NULL в PostgreSQL)
    const existing = await this.prisma.goalProgress.findFirst({
      where: {
        goalId,
        userId,
        date,
        milestoneId: dto.milestoneId ?? null,
      },
    });

    let progress;
    if (existing) {
      progress = await this.prisma.goalProgress.update({
        where: { id: existing.id },
        data: {
          value: dto.value ?? 1,
          note: dto.note,
          completedAt: new Date(),
        },
      });
    } else {
      progress = await this.prisma.goalProgress.create({
        data: {
          goalId,
          userId,
          date,
          value: dto.value ?? 1,
          milestoneId: dto.milestoneId ?? null,
          note: dto.note,
        },
      });
    }

    // Обновляем currentValue цели
    await this.updateGoalCurrentValue(goalId);

    await this.gamification.recalculate(userId);
    return progress;
  }

  async removeProgress(userId: string, goalId: string, dateStr: string, milestoneId?: string): Promise<void> {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    const date = new Date(dateStr);

    // QA-FIX: использовать findFirst из-за nullable milestoneId
    const existing = await this.prisma.goalProgress.findFirst({
      where: {
        goalId,
        userId,
        date,
        milestoneId: milestoneId ?? null,
      },
    });

    if (!existing) throw new NotFoundException('Progress record not found');

    await this.prisma.goalProgress.delete({ where: { id: existing.id } });

    // Обновляем currentValue цели
    await this.updateGoalCurrentValue(goalId);

    await this.gamification.recalculate(userId);
  }

  async getProgress(userId: string, goalId: string, startDate?: string, endDate?: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();

    const where: Prisma.GoalProgressWhereInput = { goalId, userId };
    if (startDate) where.date = { ...(where.date as object || {}), gte: new Date(startDate) };
    if (endDate) where.date = { ...(where.date as object || {}), lte: new Date(endDate) };

    return this.prisma.goalProgress.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async updateGoalCurrentValue(goalId: string): Promise<void> {
    const result = await this.prisma.goalProgress.aggregate({
      where: { goalId },
      _sum: { value: true },
    });
    const currentValue = result._sum.value ?? 0;
    await this.prisma.goal.update({
      where: { id: goalId },
      data: { currentValue },
    });
  }
}
