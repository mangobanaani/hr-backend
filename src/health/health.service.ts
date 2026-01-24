import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  HealthCheckResponse,
  DatabaseHealthResponse,
  SystemHealthResponse,
} from './interfaces/health.interface';

@Injectable()
export class HealthService {
  private startTime: number;

  constructor(private readonly prisma: PrismaService) {
    this.startTime = Date.now();
  }

  async check(): Promise<HealthCheckResponse> {
    const databaseCheck = await this.isDatabaseHealthy();
    const memoryCheck = this.isMemoryHealthy();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (!databaseCheck || !memoryCheck) {
      status = 'degraded';
    }
    if (!databaseCheck) {
      status = 'unhealthy';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      checks: {
        database: databaseCheck,
        memory: memoryCheck,
      },
    };
  }

  async checkDatabase(): Promise<DatabaseHealthResponse> {
    const startTime = Date.now();
    let connected = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      connected = true;
    } catch (error) {
      connected = false;
    }

    const responseTime = Date.now() - startTime;

    return {
      status: connected ? 'healthy' : 'unhealthy',
      responseTime,
      connected,
      timestamp: new Date().toISOString(),
    };
  }

  async checkSystem(): Promise<SystemHealthResponse> {
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // Simple CPU usage estimation based on memory
    const cpuUsage = memoryPercentage > 80 ? 80 : memoryPercentage / 2;

    const status = memoryPercentage > 90 ? 'degraded' : 'healthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      memory: {
        used: usedMemory,
        total: totalMemory,
        percentage: Math.round(memoryPercentage * 100) / 100,
      },
      cpu: {
        usage: Math.round(cpuUsage * 100) / 100,
      },
    };
  }

  private async isDatabaseHealthy(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private isMemoryHealthy(): boolean {
    const memoryUsage = process.memoryUsage();
    const percentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    return percentage < 90;
  }

  private getUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}
