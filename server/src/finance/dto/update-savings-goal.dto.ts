import { IsOptional, IsString } from 'class-validator';

export class UpdateSavingsGoalDto {
  @IsString()
  @IsOptional()
  goalId?: string;
}
