import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class MemoryHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async checkHeap(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);

    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    const threshold = 1024;

    const isHealthy = heapUsed < threshold;
    const data = { heapUsed: `${heapUsed.toFixed(2)}MB` };

    if (!isHealthy) {
      return indicator.down({ ...data, message: 'Heap usage too high' });
    }

    return indicator.up(data);
  }
}
