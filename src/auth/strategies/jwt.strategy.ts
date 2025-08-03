import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, type JwtPayload } from '../auth.service';

interface User {
  id: string;
  email: string;
  isActive: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Handle development test user
    if (payload.sub === '1' && payload.email === 'test@example.com') {
      return {
        id: '1',
        email: 'test@example.com',
        isActive: true,
      };
    }

    const user = await this.authService.validateUserById(payload.sub);
    if (user === null) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
    };
  }
}
