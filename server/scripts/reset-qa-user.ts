import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Разовая очистка тестовых артефактов QA-прогона у пользователя ustrod@gmail.com:
// снимает разблокированные ачивки и обнуляет рейтинг, чтобы аккаунт остался чистым.
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'ustrod@gmail.com' } });
  if (!user) { console.log('user not found'); return; }

  const delAch = await prisma.userAchievement.deleteMany({ where: { userId: user.id } });
  const rank = await prisma.userRank.updateMany({
    where: { userId: user.id },
    data: { xp: 0, level: 1, totalStrikes: 0, rank: 'apprentice' },
  });
  console.log(`achievements removed: ${delAch.count}, rank rows reset: ${rank.count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
