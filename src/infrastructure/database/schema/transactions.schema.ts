import {
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { accounts } from './accounts.schema';
import { categories } from './categories.schema';

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accounts.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'restrict' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  description: text('description').notNull(),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  tags: varchar('tags', { length: 50 }).array().default([]),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type DbTransaction = typeof transactions.$inferSelect;
export type NewDbTransaction = typeof transactions.$inferInsert;
