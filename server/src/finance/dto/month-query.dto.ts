import { IsOptional, Matches } from 'class-validator';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export class MonthQueryDto {
  @IsOptional()
  @Matches(MONTH_PATTERN, { message: 'month must be in YYYY-MM format (e.g. 2026-01)' })
  month?: string;
}

export class RequiredMonthQueryDto {
  @Matches(MONTH_PATTERN, { message: 'month must be in YYYY-MM format (e.g. 2026-01)' })
  month: string;
}
