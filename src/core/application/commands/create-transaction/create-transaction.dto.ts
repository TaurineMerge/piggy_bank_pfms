import {
  IsNumber,
  IsString,
  IsUUID,
  IsDate,
  IsEnum,
  IsOptional,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../domain/value-objects/transaction-type.vo';

export class CreateTransactionDto {
  @IsNumber()
  telegramId: number;

  @IsUUID()
  accountId: string;

  @IsUUID()
  categoryId: string;

  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsString()
  description: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
