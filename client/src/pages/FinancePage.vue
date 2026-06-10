<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">

    <!-- Header + month nav -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Финансы</h1>
      <div class="flex items-center gap-1">
        <button class="p-1.5 rounded-lg" style="color:rgba(168,153,124,0.82);" @click="prevMonth"><ChevronLeft class="w-5 h-5"/></button>
        <span class="text-sm font-medium w-28 text-center">{{ monthLabel }}</span>
        <button class="p-1.5 rounded-lg" style="color:rgba(168,153,124,0.82);" @click="nextMonth"><ChevronRight class="w-5 h-5"/></button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-3 mb-5">
      <div class="rounded-xl p-3 text-center" style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.2);">
        <p class="text-base font-bold" style="color:#86a861;">+{{ fmt(store.summary.income) }}</p>
        <p class="text-xs mt-0.5" style="color:rgba(168,153,124,0.82);">Доходы</p>
      </div>
      <div class="rounded-xl p-3 text-center" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);">
        <p class="text-base font-bold" style="color:#d6452b;">-{{ fmt(store.summary.expense) }}</p>
        <p class="text-xs mt-0.5" style="color:rgba(168,153,124,0.82);">Расходы</p>
      </div>
      <div class="rounded-xl p-3 text-center"
        :style="store.summary.balance >= 0
          ? 'background:rgba(226,83,43,0.1);border:1px solid rgba(226,83,43,0.2);'
          : 'background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);'">
        <p class="text-base font-bold" :style="store.summary.balance >= 0 ? 'color:#e2532b;' : 'color:#d6452b;'">
          {{ store.summary.balance >= 0 ? '+' : '-' }}{{ fmt(store.summary.balance) }}
        </p>
        <p class="text-xs mt-0.5" style="color:rgba(168,153,124,0.82);">Баланс</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex rounded-xl overflow-hidden border mb-5" style="border-color:rgba(243,234,214,0.10);">
      <button
        v-for="tab in TABS" :key="tab.id"
        class="flex-1 py-2 text-xs font-medium transition-colors"
        :style="activeTab === tab.id
          ? 'background:#e2532b;color:#fff;'
          : 'background:transparent;color:rgba(168,153,124,0.82);'"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </div>

    <div v-if="store.loading" class="flex justify-center py-8"><UiSpinner /></div>

    <template v-else>

      <!-- ═══ TAB: Транзакции ═══ -->
      <template v-if="activeTab === 'tx'">
        <div class="flex justify-end mb-3">
          <UiButton variant="tonal" size="sm" @click="showAddTx = true">
            <Plus class="w-4 h-4 mr-1"/>Добавить
          </UiButton>
        </div>

        <div v-if="!store.transactions.length" class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color:rgba(243,234,214,0.3);">
          <Wallet class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
          <p class="font-medium mb-1">Нет транзакций</p>
          <p class="text-sm">Добавь первый доход или расход</p>
        </div>

        <div v-for="[day, txs] in store.grouped" :key="day" class="mb-4">
          <p class="text-xs font-medium mb-2 px-1" style="color:rgba(168,153,124,0.62);">{{ formatDay(day) }}</p>
          <div class="flex flex-col gap-2">
            <div v-for="tx in txs" :key="tx.id"
              class="flex items-center gap-3 px-4 py-3 rounded-xl"
              style="background:#211a12;border:1px solid rgba(243,234,214,0.10);">
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                :style="tx.type==='income' ? 'background:rgba(34,197,94,0.15);' : 'background:rgba(239,68,68,0.15);'">
                {{ catIcon(tx.category) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ tx.category }}</p>
                <p v-if="tx.description" class="text-xs truncate" style="color:rgba(168,153,124,0.62);">{{ tx.description }}</p>
              </div>
              <p class="text-sm font-semibold flex-shrink-0"
                :style="tx.type==='income' ? 'color:#86a861;' : 'color:#d6452b;'">
                {{ tx.type==='income' ? '+' : '-' }}{{ fmt(tx.amount) }}
              </p>
              <button class="p-1" @click="removeTx(tx.id)">
                <Trash2 class="w-4 h-4" style="color:rgba(243,234,214,0.25);"/>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══ TAB: Аналитика ═══ -->
      <template v-if="activeTab === 'analytics'">
        <div v-if="!store.breakdown.length" class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color:rgba(243,234,214,0.3);">
          <BarChart3 class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
          <p class="font-medium">Нет данных за этот месяц</p>
        </div>
        <template v-else>
          <!-- Bar chart -->
          <div class="rounded-2xl p-4 mb-4" style="background:#211a12;border:1px solid rgba(243,234,214,0.10);">
            <p class="text-sm font-medium mb-3">Расходы по категориям</p>
            <canvas ref="chartRef" height="160"/>
          </div>
          <!-- Category list -->
          <div class="flex flex-col gap-2">
            <div v-for="item in store.breakdown" :key="item.category"
              class="flex items-center gap-3 px-4 py-3 rounded-xl"
              style="background:#211a12;border:1px solid rgba(243,234,214,0.10);">
              <span class="text-lg flex-shrink-0">{{ catIcon(item.category) }}</span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between mb-1">
                  <p class="text-sm font-medium">{{ item.category }}</p>
                  <p class="text-sm font-semibold" style="color:#d6452b;">{{ fmt(item.amount) }}</p>
                </div>
                <div class="rounded-full overflow-hidden" style="background:rgba(243,234,214,0.10);height:4px;">
                  <div class="h-full rounded-full" style="background:#e2532b;transition:width 0.3s;"
                    :style="{width: pct(item.amount) + '%'}"/>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- ═══ TAB: Бюджет ═══ -->
      <template v-if="activeTab === 'budget'">
        <div class="flex justify-end mb-3">
          <UiButton variant="tonal" size="sm" @click="showAddBudget = true">
            <Plus class="w-4 h-4 mr-1"/>Установить лимит
          </UiButton>
        </div>

        <div v-if="!store.budgets.length" class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color:rgba(243,234,214,0.3);">
          <Target class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
          <p class="font-medium mb-1">Нет бюджетов</p>
          <p class="text-sm">Установи лимиты расходов по категориям</p>
        </div>

        <div class="flex flex-col gap-3">
          <div v-for="b in store.budgets" :key="b.id"
            class="px-4 py-3 rounded-xl"
            style="background:#211a12;border:1px solid rgba(243,234,214,0.10);">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-base">{{ catIcon(b.category) }}</span>
                <p class="text-sm font-medium">{{ b.category }}</p>
              </div>
              <div class="flex items-center gap-2">
                <p class="text-sm" :style="spentFor(b.category) > b.amount ? 'color:#d6452b;' : 'color:rgba(168,153,124,0.82);'">
                  {{ fmt(spentFor(b.category)) }} / {{ fmt(b.amount) }}
                </p>
                <button @click="removeBudget(b.id)"><Trash2 class="w-3.5 h-3.5" style="color:rgba(243,234,214,0.25);"/></button>
              </div>
            </div>
            <div class="rounded-full overflow-hidden" style="background:rgba(243,234,214,0.10);height:6px;">
              <div class="h-full rounded-full transition-all"
                :style="{
                  width: Math.min(100, spentFor(b.category) / b.amount * 100) + '%',
                  background: spentFor(b.category) > b.amount ? '#d6452b' : '#e2532b'
                }"/>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══ TAB: Тренды ═══ -->
      <template v-if="activeTab === 'trends'">
        <div v-if="store.trendsLoading" class="flex justify-center py-8"><UiSpinner /></div>
        <div v-else-if="!store.trends.length" class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color:rgba(243,234,214,0.3);">
          <TrendingUp class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
          <p class="font-medium mb-1">Нет данных за последние месяцы</p>
          <p class="text-sm">Добавь транзакции, чтобы увидеть тренды</p>
        </div>
        <template v-else>
          <p class="text-xs mb-3" style="color:rgba(168,153,124,0.62);">Последние {{ store.trends.length }} мес.</p>
          <div class="rounded-2xl overflow-hidden" style="background:#211a12;border:1px solid rgba(243,234,214,0.10);">
            <!-- Header row -->
            <div class="grid grid-cols-4 px-4 py-2 text-xs font-medium" style="color:rgba(168,153,124,0.62);border-bottom:1px solid rgba(243,234,214,0.06);">
              <span>Месяц</span>
              <span class="text-right" style="color:#86a861;">Доход</span>
              <span class="text-right" style="color:#d6452b;">Расход</span>
              <span class="text-right">Баланс</span>
            </div>
            <div v-for="(t, i) in store.trends" :key="t.month"
              class="grid grid-cols-4 px-4 py-3 text-sm"
              :style="i < store.trends.length - 1 ? 'border-bottom:1px solid rgba(243,234,214,0.04);' : ''">
              <span class="font-medium">{{ t.month }}</span>
              <span class="text-right" style="color:#86a861;">+{{ fmt(t.income) }}</span>
              <span class="text-right" style="color:#d6452b;">-{{ fmt(t.expense) }}</span>
              <span class="text-right font-semibold" :style="t.balance >= 0 ? 'color:#e2532b;' : 'color:#d6452b;'">
                {{ t.balance >= 0 ? '+' : '-' }}{{ fmt(t.balance) }}
              </span>
            </div>
          </div>
        </template>
      </template>

      <!-- ═══ TAB: Рекуррентные ═══ -->
      <template v-if="activeTab === 'recurring'">
        <div v-if="!store.recurringTransactions.length" class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color:rgba(243,234,214,0.3);">
          <Repeat class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
          <p class="font-medium mb-1">Нет регулярных транзакций</p>
          <p class="text-sm">Отметь транзакцию как регулярную при создании</p>
        </div>
        <div v-else class="flex flex-col gap-2">
          <div v-for="tx in store.recurringTransactions" :key="tx.id"
            class="flex items-center gap-3 px-4 py-3 rounded-xl"
            style="background:#211a12;border:1px solid rgba(243,234,214,0.10);">
            <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base"
              :style="tx.type==='income' ? 'background:rgba(34,197,94,0.15);' : 'background:rgba(239,68,68,0.15);'">
              {{ catIcon(tx.category) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ tx.category }}</p>
              <p class="text-xs mt-0.5" style="color:rgba(168,153,124,0.62);">
                {{ intervalLabel(tx.recurringInterval) }}
                <span v-if="tx.description"> · {{ tx.description }}</span>
              </p>
            </div>
            <p class="text-sm font-semibold flex-shrink-0"
              :style="tx.type==='income' ? 'color:#86a861;' : 'color:#d6452b;'">
              {{ tx.type==='income' ? '+' : '-' }}{{ fmt(tx.amount) }}
            </p>
          </div>
        </div>
      </template>

      <!-- ═══ TAB: Цели ═══ -->
      <template v-if="activeTab === 'goals'">
        <div class="flex justify-end mb-3">
          <UiButton variant="tonal" size="sm" @click="showAddGoal = true">
            <Plus class="w-4 h-4 mr-1"/>Новая цель
          </UiButton>
        </div>

        <div v-if="!store.goals.length" class="flex-1 flex flex-col items-center justify-center text-center py-12" style="color:rgba(243,234,214,0.3);">
          <PiggyBank class="w-12 h-12 mb-4" style="color: rgba(243,234,214,0.18);" />
          <p class="font-medium mb-1">Нет целей накопления</p>
          <p class="text-sm">Создай цель и откладывай к ней</p>
        </div>

        <div class="flex flex-col gap-3">
          <div v-for="g in store.goals" :key="g.id"
            class="px-4 py-4 rounded-xl"
            style="background:#211a12;border:1px solid rgba(243,234,214,0.10);">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-sm font-semibold">{{ g.title }}</p>
                <p v-if="g.deadline" class="text-xs mt-0.5" style="color:rgba(168,153,124,0.62);">
                  до {{ formatDeadline(g.deadline) }}
                </p>
              </div>
              <button @click="removeGoal(g.id)"><Trash2 class="w-4 h-4" style="color:rgba(243,234,214,0.25);"/></button>
            </div>
            <div class="flex justify-between text-sm mb-2">
              <span style="color:#86a861;" class="font-semibold">{{ fmt(g.currentAmount) }}</span>
              <span style="color:rgba(168,153,124,0.62);">из {{ fmt(g.targetAmount) }}</span>
            </div>
            <div class="rounded-full overflow-hidden mb-3" style="background:rgba(243,234,214,0.10);height:8px;">
              <div class="h-full rounded-full transition-all" style="background:linear-gradient(90deg,#e2532b,#86a861);"
                :style="{width: Math.min(100, g.currentAmount / g.targetAmount * 100) + '%'}"/>
            </div>
            <UiButton variant="tonal" size="sm" class="w-full" @click="openContribute(g)">
              <PiggyBank class="w-4 h-4 mr-1"/>Пополнить
            </UiButton>
          </div>
        </div>
      </template>

    </template>

    <!-- Dialog: Add Transaction -->
    <UiDialog v-model="showAddTx" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Новая транзакция</h3>
        <div class="flex rounded-xl overflow-hidden border mb-4" style="border-color:rgba(243,234,214,0.12);">
          <button class="flex-1 py-2 text-sm font-medium transition-colors"
            :style="txForm.type==='expense' ? 'background:#d6452b;color:#fff;' : 'background:transparent;color:rgba(168,153,124,0.82);'"
            @click="txForm.type='expense';txForm.category=''">Расход</button>
          <button class="flex-1 py-2 text-sm font-medium transition-colors"
            :style="txForm.type==='income' ? 'background:#86a861;color:#fff;' : 'background:transparent;color:rgba(168,153,124,0.82);'"
            @click="txForm.type='income';txForm.category=''">Доход</button>
        </div>
        <div class="flex flex-col gap-4">
          <UiInput v-model="txForm.amountStr" label="Сумма (₽)" placeholder="0" type="number" :error="txAmountError"/>
          <UiSelect v-model="txForm.category" label="Категория" :options="txCategories"/>
          <UiInput v-model="txForm.description" label="Описание (необязательно)" placeholder="Комментарий..."/>
          <div>
            <label class="text-sm block mb-1" style="color:rgba(168,153,124,0.82);">Дата</label>
            <input v-model="txForm.date" type="date" class="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style="background:#2b2118;border:1px solid rgba(243,234,214,0.10);color:rgba(243,234,214,0.92);"/>
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showAddTx=false">Отмена</UiButton>
          <UiButton :loading="savingTx" @click="submitTx">Добавить</UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Dialog: Add Budget -->
    <UiDialog v-model="showAddBudget" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Лимит расходов</h3>
        <div class="flex flex-col gap-4">
          <UiSelect v-model="budgetForm.category" label="Категория" :options="EXPENSE_CATS"/>
          <UiInput v-model="budgetForm.amountStr" label="Лимит (₽)" placeholder="10 000" type="number" :error="budgetAmountError"/>
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showAddBudget=false">Отмена</UiButton>
          <UiButton :loading="savingBudget" @click="submitBudget">Сохранить</UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Dialog: Add Goal -->
    <UiDialog v-model="showAddGoal" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Новая цель накопления</h3>
        <div class="flex flex-col gap-4">
          <UiInput v-model="goalForm.title" label="Название" placeholder="Ноутбук, Отпуск..."/>
          <UiInput v-model="goalForm.amountStr" label="Сумма цели (₽)" placeholder="100 000" type="number" :error="goalAmountError"/>
          <div>
            <label class="text-sm block mb-1" style="color:rgba(168,153,124,0.82);">Дедлайн (необязательно)</label>
            <input v-model="goalForm.deadline" type="date" class="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style="background:#2b2118;border:1px solid rgba(243,234,214,0.10);color:rgba(243,234,214,0.92);"/>
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showAddGoal=false">Отмена</UiButton>
          <UiButton :loading="savingGoal" @click="submitGoal">Создать</UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Dialog: Contribute to Goal -->
    <UiDialog v-model="showContribute" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-1">Пополнить цель</h3>
        <p class="text-sm mb-4" style="color:rgba(168,153,124,0.82);">{{ contributeGoal?.title }}</p>
        <UiInput v-model="contributeAmountStr" label="Сумма (₽)" placeholder="1 000" type="number" :error="contributeError"/>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showContribute=false">Отмена</UiButton>
          <UiButton :loading="savingContribute" @click="submitContribute">Пополнить</UiButton>
        </div>
      </div>
    </UiDialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { ChevronLeft, ChevronRight, Plus, Trash2, PiggyBank, Wallet, BarChart3, Target, TrendingUp, Repeat } from 'lucide-vue-next';
import { Chart, registerables } from 'chart.js';
import { useFinanceStore } from '../stores/finance.store';
import { useNotify } from '../composables/useNotify';
import { UiButton, UiDialog, UiInput, UiSelect, UiSpinner } from '../components/ui';
import type { SavingsGoal } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');
Chart.register(...registerables);

const store = useFinanceStore();
const { notify } = useNotify();

const TABS = [
  { id: 'tx', label: 'Транзакции' },
  { id: 'analytics', label: 'Аналитика' },
  { id: 'budget', label: 'Бюджет' },
  { id: 'goals', label: 'Цели' },
  { id: 'trends', label: 'Тренды' },
  { id: 'recurring', label: 'Повтор.' },
];
const activeTab = ref('tx');

const EXPENSE_CATS = [
  { value: 'Еда', label: '🍕 Еда' }, { value: 'Транспорт', label: '🚗 Транспорт' },
  { value: 'Жильё', label: '🏠 Жильё' }, { value: 'Здоровье', label: '💊 Здоровье' },
  { value: 'Развлечения', label: '🎮 Развлечения' }, { value: 'Одежда', label: '👕 Одежда' },
  { value: 'Образование', label: '📚 Образование' }, { value: 'Другое', label: '📦 Другое' },
];
const INCOME_CATS = [
  { value: 'Зарплата', label: '💼 Зарплата' }, { value: 'Фриланс', label: '💻 Фриланс' },
  { value: 'Подарок', label: '🎁 Подарок' }, { value: 'Инвестиции', label: '📈 Инвестиции' },
  { value: 'Другое', label: '📦 Другое' },
];
const CAT_ICONS: Record<string, string> = {
  Еда:'🍕',Транспорт:'🚗',Жильё:'🏠',Здоровье:'💊',Развлечения:'🎮',
  Одежда:'👕',Образование:'📚',Зарплата:'💼',Фриланс:'💻',Подарок:'🎁',Инвестиции:'📈',Другое:'📦',
};

function catIcon(cat: string) { return CAT_ICONS[cat] ?? '📦'; }
function fmt(n: number) { return Math.abs(n).toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽'; }
const INTERVAL_LABELS: Record<string, string> = { daily: 'Ежедневно', weekly: 'Еженедельно', monthly: 'Ежемесячно', yearly: 'Ежегодно' };
function intervalLabel(v?: string | null) { return v ? (INTERVAL_LABELS[v] ?? v) : 'Регулярно'; }
function formatDay(d: string) { return dayjs(d).format('D MMMM, dddd'); }
function formatDeadline(d: string) { return dayjs(d).format('D MMM YYYY'); }

const monthLabel = computed(() => dayjs(store.currentMonth + '-01').format('MMMM YYYY'));
function prevMonth() { store.load(dayjs(store.currentMonth + '-01').subtract(1,'month').format('YYYY-MM')); }
function nextMonth() { store.load(dayjs(store.currentMonth + '-01').add(1,'month').format('YYYY-MM')); }

const maxExpense = computed(() => Math.max(...store.breakdown.map((b) => b.amount), 1));
function pct(amount: number) { return (amount / maxExpense.value) * 100; }

function spentFor(category: string) {
  return store.breakdown.find((b) => b.category === category)?.amount ?? 0;
}

// Chart
const chartRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function buildChart() {
  if (!chartRef.value || !store.breakdown.length) return;
  chart?.destroy();
  chart = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels: store.breakdown.map((b) => `${catIcon(b.category)} ${b.category}`),
      datasets: [{ data: store.breakdown.map((b) => b.amount), backgroundColor: 'rgba(226,83,43,0.7)', borderRadius: 6 }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { callback: (v) => v.toLocaleString('ru-RU') + ' ₽' } } },
    },
  });
}

watch(activeTab, async (tab) => {
  if (tab === 'analytics') { await nextTick(); buildChart(); }
  if (tab === 'goals') store.loadGoals();
  if (tab === 'trends') store.fetchTrends();
  if (tab === 'recurring') store.fetchRecurringTransactions();
});

// Transactions
const showAddTx = ref(false);
const savingTx = ref(false);
const txAmountError = ref('');
const txForm = ref({ type: 'expense' as 'income'|'expense', amountStr: '', category: '', description: '', date: dayjs().format('YYYY-MM-DD') });
const txCategories = computed(() => txForm.value.type === 'expense' ? EXPENSE_CATS : INCOME_CATS);

async function removeTx(id: string) {
  try { await store.removeTransaction(id); } catch { notify('Не удалось удалить'); }
}
async function submitTx() {
  txAmountError.value = '';
  const amount = parseFloat(txForm.value.amountStr);
  if (!amount || amount <= 0) { txAmountError.value = 'Введите сумму'; return; }
  if (!txForm.value.category) { notify('Выберите категорию'); return; }
  savingTx.value = true;
  try {
    await store.addTransaction({ type: txForm.value.type, amount, category: txForm.value.category, description: txForm.value.description || undefined, date: txForm.value.date });
    showAddTx.value = false;
    txForm.value = { type: 'expense', amountStr: '', category: '', description: '', date: dayjs().format('YYYY-MM-DD') };
  } catch { notify('Не удалось добавить транзакцию'); }
  finally { savingTx.value = false; }
}

// Budgets
const showAddBudget = ref(false);
const savingBudget = ref(false);
const budgetAmountError = ref('');
const budgetForm = ref({ category: '', amountStr: '' });

async function removeBudget(id: string) {
  try { await store.removeBudget(id); } catch { notify('Не удалось удалить бюджет'); }
}
async function submitBudget() {
  budgetAmountError.value = '';
  const amount = parseFloat(budgetForm.value.amountStr);
  if (!amount || amount <= 0) { budgetAmountError.value = 'Введите сумму'; return; }
  if (!budgetForm.value.category) { notify('Выберите категорию'); return; }
  savingBudget.value = true;
  try {
    await store.upsertBudget({ category: budgetForm.value.category, amount });
    showAddBudget.value = false;
    budgetForm.value = { category: '', amountStr: '' };
  } catch { notify('Не удалось сохранить'); }
  finally { savingBudget.value = false; }
}

// Goals
const showAddGoal = ref(false);
const savingGoal = ref(false);
const goalAmountError = ref('');
const goalForm = ref({ title: '', amountStr: '', deadline: '' });

const showContribute = ref(false);
const savingContribute = ref(false);
const contributeGoal = ref<SavingsGoal | null>(null);
const contributeAmountStr = ref('');
const contributeError = ref('');

function openContribute(g: SavingsGoal) { contributeGoal.value = g; contributeAmountStr.value = ''; contributeError.value = ''; showContribute.value = true; }

async function removeGoal(id: string) {
  try { await store.removeGoal(id); } catch { notify('Не удалось удалить цель'); }
}
async function submitGoal() {
  goalAmountError.value = '';
  const amount = parseFloat(goalForm.value.amountStr);
  if (!goalForm.value.title.trim()) { notify('Введите название'); return; }
  if (!amount || amount <= 0) { goalAmountError.value = 'Введите сумму'; return; }
  savingGoal.value = true;
  try {
    await store.addGoal({ title: goalForm.value.title.trim(), targetAmount: amount, deadline: goalForm.value.deadline || undefined });
    showAddGoal.value = false;
    goalForm.value = { title: '', amountStr: '', deadline: '' };
  } catch { notify('Не удалось создать цель'); }
  finally { savingGoal.value = false; }
}
async function submitContribute() {
  contributeError.value = '';
  const amount = parseFloat(contributeAmountStr.value);
  if (!amount || amount <= 0) { contributeError.value = 'Введите сумму'; return; }
  savingContribute.value = true;
  try {
    await store.contributeToGoal(contributeGoal.value!.id, amount);
    showContribute.value = false;
  } catch { notify('Не удалось пополнить'); }
  finally { savingContribute.value = false; }
}

onMounted(async () => {
  await store.load();
});
</script>
