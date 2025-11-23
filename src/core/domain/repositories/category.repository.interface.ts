import { Category } from '../entities/category.entity';
import { TransactionType } from '../value-objects/transaction-type.vo';

export interface ICategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  findByUserIdAndType(
    userId: string,
    type: TransactionType,
  ): Promise<Category[]>;
  findSystemCategories(): Promise<Category[]>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}
