import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RolesGuard } from './roles.guard';

@Module({
  providers: [AdminService, RolesGuard],
  controllers: [AdminController],
})
export class AdminModule {}
