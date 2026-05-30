import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GoalsModule } from '../goals/goals.module';
import { CaloriesController } from './calories.controller';
import { CaloriesService } from './calories.service';

@Module({
  imports: [PrismaModule, forwardRef(() => GoalsModule)],
  controllers: [CaloriesController],
  providers: [CaloriesService],
  exports: [CaloriesService],
})
export class CaloriesModule {}
