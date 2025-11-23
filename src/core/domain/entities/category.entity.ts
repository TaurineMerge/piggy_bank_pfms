import { TransactionType } from '../value-objects/transaction-type.vo';

export class Category {
  constructor(
    public readonly id: string,
    public readonly userId: string | null, // null = standard category
    public name: string,
    public readonly type: TransactionType,
    public icon: string,
    public readonly parentCategoryId: string | null = null,
  ) {}

  isStandard(): boolean {
    return this.userId === null;
  }

  hasParent(): boolean {
    return this.parentCategoryId !== null;
  }
}
