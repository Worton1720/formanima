import { Body, Controller, Delete, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrackingService } from './tracking.service';
import { CompleteActionDto } from './dto/complete-action.dto';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private tracking: TrackingService) {}

  @Post('complete')
  complete(@Body() dto: CompleteActionDto, @Request() req: any) {
    return this.tracking.complete(req.user.userId, dto.actionId, dto.date);
  }

  @Delete('complete')
  uncomplete(@Body() dto: CompleteActionDto, @Request() req: any) {
    return this.tracking.uncomplete(req.user.userId, dto.actionId, dto.date);
  }

  @Get()
  getStatus(
    @Query('habitId') habitId: string,
    @Query('date') date: string,
    @Request() req: any,
  ) {
    return this.tracking.getStatusForDate(req.user.userId, habitId, date);
  }
}
