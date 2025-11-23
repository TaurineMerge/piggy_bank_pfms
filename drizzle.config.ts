import type { Config } from 'drizzle-kit';
import 'dotenv/config';

export default {
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema/*',
  out: './src/infrastructure/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
