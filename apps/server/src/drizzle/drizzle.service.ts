import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  public db!: PostgresJsDatabase<typeof schema>;
  private client!: postgres.Sql;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      'postgresql://postgres:postgres@localhost:6432/swasthyokor';

    this.client = postgres(connectionString, {
      max: Number(this.configService.get<string>('DB_POOL_MAX') || 20),
      idle_timeout: 30,
      connect_timeout: 10,
      prepare: false,
      ssl: 'prefer',
      transform: {
        undefined: null,
      },
    });

    this.db = drizzle(this.client, { schema });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.end();
    }
  }
}
