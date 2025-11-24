import { IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class GetMonthlyReportDto {
  @IsNumber()
  telegramId: number;

  @IsDate()
  @Type(() => Date)
  month: Date;
}
