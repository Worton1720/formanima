import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HabitsService } from '../habits/habits.service';
import { CreateActionDto } from './dto/create-action.dto';

@Injectable()
export class ActionsService {
  constructor(
    private prisma: PrismaService,
    private habits: HabitsService,
  ) {}

  async findAll(habitId: string, userId: string) {
    await this.habits.findOne(habitId, userId);
    return this.prisma.action.findMany({
      where: { habitId },
      orderBy: { order: 'asc' },
    });
  }

  async create(habitId: string, userId: string, dto: CreateActionDto) {
    await this.habits.findOne(habitId, userId);
    return this.prisma.action.create({ data: { ...dto, habitId } });
  }

  async update(habitId: string, actionId: string, userId: string, dto: Partial<CreateActionDto>) {
    await this.habits.findOne(habitId, userId);
    const action = await this.prisma.action.findUnique({ where: { id: actionId } });
    if (!action || action.habitId !== habitId) throw new NotFoundException();
    return this.prisma.action.update({ where: { id: actionId }, data: dto });
  }

  async remove(habitId: string, actionId: string, userId: string) {
    await this.habits.findOne(habitId, userId);
    const action = await this.prisma.action.findUnique({ where: { id: actionId } });
    if (!action || action.habitId !== habitId) throw new NotFoundException();
    return this.prisma.action.delete({ where: { id: actionId } });
  }
}
