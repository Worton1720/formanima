import { IsString, IsDateString } from 'class-validator';

export class CompleteActionDto {
  @IsString()
  actionId: string;

  @IsDateString()
  date: string;
}
