import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HabitsModule } from './habits/habits.module';

@Module({
  imports: [PrismaModule, AuthModule, HabitsModule],
})
export class AppModule {}
