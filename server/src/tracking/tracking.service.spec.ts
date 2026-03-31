import { Test } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../prisma/prisma.service';
import { HabitsService } from '../habits/habits.service';
import { GamificationService } from '../gamification/gamification.service';

const mockPrisma = {
  completion: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  action: {
    findMany: jest.fn(),
  },
  habit: { findMany: jest.fn() },
  userAchievement: { findMany: jest.fn(), upsert: jest.fn() },
  userRank: { upsert: jest.fn() },
};

const mockHabits = { findOne: jest.fn() };

const mockGamification = { recalculate: jest.fn(), getProfile: jest.fn() };

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: HabitsService, useValue: mockHabits },
        { provide: GamificationService, useValue: mockGamification },
      ],
    }).compile();
    service = module.get(TrackingService);
    jest.clearAllMocks();
  });

  it('complete creates completion with normalized date', async () => {
    mockPrisma.completion.upsert.mockResolvedValue({ id: 'c1' });
    mockPrisma.completion.count.mockResolvedValue(1);
    mockPrisma.habit.findMany.mockResolvedValue([]);
    mockPrisma.completion.findMany.mockResolvedValue([]);
    mockPrisma.userAchievement.findMany.mockResolvedValue([]);
    mockPrisma.userAchievement.upsert.mockResolvedValue({});
    mockPrisma.userRank.upsert.mockResolvedValue({ xp: 10, level: 1, totalStrikes: 1, rank: 'apprentice' });
    mockGamification.recalculate.mockResolvedValue(undefined);
    mockGamification.getProfile.mockResolvedValue({ xp: 10, level: 1, totalStrikes: 1, rank: 'apprentice', achievements: [] });

    const date = '2026-03-28';
    await service.complete('u1', 'a1', date);

    const call = mockPrisma.completion.upsert.mock.calls[0][0];
    expect(call.where.actionId_userId_date.date).toBeInstanceOf(Date);
    expect(call.where.actionId_userId_date.actionId).toBe('a1');
  });

  it('getStatusForDate returns completion map for habit actions', async () => {
    mockHabits.findOne.mockResolvedValue({ id: 'h1', userId: 'u1' });
    mockPrisma.action.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
    mockPrisma.completion.findMany.mockResolvedValue([{ actionId: 'a1' }]);

    const result = await service.getStatusForDate('u1', 'h1', '2026-03-28');
    expect(result).toEqual({ a1: true, a2: false });
  });
});
