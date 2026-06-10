import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { StatsModule } from './stats/stats.module';
import { GamificationModule } from './gamification/gamification.module';
import { AdminModule } from './admin/admin.module';
import { FinanceModule } from './finance/finance.module';
import { GoalsModule } from './goals/goals.module';
import { CaloriesModule } from './calories/calories.module';

@Module({
  imports: [PrismaModule, AuthModule, StatsModule, GamificationModule, AdminModule, FinanceModule, GoalsModule, CaloriesModule],
})
export class AppModule {}
