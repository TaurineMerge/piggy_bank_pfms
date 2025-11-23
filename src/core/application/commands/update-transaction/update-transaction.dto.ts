import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateTransactionDto {
  @IsUUID()
  transactionId: string;

  @IsNumber()
  telegramId: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
