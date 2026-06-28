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

/**
 * Метка завершения N дней назад в указанный час. Используется ЛОКАЛЬНОЕ время,
 * т.к. GamificationService проверяет time-based ачивки через `getHours()`
 * (локальный час). Так результат стабилен и в UTC-контейнере, и локально.
 */
function completedAt(daysAgo: number, hour: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Текущий месяц в формате YYYY-MM. */
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Детерминированный PRNG (mulberry32) — данные сида стабильны между запусками. */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Суббота/воскресенье по дате (UTC). */
function isWeekend(d: Date): boolean {
  const wd = d.getUTCDay();
  return wd === 0 || wd === 6;
}

/** Профиль привычки для генерации реалистичного паттерна выполнения. */
interface HabitProfile {
  startDaysAgo: number; // сколько дней назад «заведена» привычка
  base: number; // базовая вероятность выполнения в день
  trend: number; // прибавка к вероятности к недавним дням (рост вовлечённости)
  weekendDrop: number; // снижение вероятности по выходным
  hour: number; // типичный час выполнения
  alwaysRecentDays: number; // форсировать выполнение последние N дней (для стрика)
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

/**
 * Наполняет habit-цели реалистичным прогрессом за `horizon` дней.
 * У каждой привычки свой паттерн (база, тренд, выходные, дата старта),
 * поэтому % выполнения, стрики и хитмапы различаются — аналитика «живая».
 * Последние 7 дней — идеальные (ачивка «Идеальная неделя»). Генерация
 * детерминирована, данные стабильны между запусками сида.
 */
async function seedPatternedProgress(
  prisma: PrismaService,
  userId: string,
  habits: { id: string; profile: HabitProfile }[],
  horizon: number,
) {
  const rows: {
    goalId: string;
    userId: string;
    date: Date;
    value: number;
    completedAt: Date;
  }[] = [];

  habits.forEach((h, idx) => {
    const rand = mulberry32(1000 + idx * 97);
    for (let d = h.profile.startDaysAgo; d >= 0; d--) {
      const date = dayUTC(d);
      let rate = h.profile.base + (h.profile.trend * (horizon - d)) / horizon;
      if (h.profile.weekendDrop && isWeekend(date)) rate -= h.profile.weekendDrop;
      rate = Math.max(0.05, Math.min(0.98, rate));

      let done = rand() < rate;
      if (d < 7) done = true; // идеальная последняя неделя
      if (d < h.profile.alwaysRecentDays) done = true; // гарантированный недавний стрик
      if (!done) continue;

      // Крайние часы для ачивок «Ранняя птица» (idx 0, день 2) и «Ночная сова» (idx 2, день 4)
      let hour = h.profile.hour;
      if (idx === 0 && d === 2) hour = 5;
      if (idx === 2 && d === 4) hour = 23;

      rows.push({ goalId: h.id, userId, date, value: 1, completedAt: completedAt(d, hour) });
    }
  });

  await prisma.goalProgress.createMany({ data: rows });

  // Денормализованный currentValue = сумма value по цели
  for (const h of habits) {
    const agg = await prisma.goalProgress.aggregate({
      where: { goalId: h.id },
      _sum: { value: true },
    });
    await prisma.goal.update({
      where: { id: h.id },
      data: { currentValue: agg._sum.value ?? 0 },
    });
  }
}

async function seedRegularUser(prisma: PrismaService) {
  const user = await createUser(prisma, USER_EMAIL, 'Иван Пример', 'user', 'user123');

  // ─── Привычки ───────────────────────────────────────────────────────────
  // У каждой привычки свой характер: «вода» — железобетонная, «медитация» —
  // самая молодая и нестабильная, «зарядка» проседает по выходным, «чтение»
  // постепенно входит в привычку. Это даёт разнообразную аналитику.
  const habitDefs: {
    title: string;
    icon: string;
    color: string;
    category: string;
    profile: HabitProfile;
  }[] = [
    {
      title: 'Пить 2 л воды', icon: 'mdi-cup-water', color: '#0ea5e9', category: 'health',
      profile: { startDaysAgo: 90, base: 0.9, trend: 0.05, weekendDrop: 0, hour: 9, alwaysRecentDays: 30 },
    },
    {
      title: 'Утренняя зарядка', icon: 'mdi-run', color: '#22c55e', category: 'fitness',
      profile: { startDaysAgo: 75, base: 0.6, trend: 0.15, weekendDrop: 0.25, hour: 7, alwaysRecentDays: 0 },
    },
    {
      title: 'Чтение 30 минут', icon: 'mdi-book-open-variant', color: '#a855f7', category: 'growth',
      profile: { startDaysAgo: 90, base: 0.68, trend: 0.18, weekendDrop: 0, hour: 22, alwaysRecentDays: 0 },
    },
    {
      title: 'Медитация', icon: 'mdi-meditation', color: '#f59e0b', category: 'health',
      profile: { startDaysAgo: 45, base: 0.5, trend: 0.12, weekendDrop: 0.2, hour: 21, alwaysRecentDays: 0 },
    },
  ];
  const habitGoals: { id: string; profile: HabitProfile }[] = [];
  for (const h of habitDefs) {
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
        createdAt: dayUTC(h.profile.startDaysAgo),
      },
    });
    habitGoals.push({ id: g.id, profile: h.profile });
  }
  // 90 дней истории с разными паттернами:
  //   - разные % выполнения и стрики по привычкам → живые графики и хитмапы
  //   - последние 7 дней идеальны → ачивка «Идеальная неделя»
  //   - «вода» ≥30 дней подряд → гарантированный 30-дневный стрик → «Мастер месяца»
  await seedPatternedProgress(prisma, user.id, habitGoals, 90);

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
  // 3 месяца истории: ежемесячная зарплата, подработки и расходы по 6
  // категориям с разной частотой и разбросом сумм → наполненные графики.
  const finRand = mulberry32(7777);
  const tx: {
    userId: string;
    type: string;
    amount: number;
    category: string;
    description?: string;
    date: Date;
  }[] = [];
  for (const d of [75, 45, 15]) {
    tx.push({ userId: user.id, type: 'income', amount: 90000 + Math.round(finRand() * 8000), category: 'salary', description: 'Зарплата', date: dayUTC(d) });
  }
  tx.push({ userId: user.id, type: 'income', amount: 12000, category: 'freelance', description: 'Подработка', date: dayUTC(20) });
  tx.push({ userId: user.id, type: 'income', amount: 7500, category: 'freelance', description: 'Подработка', date: dayUTC(52) });

  const expenseCats = [
    { category: 'groceries', description: 'Продукты', base: 1800, everyDays: 4 },
    { category: 'transport', description: 'Транспорт', base: 700, everyDays: 3 },
    { category: 'cafe', description: 'Кафе и рестораны', base: 1200, everyDays: 6 },
    { category: 'entertainment', description: 'Развлечения', base: 1600, everyDays: 9 },
    { category: 'health', description: 'Аптека', base: 900, everyDays: 14 },
    { category: 'utilities', description: 'Коммуналка', base: 5500, everyDays: 30 },
  ];
  for (const c of expenseCats) {
    for (let d = 88; d >= 0; d -= c.everyDays) {
      const amount = Math.round(c.base * (0.7 + finRand() * 0.8));
      tx.push({ userId: user.id, type: 'expense', amount, category: c.category, description: c.description, date: dayUTC(d) });
    }
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
      { userId: user.id, category: 'health', month, amount: 3000 },
      { userId: user.id, category: 'utilities', month, amount: 7000 },
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
  const calRand = mulberry32(4242);
  for (let d = 0; d < 14; d++) {
    for (const m of meals) {
      // Иногда пропускаем перекус и слегка варьируем калории/БЖУ — сводки оживают
      if (m.mealType === 'snack' && calRand() < 0.4) continue;
      const k = 0.85 + calRand() * 0.3;
      foodRows.push({
        userId: user.id,
        name: m.name,
        mealType: m.mealType,
        calories: Math.round(m.calories * k),
        protein: Math.round(m.protein * k),
        fat: Math.round(m.fat * k),
        carbs: Math.round(m.carbs * k),
        date: dayUTC(d),
      });
    }
  }
  await prisma.foodEntry.createMany({ data: foodRows });

  return user;
}

async function seedAdminUser(prisma: PrismaService) {
  const admin = await createUser(prisma, ADMIN_EMAIL, 'Администратор', 'admin', 'admin123');

  // Немного данных, чтобы профиль администратора не был пустым
  const habitDefs: {
    title: string;
    icon: string;
    color: string;
    category: string;
    profile: HabitProfile;
  }[] = [
    {
      title: 'Планирование дня', icon: 'mdi-calendar-check', color: '#14b8a6', category: 'work',
      profile: { startDaysAgo: 30, base: 0.75, trend: 0.1, weekendDrop: 0.3, hour: 9, alwaysRecentDays: 7 },
    },
    {
      title: 'Английский язык', icon: 'mdi-translate', color: '#ef4444', category: 'growth',
      profile: { startDaysAgo: 21, base: 0.6, trend: 0.15, weekendDrop: 0, hour: 20, alwaysRecentDays: 0 },
    },
  ];
  const goals: { id: string; profile: HabitProfile }[] = [];
  for (const h of habitDefs) {
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
        createdAt: dayUTC(h.profile.startDaysAgo),
      },
    });
    goals.push({ id: g.id, profile: h.profile });
  }
  await seedPatternedProgress(prisma, admin.id, goals, 30);

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
