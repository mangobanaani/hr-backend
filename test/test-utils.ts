import type { PrismaService } from '../src/database/prisma.service';

export class TestUtils {
  constructor(private readonly prismaService: PrismaService) {}

  async cleanDatabase(): Promise<void> {
    // Clean up all tables in dependency order
    const tablenames = [
      'user_sessions',
      'user_roles',
      'employee_documents',
      'employee_benefits',
      'employee_trainings',
      'employee_skills',
      'team_members',
      'team_projects',
      'time_records',
      'leave_requests',
      'expenses',
      'goals',
      'feedback',
      'performance_reviews',
      'salaries',
      'employments',
      'employees',
      'teams',
      'departments',
      'locations',
      'companies',
      'users',
      'roles',
      'skills',
      'job_positions',
      'job_skills',
      'benefits',
      'trainings',
      'leave_types',
      'expense_categories',
      'document_types',
      'projects',
      'budget_items',
      'policies',
      'announcements',
    ];

    for (const tablename of tablenames) {
      try {
        await this.prismaService.$executeRawUnsafe(
          `TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`,
        );
      } catch {
        // Table might not exist or might be empty
        continue;
      }
    }
  }

  async createTestUser(overrides: Partial<any> = {}): Promise<any> {
    return this.prismaService.user.create({
      data: {
        email: 'test@example.com',
        password:
          '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdMxUTDHp/8lBx1fK',
        isActive: true,
        ...overrides,
      },
    });
  }

  async createTestCompany(overrides: Partial<any> = {}): Promise<any> {
    return this.prismaService.company.create({
      data: {
        name: 'Test Company',
        industry: 'Technology',
        ...overrides,
      },
    });
  }

  async createTestEmployee(
    companyId: string,
    overrides: Partial<any> = {},
  ): Promise<any> {
    return this.prismaService.employee.create({
      data: {
        employeeNumber: `EMP${Date.now()}`,
        firstName: 'John',
        lastName: 'Doe',
        email: `test${Date.now()}@example.com`,
        hireDate: new Date(),
        status: 'ACTIVE',
        companyId,
        ...overrides,
      },
    });
  }

  async createTestDepartment(
    companyId: string,
    overrides: Partial<any> = {},
  ): Promise<any> {
    return this.prismaService.department.create({
      data: {
        name: 'Test Department',
        code: `DEPT${Date.now()}`,
        companyId,
        ...overrides,
      },
    });
  }

  async createTestRole(overrides: Partial<any> = {}): Promise<any> {
    return this.prismaService.role.create({
      data: {
        name: `TestRole${Date.now()}`,
        description: 'Test role for testing',
        permissions: ['read:profile', 'update:profile'],
        ...overrides,
      },
    });
  }
}
