import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Departments E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let companyId: string;
  let departmentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.$transaction([
      prismaService.employeeTraining.deleteMany(),
      prismaService.training.deleteMany(),
      prismaService.employeeBenefit.deleteMany(),
      prismaService.benefit.deleteMany(),
      prismaService.employeeSkill.deleteMany(),
      prismaService.skill.deleteMany(),
      prismaService.employment.deleteMany(),
      prismaService.employee.deleteMany(),
      prismaService.user.deleteMany(),
      prismaService.department.deleteMany(),
      prismaService.company.deleteMany(),
    ]);

    // Create test data with unique identifiers
    const timestamp = Date.now().toString();
    
    // Create company
    const company = await prismaService.company.create({
      data: {
        name: `Test Company ${timestamp}`,
        description: 'Test company for e2e tests',
        industry: 'Technology',
      },
    });
    companyId = company.id;

    // Hash password properly
    const hashedPassword = await bcrypt.hash('password', 10);

    // Create a test user first with unique email
    const user = await prismaService.user.create({
      data: {
        email: `test-${timestamp}@example.com`,
        password: hashedPassword,
        isActive: true,
      },
    });

    // Create test department
    const department = await prismaService.department.create({
      data: {
        name: `Engineering ${timestamp}`,
        description: 'Software development department',
        code: `ENG-${timestamp}`,
        companyId: company.id,
      },
    });
    departmentId = department.id;

    // Create an employee to establish relationship
    await prismaService.employee.create({
      data: {
        employeeNumber: `EMP-${timestamp}`,
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe-${timestamp}@company.com`,
        hireDate: new Date(),
        companyId: company.id,
        departmentId: department.id,
        userId: user.id,
      },
    });

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `test-${timestamp}@example.com`,
        password: 'password',
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.access_token;
    } else {
      throw new Error(`Login failed with status ${loginResponse.status.toString()}`);
    }
  });

  describe('Department CRUD Operations', () => {
    it('should create a new department', async () => {
      const timestamp = Date.now().toString();
      const createDepartmentDto = {
        name: `Marketing ${timestamp}`,
        description: 'Marketing and communications department',
        code: `MKT-${timestamp}`,
        companyId,
        budget: 50000,
      };

      const response = await request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(createDepartmentDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createDepartmentDto.name);
      expect(response.body.code).toBe(createDepartmentDto.code);
      expect(response.body.companyId).toBe(companyId);
    });

    it('should get all departments', async () => {
      const response = await request(app.getHttpServer())
        .get('/departments')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a department by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/departments/${departmentId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(response.body.id).toBe(departmentId);
      expect(response.body.name).toContain('Engineering');
    });

    it('should update a department', async () => {
      const updateDto = {
        name: 'Software Engineering',
        description: 'Updated software development department',
        budget: 75000,
      };

      const response = await request(app.getHttpServer())
        .patch(`/departments/${departmentId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.description).toBe(updateDto.description);
    });

    it('should delete a department', async () => {
      // First remove employees from department
      await prismaService.employee.updateMany({
        where: { departmentId },
        data: { departmentId: null },
      });

      await request(app.getHttpServer())
        .delete(`/departments/${departmentId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      // Verify department is deleted
      await request(app.getHttpServer())
        .get(`/departments/${departmentId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(404);
    });
  });

  describe('Department Hierarchy', () => {
    it('should create parent-child department relationships', async () => {
      const timestamp = Date.now().toString();
      
      // Create parent department
      const parentDept = await prismaService.department.create({
        data: {
          name: `Parent Department ${timestamp}`,
          code: `PARENT-${timestamp}`,
          description: 'Parent department',
          companyId,
        },
      });

      // Create child department
      const createChildDto = {
        name: `Child Department ${timestamp}`,
        code: `CHILD-${timestamp}`,
        description: 'Child department',
        companyId,
        parentId: parentDept.id,
      };

      const response = await request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(createChildDto)
        .expect(201);

      expect(response.body.parentId).toBe(parentDept.id);
    });

    it('should get departments by company', async () => {
      const response = await request(app.getHttpServer())
        .get('/departments')
        .query({ companyId })
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Department Validation', () => {
    it('should reject department creation with invalid data', async () => {
      const invalidDto = {
        name: '', // Empty name should be rejected
        code: '', // Empty code should be rejected
        companyId: 'invalid-company-id',
      };

      await request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject duplicate department code', async () => {
      const timestamp = Date.now().toString();
      const duplicateCodeDto = {
        name: `Another Department ${timestamp}`,
        code: `ENG-${timestamp}`, // Using same code as existing department
        description: 'Department with duplicate code',
        companyId,
      };

      await request(app.getHttpServer())
        .post('/departments')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(duplicateCodeDto)
        .expect(400);
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/departments')
        .expect(401);
    });

    it('should handle non-existent department ID', async () => {
      const fakeId = 'non-existent-id';
      await request(app.getHttpServer())
        .get(`/departments/${fakeId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(404);
    });
  });
});
