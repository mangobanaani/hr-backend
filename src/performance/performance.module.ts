import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PerformanceController],
  providers: [PerformanceService],
  exports: [PerformanceService],
})
export class PerformanceModule {
  // Consolidated Performance management module for HR system
}
