import { Module } from '@nestjs/common';
import { EmployeeSkillsService } from './employee-skills.service';
import { EmployeeSkillsController } from './employee-skills.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeSkillsController],
  providers: [EmployeeSkillsService],
  exports: [EmployeeSkillsService],
})
export class EmployeeSkillsModule {}
