import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ProjectsController } from './projects.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectsController],
  providers: [],
  exports: [],
})
export class ProjectsModule {
  // Projects management module for HR system
}
