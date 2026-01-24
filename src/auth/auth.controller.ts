import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService, type LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EndpointThrottleGuard } from '../common/guards/endpoint-throttle.guard';
import {
  ErrorResponseDto,
  UnauthorizedResponseDto,
} from '../common/dto/error-response.dto';

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    isActive: boolean;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EndpointThrottleGuard, LocalAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password to receive a JWT token. Rate limited to 5 attempts per minute per IP.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User credentials for authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful - returns JWT token and user information',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input format',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid email or password',
    type: UnauthorizedResponseDto,
  })
  async login(@Request() req: AuthenticatedRequest): Promise<LoginResponse> {
    const user = {
      id: req.user.id,
      email: req.user.email,
      password: '', // This won't be used as user is already validated
      isActive: req.user.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.authService.login(user, {
      ipAddress: (req as { ip?: string }).ip,
      userAgent: (req as { headers?: Record<string, string> }).headers?.[
        'user-agent'
      ],
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(EndpointThrottleGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Use a refresh token to obtain a new access token. Rate limited to 10 requests per minute per IP.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired refresh token',
    type: UnauthorizedResponseDto,
  })
  async refresh(
    @Headers('authorization') authorization?: string,
  ): Promise<LoginResponse> {
    const refreshToken = this.extractBearerToken(authorization);
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidate the refresh token and end the session',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid refresh token',
    type: UnauthorizedResponseDto,
  })
  async logout(
    @Headers('authorization') authorization?: string,
  ): Promise<{ message: string }> {
    const refreshToken = this.extractBearerToken(authorization);
    return this.authService.logout(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the profile information of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token',
    type: UnauthorizedResponseDto,
  })
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<UserProfileDto> {
    const user = await this.authService.validateUserById(req.user.id);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      employee: null, // Will be populated when employee relationships are implemented
    };
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Refresh token missing');
    }
    return authorization.slice('Bearer '.length).trim();
  }
}
