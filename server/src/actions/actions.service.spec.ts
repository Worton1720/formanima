import { Test } from '@nestjs/testing';
import { ActionsService } from './actions.service';
import { PrismaService } from '../prisma/prisma.service';
import { HabitsService } from '../habits/habits.service';

const mockPrisma = {
  action: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockHabits = {
  findOne: jest.fn(),
};

describe('ActionsService', () => {
  let service: ActionsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ActionsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: HabitsService, useValue: mockHabits },
      ],
    }).compile();
    service = module.get(ActionsService);
    jest.clearAllMocks();
  });

  it('create calls findOne to verify ownership before creating', async () => {
    mockHabits.findOne.mockResolvedValue({ id: 'h1', userId: 'u1' });
    mockPrisma.action.create.mockResolvedValue({ id: 'a1', title: 'Push-ups', order: 0 });

    await service.create('h1', 'u1', { title: 'Push-ups', order: 0 });

    expect(mockHabits.findOne).toHaveBeenCalledWith('h1', 'u1');
    expect(mockPrisma.action.create).toHaveBeenCalled();
  });
});
