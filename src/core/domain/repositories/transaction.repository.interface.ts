import { Transaction } from '../entities/transaction.entity';
import { DateRange } from '../value-objects/date-range.vo';

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByAccountId(accountId: string): Promise<Transaction[]>;
  findByUserId(userId: string): Promise<Transaction[]>;
  findByUserIdAndDateRange(
    userId: string,
    dateRange: DateRange,
  ): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
