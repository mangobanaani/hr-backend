import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { ROLES_KEY } from './roles.decorator';

interface RequestUser {
  id?: string;
}

interface UserRoleEntry {
  role?: {
    name?: string;
  };
}

interface UserWithRoles {
  roles?: UserRoleEntry[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const userId = request.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = (await this.authService.validateUserById(
      userId,
    )) as UserWithRoles | null;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roleNames = (user.roles ?? [])
      .map((userRole: UserRoleEntry) => userRole.role?.name)
      .filter((name: string | undefined): name is string => Boolean(name));

    const hasRole = requiredRoles.some((role) => roleNames.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
