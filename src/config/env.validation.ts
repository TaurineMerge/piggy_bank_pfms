// src/config/env.validation.ts
import { z } from 'zod';

// Validation schema
export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WHITELIST: z.string().optional().default(''),

  // App
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default(3000),

  // Redis
  REDIS_HOST: z.string().optional().default('localhost'),
  REDIS_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .optional()
    .default(6379),
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Environment {
  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((issue) => issue.path.join('.'))
        .join(', ');

      throw new Error(
        `❌ Invalid environment variables: ${missingVars}\n` +
          `Details: ${error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')}`,
      );
    }
    throw error;
  }
}
