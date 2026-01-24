import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { LoggerModule } from './common/logging/logger.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { BenefitsModule } from './benefits/benefits.module';
import { PerformanceModule } from './performance/performance.module';
import { TrainingModule } from './training/training.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ProjectsModule } from './projects/projects.module';
import { CompaniesModule } from './companies/companies.module';
import { DocumentsModule } from './documents/documents.module';
import { PoliciesModule } from './policies/policies.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { SecurityModule } from './security/security.module';
import { SkillsModule } from './skills/skills.module';
import { EmployeeSkillsModule } from './employee-skills/employee-skills.module';
import { GoalsModule } from './goals/goals.module';
import { HealthModule } from './health/health.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { CacheModule } from './common/cache/cache.module';

@Module({
  imports: [
    LoggerModule,
    CacheModule,
    SecurityModule,
    DatabaseModule,
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    BenefitsModule,
    PerformanceModule,
    TrainingModule,
    TimeTrackingModule,
    ExpensesModule,
    ProjectsModule,
    CompaniesModule,
    DocumentsModule,
    PoliciesModule,
    AnnouncementsModule,
    SkillsModule,
    EmployeeSkillsModule,
    GoalsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
