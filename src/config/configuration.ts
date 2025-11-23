import { ConfigFactory } from '@nestjs/config';

export const configuration: ConfigFactory = () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
});
