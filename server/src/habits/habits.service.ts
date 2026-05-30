import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateActionDto } from './dto/create-action.dto';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { actions: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      include: { actions: { orderBy: { order: 'asc' } } },
    });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();
    return habit;
  }

  create(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: { ...dto, userId },
      include: { actions: true },
    });
  }

  async update(userId: string, habitId: string, dto: UpdateHabitDto) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    return this.prisma.habit.update({
      where: { id: habitId },
      data: dto,
      include: { actions: { orderBy: { order: 'asc' } } },
    });
  }

  async archive(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    return this.prisma.habit.update({
      where: { id: habitId },
      data: { isArchived: true },
    });
  }

  async createAction(userId: string, habitId: string, dto: CreateActionDto) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    return this.prisma.action.create({
      data: { ...dto, habitId },
    });
  }

  async removeAction(userId: string, habitId: string, actionId: string): Promise<void> {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();

    const action = await this.prisma.action.findUnique({ where: { id: actionId } });
    if (!action) throw new NotFoundException('Action not found');
    if (action.habitId !== habitId) throw new ForbiddenException();

    await this.prisma.action.delete({ where: { id: actionId } });
  }
}
