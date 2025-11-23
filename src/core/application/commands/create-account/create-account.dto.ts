import { IsNumber, IsString, IsEnum } from 'class-validator';
import { Currency } from '../../../domain/value-objects/currency.vo';

export class CreateAccountDto {
  @IsNumber()
  telegramId: number;

  @IsString()
  name: string;

  @IsEnum(Currency)
  currency: Currency;
}
