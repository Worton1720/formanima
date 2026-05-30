import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class CreateMilestoneDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
