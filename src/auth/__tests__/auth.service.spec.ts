import { Test, type TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../database/prisma.service';
import { mockPrismaService } from '../../../test/setup';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedPassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, string> = {
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      const value = config[key];
      return value !== undefined ? value : defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser('test@example.com', 'password');

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        'password',
        'hashedPassword',
      );
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('test@example.com', 'password');

      // Assert
      expect(result).toBeNull();
      expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      // Assert
      expect(result).toBeNull();
      expect(bcryptMock.compare).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedPassword',
      );
    });

    it('should return null when an error occurs', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      // Act
      const result = await service.validateUser('test@example.com', 'password');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens for active user', async () => {
      // Arrange
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      });
      mockPrismaService.userSession.create.mockResolvedValue({ id: 'sess-1' });

      // Act
      const result = await service.login(mockUser, {
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      });

      // Assert
      expect(result).toEqual({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          isActive: mockUser.isActive,
        },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(mockPrismaService.userSession.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };

      // Act & Assert
      await expect(service.login(inactiveUser)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(inactiveUser)).rejects.toThrow(
        'Account is deactivated',
      );
    });
  });

  describe('validateUserById', () => {
    it('should return user with relations when found and active', async () => {
      // Arrange
      const userWithRelations = {
        ...mockUser,
        employee: { id: 'emp-1', firstName: 'John', lastName: 'Doe' },
        roles: [{ role: { id: 'role-1', name: 'employee' } }],
      };
      mockPrismaService.user.findUnique.mockResolvedValue(userWithRelations);

      // Act
      const result = await service.validateUserById('user-1');

      // Assert
      expect(result).toEqual(userWithRelations);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1', isActive: true },
        include: {
          employee: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.validateUserById('nonexistent-user');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when an error occurs', async () => {
      // Arrange
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      // Act
      const result = await service.validateUserById('user-1');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should rotate tokens when refresh token is valid', async () => {
      // Arrange
      mockJwtService.verifyAsync
        .mockResolvedValueOnce({
          sub: mockUser.id,
          email: mockUser.email,
          exp: 9999999999,
        })
        .mockResolvedValueOnce({
          sub: mockUser.id,
          email: mockUser.email,
          exp: 9999999999,
        });
      mockPrismaService.userSession.findUnique.mockResolvedValue({
        id: 'sess-1',
        userId: mockUser.id,
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 3600_000),
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');
      mockPrismaService.userSession.update.mockResolvedValue({ id: 'sess-1' });

      // Act
      const result = await service.refresh('refresh-token');

      // Assert
      expect(result.access_token).toBe('new-access');
      expect(result.refresh_token).toBe('new-refresh');
    });
  });

  describe('logout', () => {
    it('should delete session for refresh token', async () => {
      // Arrange
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
        exp: 9999999999,
      });
      mockPrismaService.userSession.deleteMany.mockResolvedValue({ count: 1 });

      // Act
      await service.logout('refresh-token');

      // Assert
      expect(mockPrismaService.userSession.deleteMany).toHaveBeenCalledWith({
        where: { refreshToken: 'refresh-token' },
      });
    });
  });

  describe('hashPassword', () => {
    it('should return hashed password for valid password', async () => {
      // Arrange
      const password = 'ValidPassword123!'; // Strong password
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.hashPassword(password);

      // Assert
      expect(result).toBe('hashedPassword');
      expect(bcryptMock.hash).toHaveBeenCalledWith(password, 12);
    });

    it('should throw error when password is too weak', async () => {
      // Act & Assert
      await expect(service.hashPassword('weak')).rejects.toThrow(
        'Password does not meet security requirements',
      );
    });

    it('should throw error when hashing fails', async () => {
      // Arrange
      const password = 'ValidPassword123!';
      (bcryptMock.hash as jest.Mock).mockRejectedValue(
        new Error('Hashing failed'),
      );

      // Act & Assert
      await expect(service.hashPassword(password)).rejects.toThrow(
        'Password hashing failed',
      );
    });
  });
});
