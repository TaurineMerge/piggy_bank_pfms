import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle.service';
import { users, DbUser } from '../schema/users.schema';
import { IUserRepository } from '../../../core/domain/repositories/user.repository.interface';
import { User } from '../../../core/domain/entities/user.entity';
import { Currency } from '../../../core/domain/value-objects/currency.vo';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(private drizzle: DrizzleService) {}

  async save(user: User): Promise<void> {
    await this.drizzle.db.insert(users).values({
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      defaultCurrency: user.defaultCurrency,
      timezone: user.timezone,
    });
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const dbUser = result[0];
    return dbUser ? this.mapToDomain(dbUser) : null;
  }

  async findByTelegramId(telegramId: number): Promise<User | null> {
    const result = await this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    const dbUser = result[0];
    return dbUser ? this.mapToDomain(dbUser) : null;
  }

  async update(user: User): Promise<void> {
    await this.drizzle.db
      .update(users)
      .set({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        defaultCurrency: user.defaultCurrency,
        timezone: user.timezone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  private mapToDomain(dbUser: DbUser): User {
    return new User(
      dbUser.id,
      dbUser.telegramId,
      dbUser.username,
      dbUser.firstName,
      dbUser.lastName,
      dbUser.defaultCurrency as Currency,
      dbUser.timezone,
      dbUser.createdAt,
    );
  }
}
