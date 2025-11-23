import {
  pgTable,
  uuid,
  varchar,
  decimal,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 })
    .notNull()
    .default('0'),
  currency: varchar('currency', { length: 3 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type DbAccount = typeof accounts.$inferSelect;
export type NewDbAccount = typeof accounts.$inferInsert;
