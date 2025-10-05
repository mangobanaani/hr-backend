import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [DatabaseModule],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {
  // Goals management module for HR system
}
