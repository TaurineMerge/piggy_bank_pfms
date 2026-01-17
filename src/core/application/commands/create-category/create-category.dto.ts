import { IsNumber, IsString, IsEnum, Length } from 'class-validator';
import { TransactionType } from '../../../domain/value-objects/transaction-type.vo';

export class CreateCategoryDto {
  @IsNumber()
  telegramId: number;

  @IsString()
  @Length(1, 50)
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @Length(1, 10)
  icon: string;
}
