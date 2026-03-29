import { IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
