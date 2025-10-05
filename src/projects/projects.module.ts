import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {
  // Projects management module for HR system
}
