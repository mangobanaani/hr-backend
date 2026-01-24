import { UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AuthController, type AuthenticatedRequest } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    validateUserById: jest.fn(),
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
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  type MockRequest = AuthenticatedRequest & {
    ip?: string;
    headers?: Record<string, string>;
  };

  describe('login', () => {
    it('returns refresh_token', async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: 'access',
        refresh_token: 'refresh',
        user: { id: 'u1', email: 'a@b.com', isActive: true },
      });

      const result = await controller.login({
        user: { id: 'u1', email: 'a@b.com', isActive: true },
      });

      expect(result.refresh_token).toBe('refresh');
    });

    it('should return auth service response for valid user', async () => {
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

      const request: MockRequest = {
        user: mockUser,
        ip: '127.0.0.1',
        headers: { 'user-agent': 'jest-agent' },
      };

      const result = await controller.login(request);

      expect(result).toEqual(loginResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          email: 'test@example.com',
          password: '',
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        { ipAddress: '127.0.0.1', userAgent: 'jest-agent' },
      );
    });

    it('should surface unauthorized errors from auth service', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        isActive: false,
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Account is deactivated'),
      );

      const request: MockRequest = {
        user: mockUser,
      };

      await expect(controller.login(request)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('uses Authorization bearer refresh token', async () => {
      mockAuthService.refresh.mockResolvedValue({
        access_token: 'access',
        refresh_token: 'refresh2',
        user: { id: 'u1', email: 'a@b.com', isActive: true },
      });

      const result = await controller.refresh('Bearer refresh1');

      expect(mockAuthService.refresh).toHaveBeenCalledWith('refresh1');
      expect(result.refresh_token).toBe('refresh2');
    });

    it('throws UnauthorizedException when header is missing', async () => {
      await expect(controller.refresh(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('uses Authorization bearer refresh token', async () => {
      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      const result = await controller.logout('Bearer refresh1');

      expect(mockAuthService.logout).toHaveBeenCalledWith('refresh1');
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('getProfile', () => {
    it('returns profile when user is found', async () => {
      const now = new Date();
      mockAuthService.validateUserById.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      const result = await controller.getProfile({
        user: { id: 'u1', email: 'a@b.com', isActive: true },
      });

      expect(mockAuthService.validateUserById).toHaveBeenCalledWith('u1');
      expect(result).toEqual({
        id: 'u1',
        email: 'a@b.com',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        employee: null,
      });
    });

    it('throws when authenticated user cannot be loaded', async () => {
      mockAuthService.validateUserById.mockResolvedValue(null);

      await expect(
        controller.getProfile({
          user: { id: 'u1', email: 'a@b.com', isActive: true },
        }),
      ).rejects.toThrow('User not found');
    });
  });
});
