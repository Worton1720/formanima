import client from './client';
import type { Budget, CategoryBreakdown, FinanceSummary, MonthlyTrend, SavingsGoal, Transaction } from '../types';

export const financeApi = {
  // Transactions
  getTransactions: (month?: string): Promise<Transaction[]> =>
    client.get<Transaction[]>('/finance/transactions', { params: month ? { month } : {} }).then((r) => r.data),

  getRecurringTransactions: (): Promise<Transaction[]> =>
    client.get<Transaction[]>('/finance/recurring').then((r) => r.data),

  getTrends: (months?: number): Promise<MonthlyTrend[]> =>
    client.get<MonthlyTrend[]>('/finance/trends', { params: months ? { months } : {} }).then((r) => r.data),

  getSummary: (month?: string): Promise<FinanceSummary> =>
    client.get<FinanceSummary>('/finance/summary', { params: month ? { month } : {} }).then((r) => r.data),

  getBreakdown: (month?: string): Promise<CategoryBreakdown[]> =>
    client.get<CategoryBreakdown[]>('/finance/breakdown', { params: month ? { month } : {} }).then((r) => r.data),

  createTransaction: (data: { type: 'income' | 'expense'; amount: number; category: string; description?: string; date: string; isRecurring?: boolean; recurringInterval?: string }): Promise<Transaction> =>
    client.post<Transaction>('/finance/transactions', data).then((r) => r.data),

  deleteTransaction: (id: string): Promise<void> =>
    client.delete(`/finance/transactions/${id}`).then(() => undefined),

  // Budgets
  getBudgets: (month: string): Promise<Budget[]> =>
    client.get<Budget[]>('/finance/budgets', { params: { month } }).then((r) => r.data),

  upsertBudget: (data: { category: string; month: string; amount: number }): Promise<Budget> =>
    client.put<Budget>('/finance/budgets', data).then((r) => r.data),

  deleteBudget: (id: string): Promise<void> =>
    client.delete(`/finance/budgets/${id}`).then(() => undefined),

  // Goals
  getGoals: (): Promise<SavingsGoal[]> =>
    client.get<SavingsGoal[]>('/finance/goals').then((r) => r.data),

  createGoal: (data: { title: string; targetAmount: number; deadline?: string }): Promise<SavingsGoal> =>
    client.post<SavingsGoal>('/finance/goals', data).then((r) => r.data),

  contribute: (id: string, amount: number): Promise<SavingsGoal> =>
    client.put<SavingsGoal>(`/finance/goals/${id}/contribute`, { amount }).then((r) => r.data),

  deleteGoal: (id: string): Promise<void> =>
    client.delete(`/finance/goals/${id}`).then(() => undefined),

  linkGoalToSavingsGoal: (id: string, goalId: string): Promise<SavingsGoal> =>
    client.put<SavingsGoal>(`/finance/goals/${id}`, { goalId }).then((r) => r.data),
};
