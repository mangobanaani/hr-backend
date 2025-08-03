import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Training E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;

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
      prismaService.performanceReview.deleteMany(),
      prismaService.employee.deleteMany(),
      prismaService.user.deleteMany(),
      prismaService.company.deleteMany(),
    ]);

    // Create test data with unique identifiers
    const timestamp = Date.now().toString();
    const company = await prismaService.company.create({
      data: {
        name: `Test Company ${timestamp}`,
        description: 'Test company for e2e tests',
        industry: 'Technology',
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

    await prismaService.employee.create({
      data: {
        employeeNumber: `EMP-${timestamp}`,
        firstName: 'John',
        lastName: 'Doe',
        email: `john.doe-${timestamp}@company.com`,
        hireDate: new Date(),
        companyId: company.id,
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

  describe('Training CRUD Operations', () => {
    it('should create a new training', async () => {
      const createTrainingDto = {
        title: 'Test Training',
        description: 'A test training program',
        type: 'ONLINE',
        provider: 'Company Training Dept',
        duration: 8,
        cost: 500,
        isRequired: false,
      };

      const response = await request(app.getHttpServer())
        .post('/training')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(createTrainingDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createTrainingDto.title);
    });

    it('should get all trainings', async () => {
      // First create a training
      await prismaService.training.create({
        data: {
          title: 'Sample Training',
          description: 'A sample training',
          type: 'WORKSHOP',
          provider: 'External Provider',
          duration: 4,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/training')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a training by ID', async () => {
      // Create a training first
      const training = await prismaService.training.create({
        data: {
          title: 'Get Test Training',
          description: 'Training for get test',
          type: 'SEMINAR',
          duration: 2,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/training/${training.id}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('id', training.id);
      expect(response.body.title).toBe(training.title);
    });

    it('should update a training', async () => {
      // Create a training first
      const training = await prismaService.training.create({
        data: {
          title: 'Update Test Training',
          description: 'Training for update test',
          type: 'CERTIFICATION',
          duration: 16,
        },
      });

      const updateDto = {
        title: 'Updated Training Title',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/training/${training.id}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe(updateDto.title);
      expect(response.body.description).toBe(updateDto.description);
    });

    it('should delete a training', async () => {
      // Create a training first
      const training = await prismaService.training.create({
        data: {
          title: 'Delete Test Training',
          description: 'Training for delete test',
          type: 'ON_THE_JOB',
          duration: 8,
        },
      });

      await request(app.getHttpServer())
        .delete(`/training/${training.id}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      // Verify it's deleted
      await request(app.getHttpServer())
        .get(`/training/${training.id}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(404);
    });
  });
});
