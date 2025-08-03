import { Module } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  controllers: [SkillsController],
  providers: [SkillsService, PrismaService],
  exports: [SkillsService],
})
export class SkillsModule {}
