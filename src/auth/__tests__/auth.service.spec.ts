import { Test, type TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    it('should return access token and user info for active user', async () => {
      // Arrange
      const expectedToken = 'jwt-token';
      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      // Act
      const result = await service.login(mockUser);

      // Assert
      expect(result).toEqual({
        access_token: expectedToken,
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

  describe('hashPassword', () => {
    it('should return hashed password', async () => {
      // Arrange
      const password = 'plaintext';
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Act
      const result = await service.hashPassword(password);

      // Assert
      expect(result).toBe('hashedPassword');
      expect(bcryptMock.hash).toHaveBeenCalledWith(password, 12);
    });

    it('should throw error when hashing fails', async () => {
      // Arrange
      (bcryptMock.hash as jest.Mock).mockRejectedValue(
        new Error('Hashing failed'),
      );

      // Act & Assert
      await expect(service.hashPassword('password')).rejects.toThrow(
        'Password hashing failed',
      );
    });
  });
});
