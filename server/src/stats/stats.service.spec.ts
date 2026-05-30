import { Test } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';
import { GoalsService } from '../goals/goals.service';

const mockPrisma = {
  goal: {
    findMany: jest.fn(),
  },
  goalProgress: {
    findMany: jest.fn(),
  },
};

const mockGoals = {
  findOne: jest.fn(),
};

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: GoalsService, useValue: mockGoals },
      ],
    }).compile();
    service = module.get(StatsService);
    jest.clearAllMocks();
  });

  describe('getStreak', () => {
    it('returns zeros when no progress exists', async () => {
      mockGoals.findOne.mockResolvedValue({ id: 'g1' });
      mockPrisma.goalProgress.findMany.mockResolvedValue([]);

      const result = await service.getStreak('g1', 'u1');
      expect(result).toEqual({ current: 0, best: 0 });
    });

    it('computes bestStreak=3 for three consecutive dates', async () => {
      mockGoals.findOne.mockResolvedValue({ id: 'g1' });
      const dates = ['2026-01-01', '2026-01-02', '2026-01-03'];
      mockPrisma.goalProgress.findMany.mockResolvedValue(
        dates.map((d) => ({ date: new Date(d + 'T00:00:00.000Z') })),
      );

      const result = await service.getStreak('g1', 'u1');
      expect(result.best).toBe(3);
    });

    it('resets streak on gap in dates', async () => {
      mockGoals.findOne.mockResolvedValue({ id: 'g1' });
      const dates = ['2026-01-01', '2026-01-02', '2026-01-05'];
      mockPrisma.goalProgress.findMany.mockResolvedValue(
        dates.map((d) => ({ date: new Date(d + 'T00:00:00.000Z') })),
      );

      const result = await service.getStreak('g1', 'u1');
      expect(result.best).toBe(2);
    });

    it('deduplicates same-day entries when counting best streak', async () => {
      mockGoals.findOne.mockResolvedValue({ id: 'g1' });
      // Two entries on same day should count as one day
      mockPrisma.goalProgress.findMany.mockResolvedValue([
        { date: new Date('2026-01-01T00:00:00.000Z') },
        { date: new Date('2026-01-01T12:00:00.000Z') },
        { date: new Date('2026-01-02T00:00:00.000Z') },
      ]);

      const result = await service.getStreak('g1', 'u1');
      expect(result.best).toBe(2);
    });
  });

  describe('getOverview', () => {
    it('returns empty array when no habit goals exist', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([]);

      const result = await service.getOverview('u1', 7);
      expect(result).toEqual([]);
    });

    it('calculates completionRate=100 when all 7 days have progress', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([{ id: 'g1', title: 'Morning run' }]);
      const today = new Date();
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        return { date: d };
      });
      mockPrisma.goalProgress.findMany.mockResolvedValue(dates);

      const result = await service.getOverview('u1', 7);
      expect(result[0].completionRate).toBe(100);
      expect(result[0].habitId).toBe('g1');
      expect(result[0].completedDays).toBe(7);
    });

    it('calculates completionRate=0 when no progress in range', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([{ id: 'g1', title: 'Read' }]);
      mockPrisma.goalProgress.findMany.mockResolvedValue([]);

      const result = await service.getOverview('u1', 7);
      expect(result[0].completionRate).toBe(0);
      expect(result[0].completedDays).toBe(0);
    });
  });

  describe('getHeatmap', () => {
    it('returns array of correct length', async () => {
      mockGoals.findOne.mockResolvedValue({ id: 'g1' });
      mockPrisma.goalProgress.findMany.mockResolvedValue([]);

      const result = await service.getHeatmap('g1', 'u1', 7);
      expect(result).toHaveLength(7);
    });

    it('marks date as completed when progress exists for that day', async () => {
      mockGoals.findOne.mockResolvedValue({ id: 'g1' });
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      mockPrisma.goalProgress.findMany.mockResolvedValue([{ date: yesterday }]);

      const result = await service.getHeatmap('g1', 'u1', 7);
      const yStr = yesterday.toISOString().split('T')[0];
      const entry = result.find((r) => r.date === yStr);
      expect(entry?.completed).toBe(true);
    });

    it('marks all dates as not completed when no progress', async () => {
      mockGoals.findOne.mockResolvedValue({ id: 'g1' });
      mockPrisma.goalProgress.findMany.mockResolvedValue([]);

      const result = await service.getHeatmap('g1', 'u1', 7);
      expect(result.every((r) => r.completed === false)).toBe(true);
    });
  });
});
