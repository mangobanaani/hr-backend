import { Test, type TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LocalStrategy } from '../strategies/local.strategy';
import { AuthService } from '../auth.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;

  const mockAuthService = {
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user when credentials are valid', async () => {
      // Arrange
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAuthService.validateUser.mockResolvedValue(mockUser);

      // Act
      const result = await strategy.validate('test@example.com', 'password');

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        isActive: mockUser.isActive,
      });
      expect(mockAuthService.validateUser).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      // Arrange
      mockAuthService.validateUser.mockResolvedValue(null);

      // Act & Assert
      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        strategy.validate('test@example.com', 'wrongpassword'),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when validation fails', async () => {
      // Arrange
      mockAuthService.validateUser.mockRejectedValue(
        new UnauthorizedException('Database error'),
      );

      // Act & Assert
      await expect(
        strategy.validate('test@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
