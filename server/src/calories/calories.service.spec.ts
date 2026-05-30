import { Test } from '@nestjs/testing';
import { CaloriesService } from './calories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  foodEntry: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  calorieProfile: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  goal: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  goalProgress: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('CaloriesService', () => {
  let service: CaloriesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CaloriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(CaloriesService);
    jest.clearAllMocks();
  });

  describe('createEntry', () => {
    it('persists food entry and returns it', async () => {
      const entry = {
        id: 'e1',
        userId: 'u1',
        name: 'Apple',
        mealType: 'breakfast',
        calories: 95,
        protein: 0,
        fat: 0,
        carbs: 25,
        weight: null,
        date: new Date('2026-01-01T00:00:00.000Z'),
        createdAt: new Date(),
      };
      mockPrisma.foodEntry.create.mockResolvedValue(entry);
      mockPrisma.goal.findFirst.mockResolvedValue(null);
      mockPrisma.foodEntry.findMany.mockResolvedValue([entry]);
      mockPrisma.calorieProfile.findUnique.mockResolvedValue(null);

      const result = await service.createEntry('u1', {
        name: 'Apple',
        mealType: 'breakfast',
        calories: 95,
        date: '2026-01-01',
      });

      expect(mockPrisma.foodEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'u1', calories: 95 }),
        }),
      );
      expect(result).toEqual(entry);
    });

    it('syncs with nutrition goal after creating entry', async () => {
      const entry = {
        id: 'e1',
        userId: 'u1',
        calories: 500,
        protein: 0,
        fat: 0,
        carbs: 0,
        date: new Date('2026-01-01T00:00:00.000Z'),
        createdAt: new Date(),
      };
      mockPrisma.foodEntry.create.mockResolvedValue(entry);
      const nutritionGoal = { id: 'g1', userId: 'u1', type: 'nutrition', status: 'active', targetValue: 2000 };
      mockPrisma.goal.findFirst.mockResolvedValue(nutritionGoal);
      mockPrisma.foodEntry.findMany.mockResolvedValue([entry]);
      mockPrisma.calorieProfile.findUnique.mockResolvedValue(null);
      mockPrisma.goalProgress.findFirst.mockResolvedValue(null);
      mockPrisma.goalProgress.create.mockResolvedValue({});
      mockPrisma.goal.update.mockResolvedValue({});

      await service.createEntry('u1', {
        name: 'Lunch',
        mealType: 'lunch',
        calories: 500,
        date: '2026-01-01',
      });

      expect(mockPrisma.goalProgress.create).toHaveBeenCalled();
    });
  });

  describe('deleteEntry', () => {
    it('throws NotFoundException if entry does not belong to user', async () => {
      mockPrisma.foodEntry.findFirst.mockResolvedValue(null);
      await expect(service.deleteEntry('u1', 'e-missing')).rejects.toThrow(NotFoundException);
    });

    it('deletes entry successfully', async () => {
      const entry = { id: 'e1', userId: 'u1', date: new Date('2026-01-01T00:00:00.000Z') };
      mockPrisma.foodEntry.findFirst.mockResolvedValue(entry);
      mockPrisma.foodEntry.delete.mockResolvedValue({});
      mockPrisma.goal.findFirst.mockResolvedValue(null);
      mockPrisma.foodEntry.findMany.mockResolvedValue([]);
      mockPrisma.calorieProfile.findUnique.mockResolvedValue(null);

      await service.deleteEntry('u1', 'e1');
      expect(mockPrisma.foodEntry.delete).toHaveBeenCalledWith({ where: { id: 'e1' } });
    });
  });

  describe('getDailySummary', () => {
    it('returns zeros when no entries for the day', async () => {
      mockPrisma.foodEntry.findMany.mockResolvedValue([]);
      mockPrisma.calorieProfile.findUnique.mockResolvedValue(null);

      const result = await service.getDailySummary('u1', '2026-01-01');
      expect(result.totalCalories).toBe(0);
      expect(result.totalProtein).toBe(0);
    });

    it('sums calories and macros from all entries', async () => {
      const entries = [
        { id: 'e1', calories: 300, protein: 20, fat: 5, carbs: 40, date: new Date('2026-01-01T00:00:00.000Z') },
        { id: 'e2', calories: 200, protein: 10, fat: 8, carbs: 20, date: new Date('2026-01-01T00:00:00.000Z') },
      ];
      mockPrisma.foodEntry.findMany.mockResolvedValue(entries);
      mockPrisma.calorieProfile.findUnique.mockResolvedValue(null);

      const result = await service.getDailySummary('u1', '2026-01-01');
      expect(result.totalCalories).toBe(500);
      expect(result.totalProtein).toBe(30);
      expect(result.totalFat).toBe(13);
      expect(result.totalCarbs).toBe(60);
      expect(result.entries).toHaveLength(2);
    });
  });

  describe('updateProfile', () => {
    it('upserts calorie profile and returns updated record', async () => {
      const profile = {
        userId: 'u1',
        targetCalories: 2200,
        targetProtein: 160,
        targetFat: 70,
        targetCarbs: 260,
        updatedAt: new Date(),
      };
      mockPrisma.calorieProfile.upsert.mockResolvedValue(profile);

      const result = await service.updateProfile('u1', { targetCalories: 2200 });

      expect(mockPrisma.calorieProfile.upsert).toHaveBeenCalled();
      expect(result.targetCalories).toBe(2200);
    });
  });
});
