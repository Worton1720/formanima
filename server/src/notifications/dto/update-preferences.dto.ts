import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  reminderTime?: string;

  @IsOptional()
  @IsBoolean()
  achievementEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  streakEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  levelUpEnabled?: boolean;
}
