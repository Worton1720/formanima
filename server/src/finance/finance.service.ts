import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpsertBudgetDto } from './dto/upsert-budget.dto';
import { ContributeGoalDto, CreateGoalDto } from './dto/create-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { SavingsGoal } from '@prisma/client';

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ── Transactions ──────────────────────────────────────────────────────────

  async getTransactions(userId: string, month?: string) {
    const where: any = { userId };
    if (month) {
      const [year, m] = month.split('-').map(Number);
      where.date = { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) };
    }
    return this.prisma.transaction.findMany({ where, orderBy: { date: 'desc' } });
  }

  async getSummary(userId: string, month?: string) {
    const txs = await this.getTransactions(userId, month);
    const income = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }

  async getCategoryBreakdown(userId: string, month?: string) {
    const txs = await this.getTransactions(userId, month);
    const map = new Map<string, number>();
    for (const t of txs.filter((t) => t.type === 'expense')) {
      map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        amount: dto.amount,
        category: dto.category,
        description: dto.description,
        date: new Date(dto.date),
        isRecurring: dto.isRecurring ?? false,
        recurringInterval: dto.recurringInterval ?? null,
      },
    });
  }

  async deleteTransaction(userId: string, id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx || tx.userId !== userId) throw new NotFoundException();
    await this.prisma.transaction.delete({ where: { id } });
  }

  async getRecurringTransactions(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId, isRecurring: true, recurringParentId: null },
      orderBy: { date: 'desc' },
    });
  }

  async getTrends(userId: string, months: number = 6): Promise<MonthlyTrend[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: since },
      },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    const grouped: Record<string, { income: number; expense: number }> = {};
    for (const t of transactions) {
      const month = t.date.toISOString().slice(0, 7);
      if (!grouped[month]) grouped[month] = { income: 0, expense: 0 };
      if (t.type === 'income') grouped[month].income += t.amount;
      else grouped[month].expense += t.amount;
    }

    return Object.entries(grouped).map(([month, v]) => ({
      month,
      income: v.income,
      expense: v.expense,
      balance: v.income - v.expense,
    }));
  }

  // ── Budgets ───────────────────────────────────────────────────────────────

  async getBudgets(userId: string, month: string) {
    return this.prisma.budget.findMany({ where: { userId, month } });
  }

  async upsertBudget(userId: string, dto: UpsertBudgetDto) {
    return this.prisma.budget.upsert({
      where: { userId_category_month: { userId, category: dto.category, month: dto.month } },
      create: { userId, category: dto.category, month: dto.month, amount: dto.amount },
      update: { amount: dto.amount },
    });
  }

  async deleteBudget(userId: string, id: string) {
    const b = await this.prisma.budget.findUnique({ where: { id } });
    if (!b || b.userId !== userId) throw new NotFoundException();
    await this.prisma.budget.delete({ where: { id } });
  }

  // ── Savings Goals ─────────────────────────────────────────────────────────

  async getGoals(userId: string) {
    return this.prisma.savingsGoal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async createGoal(userId: string, dto: CreateGoalDto) {
    return this.prisma.savingsGoal.create({
      data: { userId, title: dto.title, targetAmount: dto.targetAmount, deadline: dto.deadline ? new Date(dto.deadline) : null },
    });
  }

  async contribute(userId: string, id: string, dto: ContributeGoalDto) {
    const goal = await this.prisma.savingsGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) throw new NotFoundException();
    const updated = await this.prisma.savingsGoal.update({
      where: { id },
      data: { currentAmount: { increment: dto.amount } },
    });
    await this.syncSavingsGoalWithGoal(updated);
    return updated;
  }

  async updateSavingsGoal(userId: string, id: string, dto: UpdateSavingsGoalDto) {
    const goal = await this.prisma.savingsGoal.findUnique({ where: { id } });
    if (!goal || goal.userId !== userId) throw new NotFoundException();
    return this.prisma.savingsGoal.update({
      where: { id },
      data: { goalId: dto.goalId ?? null },
    });
  }

  async syncSavingsGoalWithGoal(savingsGoal: SavingsGoal): Promise<void> {
    if (!savingsGoal.goalId) return;
    await this.prisma.goal.update({
      where: { id: savingsGoal.goalId },
      data: {
        currentValue: savingsGoal.currentAmount,
        status: savingsGoal.currentAmount >= savingsGoal.targetAmount ? 'completed' : 'active',
      },
    });
  }

  async deleteGoal(userId: string, id: string) {
    const g = await this.prisma.savingsGoal.findUnique({ where: { id } });
    if (!g || g.userId !== userId) throw new NotFoundException();
    await this.prisma.savingsGoal.delete({ where: { id } });
  }
}
