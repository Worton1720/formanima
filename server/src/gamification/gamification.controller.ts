import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.gamification.getProfile(req.user.userId);
  }
}
