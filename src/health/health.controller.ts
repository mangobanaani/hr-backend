import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import {
  HealthCheckResponse,
  DatabaseHealthResponse,
  SystemHealthResponse,
} from './interfaces/health.interface';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Overall health check',
    description: 'Check the overall health of the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check completed',
  })
  async check(): Promise<HealthCheckResponse> {
    return this.healthService.check();
  }

  @Get('database')
  @ApiOperation({
    summary: 'Database health check',
    description: 'Check database connectivity and performance',
  })
  @ApiResponse({
    status: 200,
    description: 'Database health check completed',
  })
  async checkDatabase(): Promise<DatabaseHealthResponse> {
    return this.healthService.checkDatabase();
  }

  @Get('system')
  @ApiOperation({
    summary: 'System health check',
    description: 'Check system resources (memory, uptime)',
  })
  @ApiResponse({
    status: 200,
    description: 'System health check completed',
  })
  async checkSystem(): Promise<SystemHealthResponse> {
    return this.healthService.checkSystem();
  }
}
