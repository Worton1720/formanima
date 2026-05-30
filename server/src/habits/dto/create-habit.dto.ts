import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  category: string;

  @IsString()
  frequency: string;

  @IsString()
  color: string;

  @IsString()
  icon: string;
}
