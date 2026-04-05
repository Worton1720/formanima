import { BadRequestException, Controller, Delete, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  getUsers() {
    return this.admin.getUsers();
  }

  @Put('users/:id/block')
  blockUser(@Param('id') id: string) {
    return this.admin.blockUser(id);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @Request() req: any) {
    if (id === req.user.userId) {
      throw new BadRequestException('Cannot delete your own account');
    }
    return this.admin.deleteUser(id);
  }

  @Get('stats')
  getStats() {
    return this.admin.getSystemStats();
  }
}
