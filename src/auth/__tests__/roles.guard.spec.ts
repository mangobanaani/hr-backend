import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from '../guards/roles.guard';
import { AuthService } from '../auth.service';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  const reflector = { getAllAndOverride: jest.fn() };
  const authService = { validateUserById: jest.fn() };

  const mockContextWithUser = (userId?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          user: userId ? { id: userId } : undefined,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: reflector },
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    guard = moduleRef.get(RolesGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows when no roles metadata', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const result = await guard.canActivate(mockContextWithUser('u1'));

    expect(result).toBe(true);
  });

  it('denies when user lacks admin role', async () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    authService.validateUserById.mockResolvedValue({
      id: 'u1',
      roles: [{ role: { name: 'employee' } }],
    });

    await expect(guard.canActivate(mockContextWithUser('u1'))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows when user has admin role', async () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);
    authService.validateUserById.mockResolvedValue({
      id: 'u1',
      roles: [{ role: { name: 'admin' } }],
    });

    await expect(guard.canActivate(mockContextWithUser('u1'))).resolves.toBe(
      true,
    );
  });
});
