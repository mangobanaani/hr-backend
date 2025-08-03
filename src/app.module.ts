import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  // Main application module for HR system
}
