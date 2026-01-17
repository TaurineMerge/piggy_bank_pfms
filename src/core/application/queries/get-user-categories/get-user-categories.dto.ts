import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { TransactionType } from '../../../domain/value-objects/transaction-type.vo';

export class GetUserCategoriesDto {
  @IsNumber()
  telegramId: number;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
