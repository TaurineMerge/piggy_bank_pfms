import { IsUUID, IsNumber } from 'class-validator';

export class DeleteTransactionDto {
  @IsUUID()
  transactionId: string;

  @IsNumber()
  telegramId: number;
}
