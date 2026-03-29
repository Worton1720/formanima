import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private habits: HabitsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.habits.findAll(req.user.userId);
  }

  @Get('archived')
  findArchived(@Request() req: any) {
    return this.habits.findArchived(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.habits.findOne(id, req.user.userId);
  }

  @Post()
  create(@Body() dto: CreateHabitDto, @Request() req: any) {
    return this.habits.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHabitDto, @Request() req: any) {
    return this.habits.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  archive(@Param('id') id: string, @Request() req: any) {
    return this.habits.archive(id, req.user.userId);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string, @Request() req: any) {
    return this.habits.restore(id, req.user.userId);
  }
}
