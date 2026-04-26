import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './indicators/database.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator, PrismaService],
  exports: [DatabaseHealthIndicator],
})
export class HealthModule {}
