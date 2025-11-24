import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class GetAccountBalanceDto {
  @IsNumber()
  telegramId: number;

  @IsOptional()
  @IsUUID()
  accountId?: string; // If not provided, the balance of the user's default account will be returned
}