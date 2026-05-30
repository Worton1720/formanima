import { IsNotEmpty, IsNumber, IsPositive, IsString, Matches, MaxLength } from 'class-validator';

export class UpsertBudgetDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  category: string;

  @Matches(/^\d{4}-\d{2}$/)
  month: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
