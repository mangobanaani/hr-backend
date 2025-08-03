import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/database/prisma.service';
import { DatabaseModule } from '../src/database/database.module';

describe('Database Schema Tests', () => {
  let prismaService: PrismaService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await module.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.$transaction([
      prismaService.employeeTraining.deleteMany(),
      prismaService.training.deleteMany(),
      prismaService.performanceReview.deleteMany(),
      prismaService.employee.deleteMany(),
      prismaService.userRole.deleteMany(),
      prismaService.role.deleteMany(),
      prismaService.user.deleteMany(),
      prismaService.department.deleteMany(),
      prismaService.company.deleteMany(),
    ]);
  });

  describe('User Management', () => {
    it('should create and retrieve a user', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
      };

      // Act
      const createdUser = await prismaService.user.create({
        data: userData,
      });

      const retrievedUser = await prismaService.user.findUnique({
        where: { id: createdUser.id },
      });

      // Assert
      expect(retrievedUser).toBeDefined();
      expect(retrievedUser?.email).toBe(userData.email);
      expect(retrievedUser?.isActive).toBe(true);

      // Cleanup
      await prismaService.user.delete({
        where: { id: createdUser.id },
      });
    });

    it('should enforce unique email constraint', async () => {
      // Arrange
      const userData = {
        email: 'unique@example.com',
        password: 'hashedPassword',
        isActive: true,
      };

      // Act
      const firstUser = await prismaService.user.create({
        data: userData,
      });

      // Assert
      await expect(
        prismaService.user.create({
          data: userData,
        }),
      ).rejects.toThrow();

      // Cleanup
      await prismaService.user.delete({
        where: { id: firstUser.id },
      });
    });
  });

  describe('Employee Management', () => {
    it('should create employee with user relationship', async () => {
      // Arrange
      const company = await prismaService.company.create({
        data: {
          name: 'Test Company',
          industry: 'Technology',
        },
      });

      const user = await prismaService.user.create({
        data: {
          email: 'employee@example.com',
          password: 'hashedPassword',
          isActive: true,
        },
      });

      const employeeData = {
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'employee@example.com',
        hireDate: new Date(),
        status: 'ACTIVE' as const,
        companyId: company.id,
        userId: user.id,
      };

      // Act
      const employee = await prismaService.employee.create({
        data: employeeData,
        include: {
          user: true,
          company: true,
        },
      });

      // Assert
      expect(employee).toBeDefined();
      expect(employee.user?.email).toBe(user.email);
      expect(employee.company.name).toBe('Test Company');

      // Cleanup
      await prismaService.employee.delete({
        where: { id: employee.id },
      });
      await prismaService.user.delete({
        where: { id: user.id },
      });
      await prismaService.company.delete({
        where: { id: company.id },
      });
    });
  });

  describe('Department Hierarchy', () => {
    it('should support department parent-child relationships', async () => {
      // Arrange
      const company = await prismaService.company.create({
        data: {
          name: 'Test Company',
          industry: 'Technology',
        },
      });

      const parentDept = await prismaService.department.create({
        data: {
          name: 'Engineering',
          code: 'ENG',
          companyId: company.id,
        },
      });

      const childDept = await prismaService.department.create({
        data: {
          name: 'Frontend Team',
          code: 'ENG-FE',
          companyId: company.id,
          parentId: parentDept.id,
        },
      });

      // Act
      const departmentWithChildren = await prismaService.department.findUnique({
        where: { id: parentDept.id },
        include: {
          children: true,
        },
      });

      // Assert
      expect(departmentWithChildren?.children).toHaveLength(1);
      expect(departmentWithChildren?.children[0]?.name).toBe('Frontend Team');

      // Cleanup
      await prismaService.department.delete({
        where: { id: childDept.id },
      });
      await prismaService.department.delete({
        where: { id: parentDept.id },
      });
      await prismaService.company.delete({
        where: { id: company.id },
      });
    });
  });

  describe('Role and Permission System', () => {
    it('should manage user roles correctly', async () => {
      // Arrange
      const user = await prismaService.user.create({
        data: {
          email: 'roletest@example.com',
          password: 'hashedPassword',
          isActive: true,
        },
      });

      const role = await prismaService.role.create({
        data: {
          name: 'Employee',
          description: 'Standard employee role',
          permissions: ['read:profile', 'update:profile'],
        },
      });

      // Act
      await prismaService.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      const userWithRoles = await prismaService.user.findUnique({
        where: { id: user.id },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      // Assert
      expect(userWithRoles?.roles).toHaveLength(1);
      expect(userWithRoles?.roles[0]?.role.name).toBe('Employee');
      expect(userWithRoles?.roles[0]?.role.permissions).toContain(
        'read:profile',
      );

      // Cleanup
      await prismaService.userRole.deleteMany({
        where: { userId: user.id },
      });
      await prismaService.user.delete({
        where: { id: user.id },
      });
      await prismaService.role.delete({
        where: { id: role.id },
      });
    });
  });
});
