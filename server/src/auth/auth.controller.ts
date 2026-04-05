import { Body, Controller, Get, Patch, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: any) {
    return this.auth.getMe(req.user.userId);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Body() dto: UpdateProfileDto, @Request() req: any) {
    return this.auth.updateProfile(req.user.userId, dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Request() req: any) {
    return this.auth.logout(req.user.userId);
  }
}
