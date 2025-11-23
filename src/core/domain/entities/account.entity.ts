import { Money } from '../value-objects/money.vo';
import { Currency } from '../value-objects/currency.vo';
import { DomainError } from '../value-objects/money.vo';

export class Account {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public name: string,
    public balance: Money,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
  ) {}

  get currency(): Currency {
    return this.balance.currency;
  }

  increaseBalance(amount: Money): void {
    if (amount.currency !== this.balance.currency) {
      throw new DomainError('Cannot operate on different currencies');
    }

    this.balance = this.balance.add(amount);
  }

  decreaseBalance(amount: Money): void {
    if (amount.currency !== this.balance.currency) {
      throw new DomainError('Cannot operate on different currencies');
    }

    this.balance = this.balance.subtract(amount);
  }

  deactivate(): void {
    if (!this.balance.isZero()) {
      throw new DomainError('Cannot deactivate account with non-zero balance');
    }
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }

  rename(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new DomainError('Account name cannot be empty');
    }
    this.name = newName.trim();
  }
}
