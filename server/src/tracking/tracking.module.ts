import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { HabitsModule } from '../habits/habits.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [HabitsModule, GamificationModule],
  providers: [TrackingService],
  controllers: [TrackingController],
  exports: [TrackingService],
})
export class TrackingModule {}
