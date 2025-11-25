import { DrizzleService } from '../drizzle.service';
import { categories } from '../schema/categories.schema';
import { defaultCategories } from './categories.seed';

export async function seedCategories(drizzleService: DrizzleService) {
  console.log('🌱 Seeding categories...');

  const existing = await drizzleService.db.select().from(categories).limit(1);

  if (existing.length > 0) {
    console.log('✅ Categories already exist, skipping seed');
    return;
  }

  await drizzleService.db.insert(categories).values(defaultCategories);

  console.log(`✅ Seeded ${defaultCategories.length} categories`);
}
