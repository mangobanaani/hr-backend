import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import bcrypt = require('bcrypt');
import { PrismaService } from '../database/prisma.service';

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
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = (await this.prisma.user.findUnique({
        where: { email },
      })) as User | null;

      if (!user) {
        return null;
      }

      if (!user.isActive) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return user;
      }

      return null;
    } catch {
      return null;
    }
  }

  async login(user: User): Promise<LoginResponse> {
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
      },
    };
  }

  async validateUserById(userId: string): Promise<User | null> {
    try {
      return (await this.prisma.user.findUnique({
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
    } catch {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch {
      throw new Error('Password hashing failed');
    }
  }
}
