import { Injectable } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { categories, DbCategory } from '../schema/categories.schema';
import { ICategoryRepository } from '../../../core/domain/repositories/category.repository.interface';
import { Category } from '../../../core/domain/entities/category.entity';
import { TransactionType } from '../../../core/domain/value-objects/transaction-type.vo';

@Injectable()
export class DrizzleCategoryRepository implements ICategoryRepository {
  constructor(private drizzle: DrizzleService) {}

  async save(category: Category): Promise<void> {
    await this.drizzle.db.insert(categories).values({
      id: category.id,
      userId: category.userId,
      name: category.name,
      type: category.type,
      icon: category.icon,
      parentCategoryId: category.parentCategoryId,
    });
  }

  async findById(id: string): Promise<Category | null> {
    const result = await this.drizzle.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    const dbCategory = result[0];
    return dbCategory ? this.mapToDomain(dbCategory) : null;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const result = await this.drizzle.db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));

    return result.map((dbCategory) => this.mapToDomain(dbCategory));
  }

  async findByUserIdAndType(
    userId: string,
    type: TransactionType,
  ): Promise<Category[]> {
    const result = await this.drizzle.db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.type, type)));

    return result.map((dbCategory) => this.mapToDomain(dbCategory));
  }

  async findSystemCategories(): Promise<Category[]> {
    const result = await this.drizzle.db
      .select()
      .from(categories)
      .where(isNull(categories.userId));

    return result.map((dbCategory) => this.mapToDomain(dbCategory));
  }

  async update(category: Category): Promise<void> {
    await this.drizzle.db
      .update(categories)
      .set({
        name: category.name,
        icon: category.icon,
      })
      .where(eq(categories.id, category.id));
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db.delete(categories).where(eq(categories.id, id));
  }

  private mapToDomain(dbCategory: DbCategory): Category {
    return new Category(
      dbCategory.id,
      dbCategory.userId,
      dbCategory.name,
      dbCategory.type as TransactionType,
      dbCategory.icon,
      dbCategory.parentCategoryId,
    );
  }
}
