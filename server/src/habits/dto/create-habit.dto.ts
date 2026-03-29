import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

const CATEGORIES = ['sport', 'health', 'learning', 'work', 'finance', 'other'] as const;
const FREQUENCIES = ['daily', 'weekdays', 'custom'] as const;

export class CreateHabitDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsIn(CATEGORIES)
  category?: string;

  @IsOptional()
  @IsIn(FREQUENCIES)
  frequency?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
