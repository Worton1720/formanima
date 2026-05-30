import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { MealType } from '@prisma/client';

export class CreateFoodEntryDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsEnum(MealType)
  mealType: MealType;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  protein?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fat?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  carbs?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsDateString()
  date: string;
}
