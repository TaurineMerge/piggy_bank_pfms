import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GetTransactionHistoryDto } from './get-transaction-history.dto';
import { ITransactionRepository } from '../../../domain/repositories/transaction.repository.interface';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { DateRange } from '../../../domain/value-objects/date-range.vo';
import { Transaction } from '../../../domain/entities/transaction.entity';

export interface TransactionHistoryResult {
  transactions: TransactionItem[];
  total: number;
}

export interface TransactionItem {
  id: string;
  amount: string;
  description: string;
  date: Date;
  type: string;
  categoryId: string;
}

@Injectable()
export class GetTransactionHistoryHandler {
  constructor(
    @Inject('TRANSACTION_REPOSITORY')
    private transactionRepository: ITransactionRepository,

    @Inject('USER_REPOSITORY')
    private userRepository: IUserRepository,
  ) {}

  async execute(
    dto: GetTransactionHistoryDto,
  ): Promise<TransactionHistoryResult> {
    // 1. Check if user exists
    const user = await this.userRepository.findByTelegramId(dto.telegramId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Get transactions
    let transactions: Transaction[];

    if (dto.from && dto.to) {
      const dateRange = new DateRange(dto.from, dto.to);
      transactions = await this.transactionRepository.findByUserIdAndDateRange(
        user.id,
        dateRange,
      );
    } else if (dto.from || dto.to) {
      // If only one date is provided, use last 30 days
      const dateRange = DateRange.last30Days();
      transactions = await this.transactionRepository.findByUserIdAndDateRange(
        user.id,
        dateRange,
      );
    } else {
      transactions = await this.transactionRepository.findByUserId(user.id);
    }

    // 3. Return transactions
    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: t.amount.format(),
        description: t.description,
        date: t.date,
        type: t.type,
        categoryId: t.categoryId,
      })),
      total: transactions.length,
    };
  }
}
