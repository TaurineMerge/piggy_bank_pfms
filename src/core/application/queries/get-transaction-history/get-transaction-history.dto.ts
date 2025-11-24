import { IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class GetTransactionHistoryDto {
  @IsNumber()
  telegramId: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to?: Date;
}
