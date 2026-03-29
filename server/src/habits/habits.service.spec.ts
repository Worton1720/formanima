import { Test } from '@nestjs/testing';
import { HabitsService } from './habits.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  habit: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('HabitsService', () => {
  let service: HabitsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HabitsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(HabitsService);
    jest.clearAllMocks();
  });

  it('findAll returns only user habits', async () => {
    mockPrisma.habit.findMany.mockResolvedValue([{ id: '1', userId: 'u1', title: 'Run' }]);
    const result = await service.findAll('u1');
    expect(mockPrisma.habit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'u1', isArchived: false }) }),
    );
    expect(result).toHaveLength(1);
  });

  it('update throws ForbiddenException if habit belongs to another user', async () => {
    mockPrisma.habit.findUnique.mockResolvedValue({ id: '1', userId: 'other' });
    await expect(service.update('1', 'u1', { title: 'New' })).rejects.toThrow(ForbiddenException);
  });

  it('archive sets isArchived to true', async () => {
    mockPrisma.habit.findUnique.mockResolvedValue({ id: '1', userId: 'u1' });
    mockPrisma.habit.update.mockResolvedValue({ id: '1', isArchived: true });
    await service.archive('1', 'u1');
    expect(mockPrisma.habit.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isArchived: true } }),
    );
  });
});
