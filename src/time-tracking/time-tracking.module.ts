import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TimeTrackingController } from './time-tracking.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TimeTrackingController],
  providers: [],
  exports: [],
})
export class TimeTrackingModule {
  // Time tracking module for HR system
}
