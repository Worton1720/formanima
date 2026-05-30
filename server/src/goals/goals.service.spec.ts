import { Test } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  goal: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  goalProgress: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  milestone: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockGamification = {
  recalculate: jest.fn(),
};

describe('GoalsService', () => {
  let service: GoalsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GoalsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GamificationService, useValue: mockGamification },
      ],
    }).compile();
    service = module.get(GoalsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns only active goals for given user', async () => {
      const goals = [{ id: 'g1', userId: 'u1', status: 'active', milestones: [] }];
      mockPrisma.goal.findMany.mockResolvedValue(goals);

      const result = await service.findAll('u1');

      expect(mockPrisma.goal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'u1', status: 'active' } }),
      );
      expect(result).toEqual(goals);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when goal does not exist', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue(null);
      await expect(service.findOne('u1', 'g-missing')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when goal belongs to another user', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({
        id: 'g1',
        userId: 'u2',
        milestones: [],
        progresses: [],
      });
      await expect(service.findOne('u1', 'g1')).rejects.toThrow(ForbiddenException);
    });

    it('returns goal when owner requests it', async () => {
      const goal = { id: 'g1', userId: 'u1', milestones: [], progresses: [] };
      mockPrisma.goal.findUnique.mockResolvedValue(goal);

      const result = await service.findOne('u1', 'g1');
      expect(result).toEqual(goal);
    });
  });

  describe('archive / restore', () => {
    it('archive sets status to archived', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      mockPrisma.goal.update.mockResolvedValue({ id: 'g1', status: 'archived' });

      await service.archive('u1', 'g1');

      expect(mockPrisma.goal.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'archived' } }),
      );
    });

    it('restore sets status to active', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      mockPrisma.goal.update.mockResolvedValue({ id: 'g1', status: 'active' });

      await service.restore('u1', 'g1');

      expect(mockPrisma.goal.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'active' } }),
      );
    });

    it('archive throws NotFoundException if goal not found', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue(null);
      await expect(service.archive('u1', 'g-missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addProgress', () => {
    it('creates new progress entry and calls recalculate', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      mockPrisma.goalProgress.findFirst.mockResolvedValue(null);
      const progress = { id: 'p1', goalId: 'g1', userId: 'u1', date: new Date(), value: 1 };
      mockPrisma.goalProgress.create.mockResolvedValue(progress);
      mockPrisma.goalProgress.aggregate.mockResolvedValue({ _sum: { value: 1 } });
      mockPrisma.goal.update.mockResolvedValue({});
      mockGamification.recalculate.mockResolvedValue(undefined);

      const result = await service.addProgress('u1', 'g1', {
        date: '2026-01-01',
        value: 1,
      });

      expect(mockPrisma.goalProgress.create).toHaveBeenCalled();
      expect(mockGamification.recalculate).toHaveBeenCalledWith('u1');
      expect(result).toEqual(progress);
    });

    it('updates existing progress instead of creating duplicate', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      const existing = { id: 'p1', goalId: 'g1', userId: 'u1', date: new Date(), value: 1 };
      mockPrisma.goalProgress.findFirst.mockResolvedValue(existing);
      const updated = { ...existing, value: 2 };
      mockPrisma.goalProgress.update.mockResolvedValue(updated);
      mockPrisma.goalProgress.aggregate.mockResolvedValue({ _sum: { value: 2 } });
      mockPrisma.goal.update.mockResolvedValue({});
      mockGamification.recalculate.mockResolvedValue(undefined);

      await service.addProgress('u1', 'g1', { date: '2026-01-01', value: 2 });

      expect(mockPrisma.goalProgress.update).toHaveBeenCalled();
      expect(mockPrisma.goalProgress.create).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when progress added to another user goal', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u2' });
      await expect(
        service.addProgress('u1', 'g1', { date: '2026-01-01', value: 1 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('removeProgress', () => {
    it('throws NotFoundException if progress record not found', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      mockPrisma.goalProgress.findFirst.mockResolvedValue(null);

      await expect(service.removeProgress('u1', 'g1', '2026-01-01')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deletes progress entry and calls recalculate', async () => {
      mockPrisma.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      mockPrisma.goalProgress.findFirst.mockResolvedValue({ id: 'p1' });
      mockPrisma.goalProgress.delete.mockResolvedValue({});
      mockPrisma.goalProgress.aggregate.mockResolvedValue({ _sum: { value: 0 } });
      mockPrisma.goal.update.mockResolvedValue({});
      mockGamification.recalculate.mockResolvedValue(undefined);

      await service.removeProgress('u1', 'g1', '2026-01-01');

      expect(mockPrisma.goalProgress.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(mockGamification.recalculate).toHaveBeenCalledWith('u1');
    });
  });
});
