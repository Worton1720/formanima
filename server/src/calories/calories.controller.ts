import { Body, Controller, Delete, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CaloriesService } from './calories.service';
import { CreateFoodEntryDto } from './dto/create-food-entry.dto';
import { UpdateCalorieProfileDto } from './dto/update-calorie-profile.dto';

@Controller('calories')
@UseGuards(JwtAuthGuard)
export class CaloriesController {
  constructor(private calories: CaloriesService) {}

  @Get('entries')
  getEntries(@Request() req: any, @Query('date') date: string) {
    return this.calories.getEntries(req.user.userId, date);
  }

  @Post('entries')
  createEntry(@Body() dto: CreateFoodEntryDto, @Request() req: any) {
    return this.calories.createEntry(req.user.userId, dto);
  }

  @Delete('entries/:id')
  deleteEntry(@Param('id') id: string, @Request() req: any) {
    return this.calories.deleteEntry(req.user.userId, id);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.calories.getProfile(req.user.userId);
  }

  @Put('profile')
  updateProfile(@Body() dto: UpdateCalorieProfileDto, @Request() req: any) {
    return this.calories.updateProfile(req.user.userId, dto);
  }

  @Get('summary')
  getDailySummary(@Request() req: any, @Query('date') date: string) {
    return this.calories.getDailySummary(req.user.userId, date);
  }

  @Get('weekly')
  getWeeklySummary(@Request() req: any, @Query('startDate') startDate: string) {
    return this.calories.getWeeklySummary(req.user.userId, startDate);
  }
}
