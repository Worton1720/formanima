import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { UpdateMilestoneDto } from './dto/update-milestone.dto';
import { AddProgressDto } from './dto/add-progress.dto';
import { RemoveProgressDto } from './dto/remove-progress.dto';

@ApiTags('goals')
@ApiBearerAuth()
@Controller('goals')
@UseGuards(JwtAuthGuard)
export class GoalsController {
  constructor(private goals: GoalsService) {}

  // ─── Goals ───────────────────────────────────────────────────────────────────

  @Get()
  findAll(@Request() req: any) {
    return this.goals.findAll(req.user.userId);
  }

  @Get('archived')
  findArchived(@Request() req: any) {
    return this.goals.findArchived(req.user.userId);
  }

  @Get('today')
  findToday(@Request() req: any) {
    return this.goals.findToday(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.goals.findOne(req.user.userId, id);
  }

  @Post()
  create(@Body() dto: CreateGoalDto, @Request() req: any) {
    return this.goals.create(req.user.userId, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGoalDto, @Request() req: any) {
    return this.goals.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.goals.remove(req.user.userId, id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @Request() req: any) {
    return this.goals.archive(req.user.userId, id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string, @Request() req: any) {
    return this.goals.restore(req.user.userId, id);
  }

  // ─── Milestones ───────────────────────────────────────────────────────────────

  @Get(':id/milestones')
  getMilestones(@Param('id') id: string, @Request() req: any) {
    return this.goals.getMilestones(req.user.userId, id);
  }

  @Post(':id/milestones')
  createMilestone(@Param('id') id: string, @Body() dto: CreateMilestoneDto, @Request() req: any) {
    return this.goals.createMilestone(req.user.userId, id, dto);
  }

  @Patch(':id/milestones/:milestoneId')
  updateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Body() dto: UpdateMilestoneDto,
    @Request() req: any,
  ) {
    return this.goals.updateMilestone(req.user.userId, id, milestoneId, dto);
  }

  @Delete(':id/milestones/:milestoneId')
  removeMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req: any,
  ) {
    return this.goals.removeMilestone(req.user.userId, id, milestoneId);
  }

  @Patch(':id/milestones/:milestoneId/complete')
  completeMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req: any,
  ) {
    return this.goals.completeMilestone(req.user.userId, id, milestoneId);
  }

  // ─── Progress ─────────────────────────────────────────────────────────────────

  @Post(':id/progress')
  addProgress(@Param('id') id: string, @Body() dto: AddProgressDto, @Request() req: any) {
    return this.goals.addProgress(req.user.userId, id, dto);
  }

  @Delete(':id/progress')
  removeProgress(
    @Param('id') id: string,
    @Body() body: RemoveProgressDto,
    @Request() req: any,
  ) {
    return this.goals.removeProgress(req.user.userId, id, body.date, body.milestoneId);
  }

  @Get(':id/progress')
  getProgress(
    @Param('id') id: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: any,
  ) {
    return this.goals.getProgress(req.user.userId, id, startDate, endDate);
  }
}
