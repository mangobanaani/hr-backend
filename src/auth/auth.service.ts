import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import bcrypt = require('bcrypt');
import { PrismaService } from '../database/prisma.service';
import { PasswordValidator } from './validators/password.validator';
import { AppLogger } from '../common/logging/logger.service';

// Define User interface to match our schema
interface User {
  id: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
}

interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly jwtRefreshSecret: string;
  private readonly logger = new AppLogger();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext('AuthService');
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is required but not configured');
    }
    this.jwtRefreshSecret = secret;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = (await this.prisma.user.findUnique({
        where: { email },
      })) as User | null;

      if (!user) {
        this.logger.warn(`Login attempt for non-existent user: ${email}`);
        return null;
      }

      if (!user.isActive) {
        this.logger.warn(`Login attempt for inactive user: ${email}`);
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        this.logger.log(`Successful login for user: ${email}`);
        return user;
      }

      this.logger.warn(`Failed login attempt for user: ${email} (invalid password)`);
      return null;
    } catch (error) {
      this.logger.error(
        'User validation failed',
        error instanceof Error ? error.stack : String(error),
      );
      throw new UnauthorizedException('Authentication failed');
    }
  }

  async login(user: User, metadata?: SessionMetadata): Promise<LoginResponse> {
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.jwtRefreshSecret,
      expiresIn: refreshExpiresIn,
    });
    const refreshPayload = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      {
        secret: this.jwtRefreshSecret,
      },
    );
    const fallbackExpirySeconds =
      Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const expiresAt = new Date(
      (refreshPayload.exp ?? fallbackExpirySeconds) * 1000,
    );

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt,
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
    });
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      },
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.jwtRefreshSecret,
        },
      );

      const session = await this.prisma.userSession.findUnique({
        where: { refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = (await this.prisma.user.findUnique({
        where: { id: payload.sub },
      })) as User | null;

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid user');
      }

      const newAccessToken = await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });
      const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
      const newRefreshToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: this.jwtRefreshSecret,
          expiresIn: refreshExpiresIn,
        },
      );
      const refreshPayload = await this.jwtService.verifyAsync<JwtPayload>(
        newRefreshToken,
        {
          secret: this.jwtRefreshSecret,
        },
      );
      const fallbackExpirySeconds =
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      const expiresAt = new Date(
        (refreshPayload.exp ?? fallbackExpirySeconds) * 1000,
      );

      await this.prisma.userSession.update({
        where: { id: session.id },
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt,
          lastUsedAt: new Date(),
        },
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.prisma.userSession.deleteMany({
      where: { refreshToken },
    });
    return { message: 'Logged out successfully' };
  }

  async validateUserById(userId: string): Promise<User | null> {
    try {
      const user = (await this.prisma.user.findUnique({
        where: { id: userId, isActive: true },
        include: {
          employee: true,
          roles: {
            include: {
              role: true,
            },
          },
        },
      })) as User | null;

      if (!user) {
        this.logger.warn(`Token validation failed: user not found or inactive (ID: ${userId})`);
      }

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to validate user by ID: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    // Validate password strength before hashing
    const validation = PasswordValidator.validate(password);
    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Password does not meet security requirements',
        errors: validation.errors,
      });
    }

    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch {
      throw new Error('Password hashing failed');
    }
  }
}
