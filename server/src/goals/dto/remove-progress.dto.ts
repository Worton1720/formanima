import { IsDateString, IsOptional, IsString } from 'class-validator';

export class RemoveProgressDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  milestoneId?: string;
}
