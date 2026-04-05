import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

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

  findArchived(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId, isArchived: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
      include: { actions: { orderBy: { order: 'asc' } } },
    });
    if (!habit) throw new NotFoundException('Habit not found');
    if (habit.userId !== userId) throw new ForbiddenException();
    return habit;
  }

  async create(userId: string, dto: CreateHabitDto) {
    const count = await this.prisma.habit.count({
      where: { userId, isArchived: false },
    });
    if (count >= 10) {
      throw new BadRequestException('Habit limit reached (maximum 10 active habits)');
    }
    return this.prisma.habit.create({
      data: { ...dto, userId },
      include: { actions: true },
    });
  }

  async update(id: string, userId: string, dto: UpdateHabitDto) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException();
    if (habit.userId !== userId) throw new ForbiddenException();
    return this.prisma.habit.update({ where: { id }, data: dto });
  }

  async archive(id: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException();
    if (habit.userId !== userId) throw new ForbiddenException();
    return this.prisma.habit.update({ where: { id }, data: { isArchived: true } });
  }

  async restore(id: string, userId: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id } });
    if (!habit) throw new NotFoundException();
    if (habit.userId !== userId) throw new ForbiddenException();
    return this.prisma.habit.update({ where: { id }, data: { isArchived: false } });
  }
}
