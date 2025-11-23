import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  icon: varchar('icon', { length: 50 }).notNull(),
  parentCategoryId: uuid('parent_category_id').references(
    (): any => categories.id,
    { onDelete: 'set null' },
  ),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type DbCategory = typeof categories.$inferSelect;
export type NewDbCategory = typeof categories.$inferInsert;
