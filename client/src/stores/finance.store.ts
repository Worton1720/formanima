import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { financeApi } from '../api/finance.api';
import type { Budget, CategoryBreakdown, FinanceSummary, MonthlyTrend, SavingsGoal, Transaction } from '../types';

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>([]);
  const summary = ref<FinanceSummary>({ income: 0, expense: 0, balance: 0 });
  const breakdown = ref<CategoryBreakdown[]>([]);
  const budgets = ref<Budget[]>([]);
  const goals = ref<SavingsGoal[]>([]);
  const recurringTransactions = ref<Transaction[]>([]);
  const trends = ref<MonthlyTrend[]>([]);
  const trendsLoading = ref(false);
  const loading = ref(false);
  const currentMonth = ref(new Date().toISOString().slice(0, 7));

  const grouped = computed(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of transactions.value) {
      const day = tx.date.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(tx);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  });

  async function load(month?: string) {
    if (month) currentMonth.value = month;
    loading.value = true;
    try {
      [transactions.value, summary.value, breakdown.value, budgets.value] = await Promise.all([
        financeApi.getTransactions(currentMonth.value),
        financeApi.getSummary(currentMonth.value),
        financeApi.getBreakdown(currentMonth.value),
        financeApi.getBudgets(currentMonth.value),
      ]);
    } finally {
      loading.value = false;
    }
  }

  async function loadGoals() {
    goals.value = await financeApi.getGoals();
  }

  async function fetchRecurringTransactions(): Promise<void> {
    recurringTransactions.value = await financeApi.getRecurringTransactions();
  }

  async function fetchTrends(months?: number): Promise<void> {
    trendsLoading.value = true;
    try {
      trends.value = await financeApi.getTrends(months);
    } finally {
      trendsLoading.value = false;
    }
  }

  async function linkGoalToSavingsGoal(savingsGoalId: string, goalId: string): Promise<void> {
    const updated = await financeApi.linkGoalToSavingsGoal(savingsGoalId, goalId);
    const idx = goals.value.findIndex((g) => g.id === savingsGoalId);
    if (idx >= 0) goals.value[idx] = updated;
  }

  async function addTransaction(data: Parameters<typeof financeApi.createTransaction>[0]) {
    const tx = await financeApi.createTransaction(data);
    transactions.value.unshift(tx);
    if (tx.type === 'income') {
      summary.value.income += tx.amount;
      breakdown.value; // recalc via reload
    } else {
      summary.value.expense += tx.amount;
      const entry = breakdown.value.find((b) => b.category === tx.category);
      if (entry) entry.amount += tx.amount;
      else breakdown.value.unshift({ category: tx.category, amount: tx.amount });
      breakdown.value.sort((a, b) => b.amount - a.amount);
    }
    summary.value.balance = summary.value.income - summary.value.expense;
    return tx;
  }

  async function removeTransaction(id: string) {
    const tx = transactions.value.find((t) => t.id === id);
    if (!tx) return;
    await financeApi.deleteTransaction(id);
    transactions.value = transactions.value.filter((t) => t.id !== id);
    if (tx.type === 'income') summary.value.income -= tx.amount;
    else {
      summary.value.expense -= tx.amount;
      const entry = breakdown.value.find((b) => b.category === tx.category);
      if (entry) entry.amount = Math.max(0, entry.amount - tx.amount);
    }
    summary.value.balance = summary.value.income - summary.value.expense;
  }

  async function upsertBudget(data: { category: string; amount: number }) {
    const b = await financeApi.upsertBudget({ ...data, month: currentMonth.value });
    const idx = budgets.value.findIndex((x) => x.id === b.id);
    if (idx >= 0) budgets.value[idx] = b;
    else budgets.value.push(b);
    return b;
  }

  async function removeBudget(id: string) {
    await financeApi.deleteBudget(id);
    budgets.value = budgets.value.filter((b) => b.id !== id);
  }

  async function addGoal(data: { title: string; targetAmount: number; deadline?: string }) {
    const g = await financeApi.createGoal(data);
    goals.value.unshift(g);
    return g;
  }

  async function contributeToGoal(id: string, amount: number) {
    const updated = await financeApi.contribute(id, amount);
    const idx = goals.value.findIndex((g) => g.id === id);
    if (idx >= 0) goals.value[idx] = updated;
    return updated;
  }

  async function removeGoal(id: string) {
    await financeApi.deleteGoal(id);
    goals.value = goals.value.filter((g) => g.id !== id);
  }

  return {
    transactions, summary, breakdown, budgets, goals,
    recurringTransactions, trends, trendsLoading,
    loading, currentMonth, grouped,
    load, loadGoals, addTransaction, removeTransaction,
    upsertBudget, removeBudget, addGoal, contributeToGoal, removeGoal,
    fetchRecurringTransactions, fetchTrends, linkGoalToSavingsGoal,
  };
});
