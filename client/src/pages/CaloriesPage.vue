<template>
  <div class="max-w-2xl mx-auto px-4 py-6 min-h-[calc(100vh-3.5rem)] flex flex-col">

    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Калории</h1>
      <button
        class="px-3 py-1.5 rounded-lg text-sm transition-colors"
        style="background: rgba(226,83,43,0.15); color: #e2532b;"
        @click="showProfileDialog = true"
      >
        Настройки
      </button>
    </div>

    <!-- Date picker -->
    <div class="flex items-center gap-2 mb-5">
      <button class="p-1.5 rounded-lg" style="color:rgba(168,153,124,0.82);" @click="prevDay">
        <ChevronLeft class="w-5 h-5" />
      </button>
      <input
        v-model="store.selectedDate"
        type="date"
        class="flex-1 rounded-xl px-3 py-2 text-sm text-center focus:outline-none"
        style="background:#211a12; border:1px solid rgba(243,234,214,0.10); color:rgba(243,234,214,0.92);"
        @change="onDateChange"
      />
      <button class="p-1.5 rounded-lg" style="color:rgba(168,153,124,0.82);" @click="nextDay">
        <ChevronRight class="w-5 h-5" />
      </button>
    </div>

    <div v-if="store.loading" class="flex justify-center py-12"><UiSpinner /></div>

    <template v-else>

      <!-- Calorie ring + progress card -->
      <div class="rounded-2xl p-5 mb-5" style="background:#211a12; border:1px solid rgba(243,234,214,0.10);">
        <div class="flex items-center gap-6">
          <!-- Ring -->
          <div class="relative flex-shrink-0">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(243,234,214,0.06)" stroke-width="10"/>
              <circle
                cx="48" cy="48" r="40" fill="none"
                :stroke="calorieColor"
                stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="251.2"
                :stroke-dashoffset="ringOffset"
                transform="rotate(-90 48 48)"
                style="transition: stroke-dashoffset 0.4s;"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-base font-bold leading-none">{{ Math.round(totalCalories) }}</p>
              <p class="text-[10px] mt-0.5" style="color:rgba(168,153,124,0.62);">ккал</p>
            </div>
          </div>

          <!-- Macros -->
          <div class="flex-1 flex flex-col gap-2.5">
            <MacroBar label="Белки" :value="totalProtein" :target="store.profile?.targetProtein ?? 150" color="#e2532b" unit="г" />
            <MacroBar label="Жиры" :value="totalFat" :target="store.profile?.targetFat ?? 65" color="#e0aa4e" unit="г" />
            <MacroBar label="Углеводы" :value="totalCarbs" :target="store.profile?.targetCarbs ?? 250" color="#86a861" unit="г" />
          </div>
        </div>

        <!-- Calorie label row -->
        <div class="flex justify-between mt-4 text-xs" style="color:rgba(168,153,124,0.62);">
          <span>{{ Math.round(totalCalories) }} / {{ store.profile?.targetCalories ?? 2000 }} ккал</span>
          <span :style="{ color: calorieColor }">{{ Math.round(store.calorieProgress) }}%</span>
        </div>
      </div>

      <!-- Meal sections -->
      <div class="flex flex-col gap-4 flex-1">
        <MealSection
          v-for="meal in MEALS"
          :key="meal.id"
          :meal="meal"
          :entries="store.entriesByMeal[meal.id] ?? []"
          @add="openAddDialog(meal.id)"
          @delete="onDeleteEntry"
        />
      </div>

    </template>

    <!-- Add Entry Dialog -->
    <UiDialog v-model="showAddDialog" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Добавить продукт</h3>
        <div class="flex flex-col gap-4">
          <UiInput v-model="form.name" label="Название *" placeholder="Гречка, куриная грудка..." :error="formErrors.name" />

          <div>
            <label class="text-sm block mb-1" style="color:rgba(168,153,124,0.82);">Приём пищи</label>
            <div class="flex rounded-xl overflow-hidden border" style="border-color:rgba(243,234,214,0.10);">
              <button
                v-for="m in MEALS" :key="m.id"
                class="flex-1 py-1.5 text-xs font-medium transition-colors"
                :style="form.mealType === m.id
                  ? 'background:#e2532b; color:#fff;'
                  : 'background:transparent; color:rgba(168,153,124,0.82);'"
                @click="form.mealType = m.id"
              >{{ m.shortLabel }}</button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <UiInput v-model="form.caloriesStr" label="Калории *" placeholder="250" type="number" :error="formErrors.calories" />
            <UiInput v-model="form.weightStr" label="Вес, г" placeholder="100" type="number" />
          </div>
          <div class="grid grid-cols-3 gap-3">
            <UiInput v-model="form.proteinStr" label="Белки, г" placeholder="0" type="number" />
            <UiInput v-model="form.fatStr" label="Жиры, г" placeholder="0" type="number" />
            <UiInput v-model="form.carbsStr" label="Углеводы, г" placeholder="0" type="number" />
          </div>

          <div>
            <label class="text-sm block mb-1" style="color:rgba(168,153,124,0.82);">Дата</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full rounded-xl px-3 py-2 text-sm focus:outline-none"
              style="background:#2b2118; border:1px solid rgba(243,234,214,0.10); color:rgba(243,234,214,0.92);"
            />
          </div>
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showAddDialog = false">Отмена</UiButton>
          <UiButton :loading="saving" @click="submitEntry">Добавить</UiButton>
        </div>
      </div>
    </UiDialog>

    <!-- Profile Dialog -->
    <UiDialog v-model="showProfileDialog" max-width="sm">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Цели питания</h3>
        <div class="flex flex-col gap-4">
          <UiInput v-model="profileForm.caloriesStr" label="Целевые калории (500–10000)" placeholder="2000" type="number" :error="profileErrors.calories" />
          <UiInput v-model="profileForm.proteinStr" label="Белки, г" placeholder="150" type="number" />
          <UiInput v-model="profileForm.fatStr" label="Жиры, г" placeholder="65" type="number" />
          <UiInput v-model="profileForm.carbsStr" label="Углеводы, г" placeholder="250" type="number" />
        </div>
        <div class="flex gap-2 justify-end mt-5">
          <UiButton variant="ghost" @click="showProfileDialog = false">Отмена</UiButton>
          <UiButton :loading="savingProfile" @click="submitProfile">Сохранить</UiButton>
        </div>
      </div>
    </UiDialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineComponent, h } from 'vue';
import { ChevronLeft, ChevronRight, Plus, Trash2, Sunrise, Sun, Moon, Apple } from 'lucide-vue-next';
import type { Component } from 'vue';
import { useCaloriesStore } from '../stores/calories.store';
import { useNotify } from '../composables/useNotify';
import { UiButton, UiDialog, UiInput, UiSpinner } from '../components/ui';
import type { FoodEntry } from '../types';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const store = useCaloriesStore();
const { notify } = useNotify();

const MEALS = [
  { id: 'breakfast' as const, label: 'Завтрак', shortLabel: 'Завтрак', icon: Sunrise },
  { id: 'lunch' as const, label: 'Обед', shortLabel: 'Обед', icon: Sun },
  { id: 'dinner' as const, label: 'Ужин', shortLabel: 'Ужин', icon: Moon },
  { id: 'snack' as const, label: 'Перекус', shortLabel: 'Перекус', icon: Apple },
];

// ─── Computed ──────────────────────────────────────────────────────────────────

const totalCalories = computed(() => store.dailySummary?.totalCalories ?? 0);
const totalProtein = computed(() => store.dailySummary?.totalProtein ?? 0);
const totalFat = computed(() => store.dailySummary?.totalFat ?? 0);
const totalCarbs = computed(() => store.dailySummary?.totalCarbs ?? 0);

const ringOffset = computed(() => {
  const pct = store.calorieProgress / 100;
  return 251.2 * (1 - Math.min(1, pct));
});

const calorieColor = computed(() => {
  const p = store.calorieProgress;
  if (p >= 100) return '#d6452b';
  if (p >= 80) return '#e0aa4e';
  return '#e2532b';
});

// ─── Date navigation ───────────────────────────────────────────────────────────

function prevDay() {
  const d = dayjs(store.selectedDate).subtract(1, 'day').format('YYYY-MM-DD');
  store.setSelectedDate(d);
  store.loadDay(d);
}

function nextDay() {
  const d = dayjs(store.selectedDate).add(1, 'day').format('YYYY-MM-DD');
  store.setSelectedDate(d);
  store.loadDay(d);
}

function onDateChange() {
  store.loadDay(store.selectedDate);
}

// ─── Add Entry ─────────────────────────────────────────────────────────────────

const showAddDialog = ref(false);
const saving = ref(false);
const formErrors = ref({ name: '', calories: '' });
const form = ref({
  name: '',
  mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
  caloriesStr: '',
  proteinStr: '',
  fatStr: '',
  carbsStr: '',
  weightStr: '',
  date: store.selectedDate,
});

function openAddDialog(mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') {
  form.value = {
    name: '',
    mealType,
    caloriesStr: '',
    proteinStr: '',
    fatStr: '',
    carbsStr: '',
    weightStr: '',
    date: store.selectedDate,
  };
  formErrors.value = { name: '', calories: '' };
  showAddDialog.value = true;
}

async function submitEntry() {
  formErrors.value = { name: '', calories: '' };
  if (!form.value.name.trim()) { formErrors.value.name = 'Введите название'; return; }
  const calories = parseFloat(form.value.caloriesStr);
  if (isNaN(calories) || calories < 0) { formErrors.value.calories = 'Введите калории'; return; }

  saving.value = true;
  try {
    await store.createEntry({
      name: form.value.name.trim(),
      mealType: form.value.mealType,
      calories,
      protein: parseFloat(form.value.proteinStr) || 0,
      fat: parseFloat(form.value.fatStr) || 0,
      carbs: parseFloat(form.value.carbsStr) || 0,
      weight: form.value.weightStr ? parseFloat(form.value.weightStr) : undefined,
      date: form.value.date,
    });
    showAddDialog.value = false;
  } catch {
    notify('Не удалось добавить запись');
  } finally {
    saving.value = false;
  }
}

async function onDeleteEntry(id: string) {
  try {
    await store.deleteEntry(id);
  } catch {
    notify('Не удалось удалить запись');
  }
}

// ─── Profile ───────────────────────────────────────────────────────────────────

const showProfileDialog = ref(false);
const savingProfile = ref(false);
const profileErrors = ref({ calories: '' });
const profileForm = ref({
  caloriesStr: '',
  proteinStr: '',
  fatStr: '',
  carbsStr: '',
});

function openProfileDialog() {
  profileForm.value = {
    caloriesStr: String(store.profile?.targetCalories ?? 2000),
    proteinStr: String(store.profile?.targetProtein ?? 150),
    fatStr: String(store.profile?.targetFat ?? 65),
    carbsStr: String(store.profile?.targetCarbs ?? 250),
  };
  profileErrors.value = { calories: '' };
  showProfileDialog.value = true;
}

// Watch for dialog open to populate form values
import { watch } from 'vue';
watch(showProfileDialog, (val) => {
  if (val) openProfileDialog();
});

async function submitProfile() {
  profileErrors.value = { calories: '' };
  const cal = parseFloat(profileForm.value.caloriesStr);
  if (isNaN(cal) || cal < 500 || cal > 10000) {
    profileErrors.value.calories = 'Введите значение от 500 до 10000';
    return;
  }
  savingProfile.value = true;
  try {
    await store.updateProfile({
      targetCalories: cal,
      targetProtein: parseFloat(profileForm.value.proteinStr) || undefined,
      targetFat: parseFloat(profileForm.value.fatStr) || undefined,
      targetCarbs: parseFloat(profileForm.value.carbsStr) || undefined,
    });
    showProfileDialog.value = false;
  } catch {
    notify('Не удалось сохранить настройки');
  } finally {
    savingProfile.value = false;
  }
}

// ─── Init ──────────────────────────────────────────────────────────────────────

onMounted(async () => {
  await store.loadDay();
});

// ─── Sub-components ────────────────────────────────────────────────────────────

const MacroBar = defineComponent({
  props: {
    label: String,
    value: Number,
    target: Number,
    color: String,
    unit: String,
  },
  setup(props) {
    const pct = computed(() => Math.min(100, ((props.value ?? 0) / (props.target ?? 1)) * 100));
    return () =>
      h('div', {}, [
        h('div', { class: 'flex justify-between text-xs mb-1', style: 'color:rgba(168,153,124,0.82);' }, [
          h('span', {}, props.label),
          h('span', {}, `${Math.round(props.value ?? 0)}/${props.target ?? 0} ${props.unit}`),
        ]),
        h('div', { class: 'rounded-full overflow-hidden', style: 'background:rgba(243,234,214,0.10); height:5px;' }, [
          h('div', {
            class: 'h-full rounded-full',
            style: `background:${props.color}; width:${pct.value}%; transition:width 0.3s;`,
          }),
        ]),
      ]);
  },
});

const MealSection = defineComponent({
  props: {
    meal: Object as () => { id: string; label: string; icon: Component },
    entries: Array as () => FoodEntry[],
  },
  emits: ['add', 'delete'],
  setup(props, { emit }) {
    const totalCal = computed(() =>
      (props.entries ?? []).reduce((s, e) => s + e.calories, 0),
    );
    return () =>
      h('div', { class: 'rounded-2xl overflow-hidden', style: 'background:#211a12; border:1px solid rgba(243,234,214,0.10);' }, [
        // Header
        h('div', { class: 'flex items-center justify-between px-4 py-3', style: 'border-bottom:1px solid rgba(243,234,214,0.06);' }, [
          h('div', { class: 'flex items-center gap-2' }, [
            props.meal?.icon ? h(props.meal.icon, { class: 'w-4 h-4', style: 'color:rgba(168,153,124,0.82);' }) : null,
            h('p', { class: 'text-sm font-semibold' }, props.meal?.label),
            h('span', { class: 'text-xs', style: 'color:rgba(243,234,214,0.35);' }, totalCal.value ? `${Math.round(totalCal.value)} ккал` : ''),
          ]),
          h('button',
            {
              class: 'flex items-center gap-1 text-xs px-2 py-1 rounded-lg',
              style: 'color:#e2532b; background:rgba(226,83,43,0.1);',
              onClick: () => emit('add', props.meal?.id),
            },
            [h(Plus, { class: 'w-3.5 h-3.5' }), 'Добавить'],
          ),
        ]),
        // Entries
        ...(props.entries ?? []).map((entry) =>
          h('div', {
            key: entry.id,
            class: 'flex items-center gap-3 px-4 py-2.5',
            style: 'border-bottom:1px solid rgba(243,234,214,0.04);',
          }, [
            h('div', { class: 'flex-1 min-w-0' }, [
              h('p', { class: 'text-sm font-medium truncate' }, entry.name),
              h('p', { class: 'text-xs mt-0.5', style: 'color:rgba(243,234,214,0.35);' },
                [
                  `Б:${Math.round(entry.protein)}г  Ж:${Math.round(entry.fat)}г  У:${Math.round(entry.carbs)}г`,
                  entry.weight ? `  · ${entry.weight}г` : '',
                ].join(''),
              ),
            ]),
            h('p', { class: 'text-sm font-semibold flex-shrink-0', style: 'color:#e2532b;' }, `${Math.round(entry.calories)} ккал`),
            h('button', {
              class: 'p-1 flex-shrink-0',
              onClick: () => emit('delete', entry.id),
            }, [h(Trash2, { class: 'w-4 h-4', style: 'color:rgba(243,234,214,0.25);' })]),
          ]),
        ),
        // Empty state
        ...(!(props.entries ?? []).length
          ? [h('div', { class: 'px-4 py-3 text-xs text-center', style: 'color:rgba(243,234,214,0.25);' }, 'Нет записей')]
          : []),
      ]);
  },
});
</script>
