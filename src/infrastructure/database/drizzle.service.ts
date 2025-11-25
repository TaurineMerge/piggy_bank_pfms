import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as postgres from 'postgres';
import * as schema from './schema';
import { seedCategories } from './seeds/seed';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  public db: ReturnType<typeof drizzle<typeof schema>>;
  private client: ReturnType<typeof postgres>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('database.url');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    try {
      this.client = postgres(connectionString, {
        max: 10, // connection pool size
        idle_timeout: 20,
        connect_timeout: 10,
      });

      this.db = drizzle(this.client, {
        schema,
        logger: this.configService.get('app.nodeEnv') === 'development',
      });

      await this.client`SELECT 1`;

      if (this.configService.get('app.nodeEnv') === 'development') {
        await seedCategories(this);
      }

      this.logger.log('✅ Database connected (Drizzle ORM)');
    } catch (error) {
      this.logger.error('❌ Database connection failed', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.end({ timeout: 5 });
      this.logger.log('👋 Database disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting database', error);
    }
  }
}
