import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration: Habits → Goals');

  const habits = await prisma.habit.findMany({
    include: {
      actions: {
        include: { completions: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  console.log(`Found ${habits.length} habits to migrate`);

  let goalsCreated = 0;
  let milestonesCreated = 0;
  let progressCreated = 0;

  for (const habit of habits) {
    // 1. Создать Goal из Habit
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
        frequency: habit.frequency,
        createdAt: habit.createdAt,
      },
    });
    goalsCreated++;

    // 2. Создать Milestone из каждого Action
    for (const action of habit.actions) {
      const milestone = await prisma.milestone.create({
        data: {
          goalId: goal.id,
          title: action.title,
          order: action.order,
          createdAt: new Date(),
        },
      });
      milestonesCreated++;

      // 3. Создать GoalProgress из каждого Completion
      for (const completion of action.completions) {
        // Проверить дубликат (не используем @@unique с nullable milestoneId)
        const existing = await prisma.goalProgress.findFirst({
          where: {
            goalId: goal.id,
            userId: completion.userId,
            milestoneId: milestone.id,
            date: completion.date,
          },
        });

        if (!existing) {
          await prisma.goalProgress.create({
            data: {
              goalId: goal.id,
              userId: completion.userId,
              milestoneId: milestone.id,
              date: completion.date,
              value: 1,
              completedAt: completion.completedAt,
            },
          });
          progressCreated++;
        }
      }
    }
  }

  console.log('Migration complete:');
  console.log(`  Goals created: ${goalsCreated}`);
  console.log(`  Milestones created: ${milestonesCreated}`);
  console.log(`  GoalProgress created: ${progressCreated}`);
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
