import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db: PostgresJsDatabase<typeof schema>;
  private client: ReturnType<typeof postgres>;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const connectionString = this.configService.get<string>('database.url');

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    this.client = postgres(connectionString, {
      max: 10, // connection pool size
    });

    // Drizzle Initialization
    this.db = drizzle(this.client, {
      schema,
      logger: this.configService.get('app.nodeEnv') === 'development',
    });

    console.log('Database connected');
  }

  async onModuleDestroy() {
    await this.client.end();
    console.log('Database disconnected');
  }
}
