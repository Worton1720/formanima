import { Body, Controller, Delete, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { SubscribeDto } from './dto/subscribe.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return { key: process.env.VAPID_PUBLIC_KEY };
  }

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeDto, @Request() req: any) {
    return this.notifications.subscribe(req.user.userId, dto);
  }

  @Delete('unsubscribe')
  unsubscribe(@Body('endpoint') endpoint: string, @Request() req: any) {
    return this.notifications.unsubscribe(req.user.userId, endpoint);
  }

  @Get('preferences')
  getPreferences(@Request() req: any) {
    return this.notifications.getPreferences(req.user.userId);
  }

  @Put('preferences')
  updatePreferences(@Body() dto: UpdatePreferencesDto, @Request() req: any) {
    return this.notifications.updatePreferences(req.user.userId, dto);
  }
}
