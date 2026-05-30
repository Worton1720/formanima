import { Test } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  goalProgress: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  goal: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
  },
  userAchievement: {
    findMany: jest.fn(),
    upsert: jest.fn(),
  },
  userRank: {
    upsert: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('GamificationService', () => {
  let service: GamificationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(GamificationService);
    jest.clearAllMocks();
  });

  it('getProfile returns rank=apprentice for 0 totalStrikes', async () => {
    mockPrisma.userRank.upsert.mockResolvedValue({
      xp: 0,
      level: 1,
      totalStrikes: 0,
      rank: 'apprentice',
    });
    mockPrisma.userAchievement.findMany.mockResolvedValue([]);

    const profile = await service.getProfile('u1');

    expect(profile.rank).toBe('apprentice');
    expect(profile.xp).toBe(0);
    expect(profile.level).toBe(1);
    expect(profile.totalStrikes).toBe(0);
  });

  it('getRank returns correct rank for various strike counts', () => {
    expect((service as any).getRank(99)).toBe('apprentice');
    expect((service as any).getRank(100)).toBe('journeyman');
    expect((service as any).getRank(500)).toBe('master');
    expect((service as any).getRank(1500)).toBe('grandmaster');
  });

  it('getLevel returns correct level for various XP values', () => {
    expect((service as any).getLevel(0)).toBe(1);
    expect((service as any).getLevel(99)).toBe(1);
    expect((service as any).getLevel(100)).toBe(2);
    expect((service as any).getLevel(399)).toBe(2);
    expect((service as any).getLevel(400)).toBe(3);
  });

  it('recalculate unlocks ACH-001 when totalStrikes=1', async () => {
    mockPrisma.goalProgress.count.mockResolvedValue(1);
    mockPrisma.goal.findMany.mockResolvedValue([]);
    mockPrisma.goal.findFirst.mockResolvedValue(null);
    mockPrisma.goalProgress.findMany.mockResolvedValue([
      { goalId: 'g1', milestoneId: null, date: new Date(), completedAt: new Date(), value: 1 },
    ]);
    mockPrisma.userAchievement.findMany.mockResolvedValue([]);
    mockPrisma.userAchievement.upsert.mockResolvedValue({});
    mockPrisma.$queryRaw.mockResolvedValue([{ count: BigInt(0) }]);
    mockPrisma.userRank.upsert.mockResolvedValue({
      xp: 20,
      level: 1,
      totalStrikes: 1,
      rank: 'apprentice',
    });

    await service.recalculate('u1');

    const upsertCalls = mockPrisma.userAchievement.upsert.mock.calls;
    const unlockedIds = upsertCalls.map((call: any[]) => call[0].create.achievementId);
    expect(unlockedIds).toContain('ACH-001');
  });
});
