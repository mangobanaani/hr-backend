import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TimeTrackingController],
  providers: [TimeTrackingService],
  exports: [TimeTrackingService],
})
export class TimeTrackingModule {
  // Time tracking module for HR system
}
