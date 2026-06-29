import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateSavingsGoalDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsNumber()
  @IsPositive()
  targetAmount: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class ContributeGoalDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
