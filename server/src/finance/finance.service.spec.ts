import { Test } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  transaction: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  budget: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  },
  savingsGoal: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  goal: {
    update: jest.fn(),
  },
  $queryRaw: jest.fn(),
};

describe('FinanceService', () => {
  let service: FinanceService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(FinanceService);
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('returns zeros when no transactions', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      const result = await service.getSummary('u1');
      expect(result).toEqual({ income: 0, expense: 0, balance: 0 });
    });

    it('calculates income, expense and balance correctly', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { type: 'income', amount: 5000, category: 'salary', date: new Date() },
        { type: 'expense', amount: 1200, category: 'food', date: new Date() },
        { type: 'expense', amount: 800, category: 'transport', date: new Date() },
      ]);

      const result = await service.getSummary('u1');
      expect(result.income).toBe(5000);
      expect(result.expense).toBe(2000);
      expect(result.balance).toBe(3000);
    });

    it('balance is negative when expenses exceed income', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { type: 'income', amount: 1000, category: 'freelance', date: new Date() },
        { type: 'expense', amount: 1500, category: 'rent', date: new Date() },
      ]);

      const result = await service.getSummary('u1');
      expect(result.balance).toBe(-500);
    });
  });

  describe('createTransaction', () => {
    it('persists transaction with correct data', async () => {
      const tx = {
        id: 't1',
        userId: 'u1',
        type: 'expense',
        amount: 500,
        category: 'food',
        description: 'Lunch',
        date: new Date('2026-01-01'),
        isRecurring: false,
        recurringInterval: null,
      };
      mockPrisma.transaction.create.mockResolvedValue(tx);

      const result = await service.createTransaction('u1', {
        type: 'expense',
        amount: 500,
        category: 'food',
        description: 'Lunch',
        date: '2026-01-01',
      });

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'u1', amount: 500, type: 'expense' }),
        }),
      );
      expect(result).toEqual(tx);
    });
  });

  describe('deleteTransaction', () => {
    it('throws NotFoundException if transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.deleteTransaction('u1', 't-missing')).rejects.toThrow(NotFoundException);
    });

    it('deletes transaction successfully', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 't1', userId: 'u1' });
      mockPrisma.transaction.delete.mockResolvedValue({});

      await service.deleteTransaction('u1', 't1');
      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
    });
  });

  describe('contribute (savings goal)', () => {
    it('throws NotFoundException if savings goal not found', async () => {
      mockPrisma.savingsGoal.findUnique.mockResolvedValue(null);
      await expect(service.contribute('u1', 'sg-missing', { amount: 100 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('increments currentAmount by contribution', async () => {
      const savingsGoal = { id: 'sg1', userId: 'u1', currentAmount: 500, targetAmount: 1000, goalId: null };
      mockPrisma.savingsGoal.findUnique.mockResolvedValue(savingsGoal);
      const updated = { ...savingsGoal, currentAmount: 600 };
      mockPrisma.savingsGoal.update.mockResolvedValue(updated);

      const result = await service.contribute('u1', 'sg1', { amount: 100 });

      expect(mockPrisma.savingsGoal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { currentAmount: { increment: 100 } },
        }),
      );
      expect(result.currentAmount).toBe(600);
    });

    it('marks linked goal as completed when target is reached', async () => {
      const savingsGoal = { id: 'sg1', userId: 'u1', currentAmount: 900, targetAmount: 1000, goalId: 'g1' };
      mockPrisma.savingsGoal.findUnique.mockResolvedValue(savingsGoal);
      const updated = { ...savingsGoal, currentAmount: 1000 };
      mockPrisma.savingsGoal.update.mockResolvedValue(updated);
      mockPrisma.goal.update.mockResolvedValue({});

      await service.contribute('u1', 'sg1', { amount: 100 });

      expect(mockPrisma.goal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'completed' }),
        }),
      );
    });

    it('does not update linked goal when no goalId is set', async () => {
      const savingsGoal = { id: 'sg1', userId: 'u1', currentAmount: 500, targetAmount: 1000, goalId: null };
      mockPrisma.savingsGoal.findUnique.mockResolvedValue(savingsGoal);
      mockPrisma.savingsGoal.update.mockResolvedValue({ ...savingsGoal, currentAmount: 600 });

      await service.contribute('u1', 'sg1', { amount: 100 });

      expect(mockPrisma.goal.update).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryBreakdown', () => {
    it('groups expenses by category and sorts by amount desc', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([
        { type: 'expense', amount: 300, category: 'food', date: new Date() },
        { type: 'expense', amount: 1200, category: 'rent', date: new Date() },
        { type: 'expense', amount: 200, category: 'food', date: new Date() },
        { type: 'income', amount: 5000, category: 'salary', date: new Date() },
      ]);

      const result = await service.getCategoryBreakdown('u1');

      expect(result[0]).toEqual({ category: 'rent', amount: 1200 });
      expect(result[1]).toEqual({ category: 'food', amount: 500 });
      expect(result.find((r) => r.category === 'salary')).toBeUndefined();
    });
  });
});
