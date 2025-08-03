import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { BenefitsController } from './benefits.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [BenefitsController],
  providers: [],
  exports: [],
})
export class BenefitsModule {}
