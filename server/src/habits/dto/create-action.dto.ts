import { IsString, IsInt, MaxLength } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsInt()
  order: number;
}
