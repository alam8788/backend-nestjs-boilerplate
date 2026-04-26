import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'prisma/generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    // 1. Setup the connection pool using your env variable
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // 2. Create the Prisma adapter
    const adapter = new PrismaPg(pool as any);

    // 3. Pass the adapter to the super constructor
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
