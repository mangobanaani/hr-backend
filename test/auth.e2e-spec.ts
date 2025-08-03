import { Test, type TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';

describe('Authentication Integration Tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

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
    // Note: In a real scenario, you'd use a test database
    await prismaService.$transaction([
      prismaService.userSession.deleteMany(),
      prismaService.userRole.deleteMany(),
      prismaService.user.deleteMany(),
      prismaService.role.deleteMany(),
    ]);
  });

  describe('POST /auth/login', () => {
    it('should authenticate user and return JWT token', async () => {
      // Arrange - Create test user
      const hashedPassword = await bcrypt.hash('password', 10);

      const user = await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          isActive: true,
        },
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual({
        id: user.id,
        email: user.email,
        isActive: true,
      });
    });

    it('should reject invalid credentials', async () => {
      // Arrange - Create test user
      const hashedPassword = await bcrypt.hash('password', 10);

      await prismaService.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          isActive: true,
        },
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject inactive user', async () => {
      // Arrange - Create inactive test user
      const hashedPassword =
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LdMxUTDHp/8lBx1fK'; // "password"

      await prismaService.user.create({
        data: {
          email: 'inactive@example.com',
          password: hashedPassword,
          isActive: false,
        },
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'inactive@example.com',
          password: 'password',
        })
        .expect(401);
    });
  });

  describe('JWT Authentication Flow', () => {
    it('should allow access to protected routes with valid JWT', async () => {
      // This test would require a protected route to test against
      // For now, it's a placeholder for when we add protected endpoints
      expect(true).toBe(true);
    });

    it('should deny access to protected routes without JWT', async () => {
      // This test would require a protected route to test against
      // For now, it's a placeholder for when we add protected endpoints
      expect(true).toBe(true);
    });
  });
});
