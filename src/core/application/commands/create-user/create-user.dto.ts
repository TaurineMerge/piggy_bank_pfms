import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { Currency } from '../../../domain/value-objects/currency.vo';

export class CreateUserDto {
  @IsNumber()
  telegramId: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEnum(Currency)
  defaultCurrency: Currency = Currency.RUB;

  @IsOptional()
  @IsString()
  timezone?: string;
}
