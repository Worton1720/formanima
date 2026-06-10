import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Одноразовая миграция: раздел «Привычки» (модели Habit/Action) объединён
 * с системой Целей. Habit → Goal(type='habit'), Action → Milestone (опц. шаг).
 *
 * В текущей схеме у привычек НЕТ данных о выполнении по дням, поэтому
 * GoalProgress не создаётся — стрики начнут считаться с первой отметки в новой
 * системе. Скрипт идемпотентен: повторный запуск не плодит дубли.
 */
async function migrate() {
  console.log('Starting migration: Habits → Goals(type=habit)');

  const habits = await prisma.habit.findMany({
    include: { actions: { orderBy: { order: 'asc' } } },
  });

  console.log(`Found ${habits.length} habits to migrate`);

  let goalsCreated = 0;
  let milestonesCreated = 0;
  let skipped = 0;

  for (const habit of habits) {
    // Идемпотентность: пропускаем, если habit-цель с тем же названием и
    // временем создания у пользователя уже существует.
    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId: habit.userId,
        type: 'habit',
        title: habit.title,
        createdAt: habit.createdAt,
      },
    });
    if (existingGoal) {
      skipped++;
      continue;
    }

    const goal = await prisma.goal.create({
      data: {
        userId: habit.userId,
        title: habit.title,
        description: habit.description ?? undefined,
        type: 'habit',
        status: habit.isArchived ? 'archived' : 'active',
        category: habit.category,
        color: habit.color,
        icon: habit.icon,
        frequency: ['daily', 'weekly', 'monthly'].includes(habit.frequency)
          ? habit.frequency
          : 'daily',
        createdAt: habit.createdAt,
      },
    });
    goalsCreated++;

    for (const action of habit.actions) {
      await prisma.milestone.create({
        data: {
          goalId: goal.id,
          title: action.title,
          order: action.order,
          createdAt: new Date(),
        },
      });
      milestonesCreated++;
    }
  }

  console.log('Migration complete:');
  console.log(`  Goals created:      ${goalsCreated}`);
  console.log(`  Milestones created: ${milestonesCreated}`);
  console.log(`  Habits skipped:     ${skipped} (already migrated)`);
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
