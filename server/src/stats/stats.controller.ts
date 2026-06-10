import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get('streak/:goalId')
  getStreak(@Param('goalId') goalId: string, @Request() req: any) {
    return this.stats.getStreak(goalId, req.user.userId);
  }

  @Get('overview')
  getOverview(@Query('days') days: string, @Request() req: any) {
    return this.stats.getOverview(req.user.userId, days ? parseInt(days) : 7);
  }

  @Get('daily')
  getDailyStats(@Query('days') days: string, @Request() req: any) {
    return this.stats.getDailyStats(req.user.userId, days ? parseInt(days, 10) : 30);
  }

  @Get('heatmap/:goalId')
  getHeatmap(
    @Param('goalId') goalId: string,
    @Query('days') days: string,
    @Request() req: any,
  ) {
    const parsedDays = days ? parseInt(days, 10) : 90;
    const clampedDays = isNaN(parsedDays) || parsedDays <= 0 ? 90 : Math.min(parsedDays, 365);
    return this.stats.getHeatmap(goalId, req.user.userId, clampedDays);
  }
}
