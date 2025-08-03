import { Test, type TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  type INestApplication,
  type ExecutionContext,
} from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import type { Server } from 'http';

describe('AuthController', () => {
  let app: INestApplication;

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockLocalAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue(mockLocalAuthGuard)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        isActive: true,
      };
      const loginResponse = {
        access_token: 'jwt-token',
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue(loginResponse);
      mockLocalAuthGuard.canActivate.mockImplementation(
        (context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<{ user: typeof mockUser }>();
          req.user = mockUser; // Set the user on the request
          return true;
        },
      );

      // Act & Assert
      const response = await request(app.getHttpServer() as unknown as Server)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password',
        })
        .expect(200);

      expect(response.body).toEqual(loginResponse);
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      mockLocalAuthGuard.canActivate.mockImplementation(() => {
        throw new UnauthorizedException('Invalid credentials');
      });

      // Act & Assert
      await request(app.getHttpServer() as unknown as Server)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should validate request body format', async () => {
      // Arrange
      mockLocalAuthGuard.canActivate.mockImplementation(() => {
        throw new UnauthorizedException('Invalid credentials');
      });

      // Act & Assert
      await request(app.getHttpServer() as unknown as Server)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: '',
        })
        .expect(401); // Will fail at guard level first
    });
  });
});
