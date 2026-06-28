/**
 * Сидер демо-данных.
 *
 * Создаёт две учётки для демонстрации:
 *   - admin@formanima.dev / admin123  (role: admin)
 *   - user@formanima.dev  / user123   (role: user)
 *
 * Обе наполнены целями, прогрессом, финансами и питанием, после чего
 * пересчитывается геймификация реальной логикой GamificationService,
 * поэтому XP, уровень, ранг и достижения выставляются корректно.
 *
 * Запуск:
 *   npm run seed                 (локально, ts-node)
 *   node dist/src/seed           (в Docker-образе)
 *
 * Идемпотентность: если демо-пользователь уже существует — сидер ничего не
 * делает. Чтобы пересоздать данные заново, выставите SEED_FRESH=true.
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { GamificationService } from './gamification/gamification.service';

const ADMIN_EMAIL = 'admin@formanima.dev';
const USER_EMAIL = 'user@formanima.dev';

/** Дата (только день, UTC) N дней назад. */
function dayUTC(daysAgo: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d;
}

/** Метка завершения N дней назад в указанный час (для time-based ачивок). */
function completedAt(daysAgo: number, hour: number): Date {
  const d = dayUTC(daysAgo);
  d.setUTCHours(hour, 0, 0, 0);
  return d;
}

/** Текущий месяц в формате YYYY-MM. */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

async function createUser(
  prisma: PrismaService,
  email: string,
  name: string,
  role: string,
  password: string,
) {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { email, name, role, passwordHash },
  });
}

/** Наполняет habit-цели прогрессом за последние `days` дней. */
async function seedHabitProgress(
  prisma: PrismaService,
  userId: string,
  goalIds: string[],
  days: number,
) {
  const rows: {
    goalId: string;
    userId: string;
    date: Date;
    value: number;
    completedAt: Date;
  }[] = [];

  for (let d = days - 1; d >= 0; d--) {
    for (const goalId of goalIds) {
      // Лёгкий разброс по часам; крайние значения для ачивок «Ранняя птица»/«Ночная сова»
      let hour = 8 + (d % 10);
      if (d === 2) hour = 5; // ранняя птица
      if (d === 4) hour = 23; // ночная сова
      rows.push({
        goalId,
        userId,
        date: dayUTC(d),
        value: 1,
        completedAt: completedAt(d, hour),
      });
    }
  }

  await prisma.goalProgress.createMany({ data: rows });

  // Денормализованный currentValue = сумма value по цели
  for (const goalId of goalIds) {
    const agg = await prisma.goalProgress.aggregate({
      where: { goalId },
      _sum: { value: true },
    });
    await prisma.goal.update({
      where: { id: goalId },
      data: { currentValue: agg._sum.value ?? 0 },
    });
  }
}

async function seedRegularUser(prisma: PrismaService) {
  const user = await createUser(prisma, USER_EMAIL, 'Иван Пример', 'user', 'user123');

  // ─── Привычки ───────────────────────────────────────────────────────────
  const habits = [
    { title: 'Пить 2 л воды', icon: 'mdi-cup-water', color: '#0ea5e9', category: 'health' },
    { title: 'Утренняя зарядка', icon: 'mdi-run', color: '#22c55e', category: 'fitness' },
    { title: 'Чтение 30 минут', icon: 'mdi-book-open-variant', color: '#a855f7', category: 'growth' },
    { title: 'Медитация', icon: 'mdi-meditation', color: '#f59e0b', category: 'health' },
  ];
  const habitGoals: { id: string }[] = [];
  for (const h of habits) {
    const g = await prisma.goal.create({
      data: {
        userId: user.id,
        title: h.title,
        type: 'habit',
        status: 'active',
        category: h.category,
        color: h.color,
        icon: h.icon,
        frequency: 'daily',
      },
    });
    habitGoals.push(g);
  }
  // 40 дней непрерывного прогресса по всем привычкам:
  //   - totalStrikes = 4 * 40 = 160 → ранг journeyman
  //   - bestStreak = 40 → ачивки «Воин недели», «Мастер месяца»
  //   - perfect days = 40 → ачивка «Идеальная неделя»
  await seedHabitProgress(prisma, user.id, habitGoals.map((g) => g.id), 40);

  // ─── Проект с вехами ────────────────────────────────────────────────────
  const project = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Запустить пет-проект',
      description: 'Довести учебный проект до публичного релиза',
      type: 'project',
      status: 'active',
      category: 'work',
      color: '#6366f1',
      icon: 'mdi-rocket-launch',
      targetValue: 4,
      currentValue: 2,
      deadline: dayUTC(-30),
    },
  });
  const milestones = [
    { title: 'Сверстать интерфейс', isDone: true, order: 0 },
    { title: 'Подключить API', isDone: true, order: 1 },
    { title: 'Написать тесты', isDone: false, order: 2 },
    { title: 'Задеплоить', isDone: false, order: 3 },
  ];
  for (const m of milestones) {
    await prisma.milestone.create({
      data: {
        goalId: project.id,
        title: m.title,
        order: m.order,
        isDone: m.isDone,
        doneAt: m.isDone ? dayUTC(10 - m.order) : null,
      },
    });
  }

  // ─── Финансы ────────────────────────────────────────────────────────────
  const tx: {
    userId: string;
    type: string;
    amount: number;
    category: string;
    description?: string;
    date: Date;
  }[] = [];
  // Зарплата за два месяца
  tx.push({ userId: user.id, type: 'income', amount: 90000, category: 'salary', description: 'Зарплата', date: dayUTC(45) });
  tx.push({ userId: user.id, type: 'income', amount: 90000, category: 'salary', description: 'Зарплата', date: dayUTC(15) });
  tx.push({ userId: user.id, type: 'income', amount: 12000, category: 'freelance', description: 'Подработка', date: dayUTC(20) });
  // Расходы по категориям
  const expenseTemplate = [
    { category: 'groceries', description: 'Продукты', amount: 2500 },
    { category: 'transport', description: 'Транспорт', amount: 900 },
    { category: 'cafe', description: 'Кафе', amount: 1400 },
    { category: 'entertainment', description: 'Развлечения', amount: 1800 },
  ];
  for (let d = 0; d < 50; d += 3) {
    const t = expenseTemplate[(d / 3) % expenseTemplate.length];
    tx.push({ userId: user.id, type: 'expense', amount: t.amount, category: t.category, description: t.description, date: dayUTC(d) });
  }
  await prisma.transaction.createMany({ data: tx });

  // Бюджеты на текущий месяц
  const month = currentMonth();
  await prisma.budget.createMany({
    data: [
      { userId: user.id, category: 'groceries', month, amount: 20000 },
      { userId: user.id, category: 'transport', month, amount: 6000 },
      { userId: user.id, category: 'cafe', month, amount: 8000 },
      { userId: user.id, category: 'entertainment', month, amount: 10000 },
    ],
  });

  // Накопительные цели: одна завершённая (ачивка «Финансовый мастер»), одна в процессе
  await prisma.savingsGoal.create({
    data: { userId: user.id, title: 'Новый ноутбук', targetAmount: 80000, currentAmount: 80000, deadline: dayUTC(-5) },
  });
  await prisma.savingsGoal.create({
    data: { userId: user.id, title: 'Отпуск', targetAmount: 150000, currentAmount: 65000, deadline: dayUTC(-90) },
  });

  // ─── Питание ────────────────────────────────────────────────────────────
  await prisma.calorieProfile.create({
    data: { userId: user.id, targetCalories: 2200, targetProtein: 150, targetFat: 70, targetCarbs: 250 },
  });
  const meals: { name: string; mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'; calories: number; protein: number; fat: number; carbs: number }[] = [
    { name: 'Овсянка с бананом', mealType: 'breakfast', calories: 420, protein: 14, fat: 9, carbs: 72 },
    { name: 'Куриная грудка с рисом', mealType: 'lunch', calories: 650, protein: 52, fat: 12, carbs: 78 },
    { name: 'Греческий салат', mealType: 'dinner', calories: 380, protein: 16, fat: 22, carbs: 24 },
    { name: 'Протеиновый батончик', mealType: 'snack', calories: 210, protein: 20, fat: 7, carbs: 18 },
  ];
  const foodRows: {
    userId: string;
    name: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    date: Date;
  }[] = [];
  for (let d = 0; d < 7; d++) {
    for (const m of meals) {
      foodRows.push({ userId: user.id, name: m.name, mealType: m.mealType, calories: m.calories, protein: m.protein, fat: m.fat, carbs: m.carbs, date: dayUTC(d) });
    }
  }
  await prisma.foodEntry.createMany({ data: foodRows });

  return user;
}

async function seedAdminUser(prisma: PrismaService) {
  const admin = await createUser(prisma, ADMIN_EMAIL, 'Администратор', 'admin', 'admin123');

  // Немного данных, чтобы профиль администратора не был пустым
  const habits = [
    { title: 'Планирование дня', icon: 'mdi-calendar-check', color: '#14b8a6', category: 'work' },
    { title: 'Английский язык', icon: 'mdi-translate', color: '#ef4444', category: 'growth' },
  ];
  const goals: { id: string }[] = [];
  for (const h of habits) {
    const g = await prisma.goal.create({
      data: {
        userId: admin.id,
        title: h.title,
        type: 'habit',
        status: 'active',
        category: h.category,
        color: h.color,
        icon: h.icon,
        frequency: 'daily',
      },
    });
    goals.push(g);
  }
  await seedHabitProgress(prisma, admin.id, goals.map((g) => g.id), 14);

  await prisma.transaction.createMany({
    data: [
      { userId: admin.id, type: 'income', amount: 120000, category: 'salary', description: 'Зарплата', date: dayUTC(10) },
      { userId: admin.id, type: 'expense', amount: 3200, category: 'groceries', description: 'Продукты', date: dayUTC(3) },
    ],
  });

  return admin;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const prisma = app.get(PrismaService);
  const gamification = app.get(GamificationService);

  try {
    const fresh = process.env.SEED_FRESH === 'true';
    const existing = await prisma.user.findUnique({ where: { email: USER_EMAIL } });

    if (existing && !fresh) {
      console.log('🌱 Сид: демо-учётки уже существуют — пропуск (SEED_FRESH=true для пересоздания).');
      return;
    }

    if (fresh) {
      // Каскадное удаление снесёт все связанные данные демо-пользователей
      await prisma.user.deleteMany({ where: { email: { in: [ADMIN_EMAIL, USER_EMAIL] } } });
      console.log('🌱 Сид: SEED_FRESH=true — старые демо-данные удалены.');
    }

    const user = await seedRegularUser(prisma);
    const admin = await seedAdminUser(prisma);

    // Пересчёт геймификации реальной логикой сервиса
    await gamification.recalculate(user.id);
    await gamification.recalculate(admin.id);

    const rank = await prisma.userRank.findUnique({ where: { userId: user.id } });
    console.log('🌱 Сид завершён. Демо-учётки:');
    console.log(`   admin: ${ADMIN_EMAIL} / admin123  (role: admin)`);
    console.log(`   user:  ${USER_EMAIL} / user123   (role: user)`);
    if (rank) {
      console.log(`   профиль user: уровень ${rank.level}, XP ${rank.xp}, ранг ${rank.rank}, выполнений ${rank.totalStrikes}`);
    }
  } finally {
    await app.close();
  }
}

bootstrap()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Сид завершился с ошибкой:', err);
    process.exit(1);
  });
