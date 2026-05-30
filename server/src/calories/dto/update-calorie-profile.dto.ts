import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class UpdateCalorieProfileDto {
  @IsNumber()
  @Min(500)
  @Max(10000)
  @IsOptional()
  targetCalories?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  targetProtein?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  targetFat?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  targetCarbs?: number;
}
