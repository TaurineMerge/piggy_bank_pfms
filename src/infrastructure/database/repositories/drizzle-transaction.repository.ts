import { Injectable } from '@nestjs/common';
import { eq, and, gte, lte, inArray, desc } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { transactions, DbTransaction } from '../schema/transactions.schema';
import { accounts } from '../schema/accounts.schema';
import { ITransactionRepository } from '../../../core/domain/repositories/transaction.repository.interface';
import { Transaction } from '../../../core/domain/entities/transaction.entity';
import { Money } from '../../../core/domain/value-objects/money.vo';
import { Currency } from '../../../core/domain/value-objects/currency.vo';
import { TransactionType } from '../../../core/domain/value-objects/transaction-type.vo';
import { DateRange } from '../../../core/domain/value-objects/date-range.vo';

@Injectable()
export class DrizzleTransactionRepository implements ITransactionRepository {
  constructor(private drizzle: DrizzleService) {}

  async save(transaction: Transaction): Promise<void> {
    await this.drizzle.db.insert(transactions).values({
      id: transaction.id,
      accountId: transaction.accountId,
      categoryId: transaction.categoryId,
      amount: transaction.amount.amount.toString(),
      currency: transaction.amount.currency,
      description: transaction.description,
      date: transaction.date,
      type: transaction.type,
      tags: transaction.tags,
      metadata: transaction.metadata,
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const result = await this.drizzle.db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);

    const dbTransaction = result[0];
    return dbTransaction ? this.mapToDomain(dbTransaction) : null;
  }

  async findByAccountId(accountId: string): Promise<Transaction[]> {
    const result = await this.drizzle.db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date));

    return result.map((dbTransaction) => this.mapToDomain(dbTransaction));
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const userAccounts = await this.drizzle.db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, userId));

    const accountIds = userAccounts.map((a) => a.id);

    if (accountIds.length === 0) return [];

    const result = await this.drizzle.db
      .select()
      .from(transactions)
      .where(inArray(transactions.accountId, accountIds))
      .orderBy(desc(transactions.date));

    return result.map((dbTransaction) => this.mapToDomain(dbTransaction));
  }

  async findByUserIdAndDateRange(
    userId: string,
    dateRange: DateRange,
  ): Promise<Transaction[]> {
    const userAccounts = await this.drizzle.db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.userId, userId));

    const accountIds = userAccounts.map((a) => a.id);

    if (accountIds.length === 0) return [];

    const result = await this.drizzle.db
      .select()
      .from(transactions)
      .where(
        and(
          inArray(transactions.accountId, accountIds),
          gte(transactions.date, dateRange.startDate),
          lte(transactions.date, dateRange.endDate),
        ),
      )
      .orderBy(desc(transactions.date));

    return result.map((dbTransaction) => this.mapToDomain(dbTransaction));
  }

  async update(transaction: Transaction): Promise<void> {
    await this.drizzle.db
      .update(transactions)
      .set({
        amount: transaction.amount.amount.toString(),
        description: transaction.description,
        categoryId: transaction.categoryId,
        tags: transaction.tags,
        metadata: transaction.metadata,
      })
      .where(eq(transactions.id, transaction.id));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db.delete(transactions).where(eq(transactions.id, id));
  }

  private mapToDomain(dbTransaction: DbTransaction): Transaction {
    return new Transaction(
      dbTransaction.id,
      dbTransaction.accountId,
      dbTransaction.categoryId,
      new Money(
        parseFloat(dbTransaction.amount),
        dbTransaction.currency as Currency,
      ),
      dbTransaction.description,
      dbTransaction.date,
      dbTransaction.type as TransactionType,
      dbTransaction.tags ?? [],
      dbTransaction.metadata ?? undefined,
      dbTransaction.createdAt,
    );
  }
}
