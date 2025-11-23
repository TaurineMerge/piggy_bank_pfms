import { Currency, CurrencySymbol } from './currency.vo';

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency,
  ) {
    if (amount < 0) {
      throw new DomainError('Money amount cannot be negative');
    }

    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency;
  }

  add(money: Money): Money {
    this.ensureSameCurrency(money);
    return new Money(this.amount + money.amount, this.currency);
  }

  subtract(money: Money): Money {
    this.ensureSameCurrency(money);
    return new Money(this.amount - money.amount, this.currency);
  }

  multiply(multiplier: number): Money {
    return new Money(this.amount * multiplier, this.currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  format(): string {
    return `${this.amount} ${CurrencySymbol[this.currency]}`;
  }

  doesEqualTo(money: Money): boolean {
    return this.amount === money.amount && this.currency === money.currency;
  }

  private ensureSameCurrency(money: Money): void {
    if (this.currency !== money.currency) {
      throw new DomainError(
        `Cannot operate on different currencies: ${this.currency} and ${money.currency}`,
      );
    }
  }
}
