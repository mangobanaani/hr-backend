import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService, type LoginResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ErrorResponseDto,
  UnauthorizedResponseDto,
} from '../common/dto/error-response.dto';

interface AuthenticatedRequest {
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
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password to receive a JWT token',
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
    return this.authService.login(user);
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
}
