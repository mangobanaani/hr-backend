import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class PerformanceModule {
  // Consolidated Performance management module for HR system
  // TODO: Add controller and service when implemented
}
