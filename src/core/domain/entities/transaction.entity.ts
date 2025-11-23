import { Money } from '../value-objects/money.vo';
import { TransactionType } from '../value-objects/transaction-type.vo';
import { DomainError } from '../value-objects/money.vo';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly accountId: string,
    public categoryId: string,
    public amount: Money,
    public description: string,
    public date: Date,
    public readonly type: TransactionType,
    public tags: string[] = [],
    public metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
  ) {
    if (amount.isNegative()) {
      throw new DomainError('Transaction amount cannot be negative');
    }
  }

  isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  hasTag(tag: string): boolean {
    return this.tags.includes(tag);
  }

  addTag(tag: string): void {
    if (!this.hasTag(tag)) {
      this.tags.push(tag);
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  canBeEdited(currentDate: Date = new Date()): boolean {
    const daysDiff = Math.floor(
      (currentDate.getTime() - this.date.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff <= 30;
  }

  updateAmount(newAmount: Money): void {
    if (newAmount.currency !== this.amount.currency) {
      throw new DomainError('Cannot change transaction currency');
    }
    if (newAmount.amount <= 0) {
      throw new DomainError('Transaction amount must be positive');
    }
    this.amount = newAmount;
  }

  updateDescription(newDescription: string): void {
    if (!newDescription || newDescription.trim().length === 0) {
      throw new DomainError('Description cannot be empty');
    }
    this.description = newDescription.trim();
  }

  updateCategory(newCategoryId: string): void {
    this.categoryId = newCategoryId;
  }
}
