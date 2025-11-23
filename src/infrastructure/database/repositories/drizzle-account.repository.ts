import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { accounts, DbAccount } from '../schema/accounts.schema';
import { IAccountRepository } from '../../../core/domain/repositories/account.repository.interface';
import { Account } from '../../../core/domain/entities/account.entity';
import { Money } from '../../../core/domain/value-objects/money.vo';
import { Currency } from '../../../core/domain/value-objects/currency.vo';

@Injectable()
export class DrizzleAccountRepository implements IAccountRepository {
  constructor(private drizzle: DrizzleService) {}

  async save(account: Account): Promise<void> {
    await this.drizzle.db.insert(accounts).values({
      id: account.id,
      userId: account.userId,
      name: account.name,
      balance: account.balance.amount.toString(),
      currency: account.balance.currency,
      isActive: account.isActive,
    });
  }

  async findById(id: string): Promise<Account | null> {
    const result = await this.drizzle.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);

    const dbAccount = result[0];
    return dbAccount ? this.mapToDomain(dbAccount) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const result = await this.drizzle.db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));

    return result.map((dbAccount) => this.mapToDomain(dbAccount));
  }

  async findActiveByUserId(userId: string): Promise<Account[]> {
    const result = await this.drizzle.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)));

    return result.map((dbAccount) => this.mapToDomain(dbAccount));
  }

  async findDefaultByUserId(userId: string): Promise<Account | null> {
    const result = await this.drizzle.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), eq(accounts.isActive, true)))
      .limit(1);

    const dbAccount = result[0];
    return dbAccount ? this.mapToDomain(dbAccount) : null;
  }

  async update(account: Account): Promise<void> {
    await this.drizzle.db
      .update(accounts)
      .set({
        name: account.name,
        balance: account.balance.amount.toString(),
        isActive: account.isActive,
      })
      .where(eq(accounts.id, account.id));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db.delete(accounts).where(eq(accounts.id, id));
  }

  private mapToDomain(dbAccount: DbAccount): Account {
    return new Account(
      dbAccount.id,
      dbAccount.userId,
      dbAccount.name,
      new Money(parseFloat(dbAccount.balance), dbAccount.currency as Currency),
      dbAccount.isActive,
      dbAccount.createdAt,
    );
  }
}
