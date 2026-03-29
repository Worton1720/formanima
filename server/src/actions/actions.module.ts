import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { HabitsModule } from '../habits/habits.module';

@Module({
  imports: [HabitsModule],
  providers: [ActionsService],
  controllers: [ActionsController],
})
export class ActionsModule {}
