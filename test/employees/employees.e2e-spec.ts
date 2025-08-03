import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Employees E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let companyId: string;
  let employeeId: string;

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

    // Create department
    const department = await prismaService.department.create({
      data: {
        name: `Engineering ${timestamp}`,
        description: 'Software development department',
        code: `ENG-${timestamp}`,
        companyId: company.id,
      },
    });

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

    // Create test employee
    const employee = await prismaService.employee.create({
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
    employeeId = employee.id;

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

  describe('Employee CRUD Operations', () => {
    it('should create a new employee', async () => {
      const timestamp = Date.now().toString();
      const hashedPassword = await bcrypt.hash('newemployee123', 10);
      
      // First create a user for the new employee
      const newUser = await prismaService.user.create({
        data: {
          email: `newemployee-${timestamp}@example.com`,
          password: hashedPassword,
          isActive: true,
        },
      });

      const createEmployeeDto = {
        employeeNumber: `EMP-NEW-${timestamp}`,
        firstName: 'Jane',
        lastName: 'Smith',
        email: `jane.smith-${timestamp}@company.com`,
        phone: '+1234567890',
        hireDate: new Date().toISOString(),
        position: 'Software Developer',
        companyId,
        userId: newUser.id,
      };

      const response = await request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(createEmployeeDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(createEmployeeDto.firstName);
      expect(response.body.lastName).toBe(createEmployeeDto.lastName);
      expect(response.body.email).toBe(createEmployeeDto.email);
    });

    it('should get all employees', async () => {
      const response = await request(app.getHttpServer())
        .get('/employees')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get an employee by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/employees/${employeeId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(response.body.id).toBe(employeeId);
      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
    });

    it('should update an employee', async () => {
      const updateDto = {
        firstName: 'Jonathan',
        lastName: 'Doe',
        position: 'Senior Developer',
      };

      const response = await request(app.getHttpServer())
        .patch(`/employees/${employeeId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(updateDto)
        .expect(200);

      expect(response.body.firstName).toBe(updateDto.firstName);
      expect(response.body.position).toBe(updateDto.position);
    });

    it('should delete an employee', async () => {
      await request(app.getHttpServer())
        .delete(`/employees/${employeeId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      // Verify employee is deleted
      await request(app.getHttpServer())
        .get(`/employees/${employeeId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(404);
    });
  });

  describe('Employee Search and Filtering', () => {
    it('should search employees by department', async () => {
      const response = await request(app.getHttpServer())
        .get('/employees')
        .query({ departmentId: companyId })
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search employees by company', async () => {
      const response = await request(app.getHttpServer())
        .get('/employees')
        .query({ companyId: companyId })
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Employee Validation', () => {
    it('should reject employee creation with invalid data', async () => {
      const invalidDto = {
        firstName: '', // Empty name should be rejected
        lastName: 'Smith',
        email: 'invalid-email', // Invalid email format
      };

      await request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/employees')
        .expect(401);
    });
  });
});
