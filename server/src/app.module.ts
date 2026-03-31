import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HabitsModule } from './habits/habits.module';
import { ActionsModule } from './actions/actions.module';
import { TrackingModule } from './tracking/tracking.module';
import { StatsModule } from './stats/stats.module';
import { GamificationModule } from './gamification/gamification.module';

@Module({
  imports: [PrismaModule, AuthModule, HabitsModule, ActionsModule, TrackingModule, StatsModule, GamificationModule],
})
export class AppModule {}
