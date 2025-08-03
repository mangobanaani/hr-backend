import { Test, type TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { AuthService } from '../auth.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockAuthService = {
    validateUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when token payload is valid', async () => {
      // Arrange
      const payload = { sub: 'user-1', email: 'test@example.com' };
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAuthService.validateUserById.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate(payload);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        isActive: mockUser.isActive,
      });
      expect(mockAuthService.validateUserById).toHaveBeenCalledWith('user-1');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      const payload = { sub: 'user-1', email: 'test@example.com' };
      mockAuthService.validateUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow('Invalid token');
    });

    it('should throw UnauthorizedException when validation fails', async () => {
      // Arrange
      const payload = { sub: 'user-1', email: 'test@example.com' };
      mockAuthService.validateUserById.mockRejectedValue(
        new UnauthorizedException('Database error'),
      );

      // Act & Assert
      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
