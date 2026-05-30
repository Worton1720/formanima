import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { CreateActionDto } from './dto/create-action.dto';

@ApiTags('habits')
@ApiBearerAuth()
@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private habits: HabitsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.habits.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.habits.findOne(req.user.userId, id);
  }

  @Post()
  create(@Body() dto: CreateHabitDto, @Request() req: any) {
    return this.habits.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHabitDto, @Request() req: any) {
    return this.habits.update(req.user.userId, id, dto);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @Request() req: any) {
    return this.habits.archive(req.user.userId, id);
  }

  @Post(':id/actions')
  createAction(@Param('id') id: string, @Body() dto: CreateActionDto, @Request() req: any) {
    return this.habits.createAction(req.user.userId, id, dto);
  }

  @Delete(':id/actions/:actionId')
  removeAction(
    @Param('id') id: string,
    @Param('actionId') actionId: string,
    @Request() req: any,
  ) {
    return this.habits.removeAction(req.user.userId, id, actionId);
  }
}
