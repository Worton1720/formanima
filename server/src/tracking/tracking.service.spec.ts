import { Test } from '@nestjs/testing';
import { TrackingService } from './tracking.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  completion: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
    findMany: jest.fn(),
  },
  action: {
    findMany: jest.fn(),
  },
};

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(TrackingService);
    jest.clearAllMocks();
  });

  it('complete creates completion with normalized date', async () => {
    mockPrisma.completion.upsert.mockResolvedValue({ id: 'c1' });
    const date = '2026-03-28';
    await service.complete('u1', 'a1', date);

    const call = mockPrisma.completion.upsert.mock.calls[0][0];
    expect(call.where.actionId_userId_date.date).toBeInstanceOf(Date);
    expect(call.where.actionId_userId_date.actionId).toBe('a1');
  });

  it('getStatusForDate returns completion map for habit actions', async () => {
    mockPrisma.action.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
    mockPrisma.completion.findMany.mockResolvedValue([{ actionId: 'a1' }]);

    const result = await service.getStatusForDate('u1', 'h1', '2026-03-28');
    expect(result).toEqual({ a1: true, a2: false });
  });
});
