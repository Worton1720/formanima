import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('streak/:habitId')
  getStreak(@Param('habitId') habitId: string, @Request() req: any) {
    return this.stats.getStreak(habitId, req.user.userId);
  }

  @Get('overview')
  getOverview(@Query('days') days: string, @Request() req: any) {
    return this.stats.getOverview(req.user.userId, days ? parseInt(days) : 7);
  }
}
