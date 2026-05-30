import { IsString, IsOptional, MaxLength, IsNumber, IsDateString, Min } from 'class-validator';

export class AddProgressDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  milestoneId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
