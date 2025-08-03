import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/database/prisma.service';

describe('Skills E2E Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let skillId: string;

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
      prismaService.employeeSkill.deleteMany(),
      prismaService.jobSkill.deleteMany(),
      prismaService.skill.deleteMany(),
      prismaService.employee.deleteMany(),
      prismaService.user.deleteMany(),
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

    // Create test skill
    const skill = await prismaService.skill.create({
      data: {
        name: `JavaScript ${timestamp}`,
        description: 'JavaScript programming language',
        category: 'TECHNICAL',
      },
    });
    skillId = skill.id;

    // Create an employee to establish relationship
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

  describe('Skill CRUD Operations', () => {
    it('should create a new skill', async () => {
      const timestamp = Date.now().toString();
      const createSkillDto = {
        name: `Python ${timestamp}`,
        description: 'Python programming language',
        category: 'TECHNICAL',
      };

      const response = await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(createSkillDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(createSkillDto.name);
      expect(response.body.category).toBe(createSkillDto.category);
    });

    it('should get all skills', async () => {
      const response = await request(app.getHttpServer())
        .get('/skills')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get a skill by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/skills/${skillId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(response.body.id).toBe(skillId);
      expect(response.body.category).toBe('TECHNICAL');
      expect(response.body.name).toContain('JavaScript');
    });

    it('should update a skill', async () => {
      const updateDto = {
        name: 'Advanced JavaScript',
        description: 'Advanced JavaScript programming with modern features',
      };

      const response = await request(app.getHttpServer())
        .patch(`/skills/${skillId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(updateDto)
        .expect(200);

      expect(response.body.name).toBe(updateDto.name);
      expect(response.body.description).toBe(updateDto.description);
    });

    it('should delete a skill', async () => {
      // First remove any skill associations
      await prismaService.employeeSkill.deleteMany({
        where: { skillId },
      });

      await request(app.getHttpServer())
        .delete(`/skills/${skillId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      // Verify skill is deleted
      await request(app.getHttpServer())
        .get(`/skills/${skillId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(404);
    });
  });

  describe('Skill Categorization', () => {
    it('should filter skills by category', async () => {
      // Create skills in different categories
      const timestamp = Date.now().toString();
      await prismaService.skill.create({
        data: {
          name: `Communication ${timestamp}`,
          description: 'Effective communication skills',
          category: 'SOFT',
        },
      });

      const response = await request(app.getHttpServer())
        .get('/skills')
        .query({ category: 'TECHNICAL' })
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should search skills by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/skills')
        .query({ search: 'JavaScript' })
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Skill Validation', () => {
    it('should reject skill creation with invalid data', async () => {
      const invalidDto = {
        name: '', // Empty name should be rejected
        category: 'INVALID_CATEGORY', // Invalid category
      };

      await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(invalidDto)
        .expect(400);
    });

    it('should reject unauthorized access', async () => {
      await request(app.getHttpServer())
        .get('/skills')
        .expect(401);
    });

    it('should handle non-existent skill ID', async () => {
      const fakeId = 'non-existent-id';
      await request(app.getHttpServer())
        .get(`/skills/${fakeId}`)
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .expect(404);
    });

    it('should prevent duplicate skill names', async () => {
      const timestamp = Date.now().toString();
      const duplicateSkillDto = {
        name: `JavaScript ${timestamp}`, // Same name as existing skill
        description: 'Duplicate skill',
        category: 'TECHNICAL',
      };

      await request(app.getHttpServer())
        .post('/skills')
        .set('Authorization', authToken ? `Bearer ${authToken}` : '')
        .send(duplicateSkillDto)
        .expect(409); // Conflict
    });
  });
});
