import { Currency } from '../value-objects/currency.vo';

export class User {
  constructor(
    public readonly id: string,
    public readonly telegramId: number,
    public username: string | null,
    public firstName: string | null,
    public lastName: string | null,
    public defaultCurrency: Currency,
    public timezone: string = 'Europe/Moscow',
    public readonly createdAt: Date,
  ) {}

  get fullName(): string | null {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : this.username || 'Пользователь';
  }
}
