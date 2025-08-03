import { Test } from '@nestjs/testing';
import { BenefitsController } from '../benefits.controller';
import { PrismaService } from '../../database/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BenefitType } from '@prisma/client';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BenefitsController', () => {
  let controller: BenefitsController;

  const mockPrismaService = {
    benefit: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const mockBenefit = {
    id: '1',
    name: 'Health Insurance',
    description: 'Comprehensive health coverage',
    type: BenefitType.HEALTH_INSURANCE,
    cost: 500,
    isActive: true,
    companyId: 'company-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    company: {
      id: 'company-1',
      name: 'Test Company',
    },
    employeeBenefits: [],
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [BenefitsController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<BenefitsController>(BenefitsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createBenefitDto = {
      name: 'Health Insurance',
      description: 'Comprehensive health coverage',
      type: BenefitType.HEALTH_INSURANCE,
      cost: 500,
      isActive: true,
      companyId: 'company-1',
    };

    it('should create a benefit successfully', async () => {
      mockPrismaService.benefit.findFirst.mockResolvedValue(null);
      mockPrismaService.benefit.create.mockResolvedValue(mockBenefit);

      const result = await controller.create(createBenefitDto);

      expect(result).toEqual({
        success: true,
        data: mockBenefit,
        message: 'Benefit created successfully',
      });

      expect(mockPrismaService.benefit.findFirst).toHaveBeenCalledWith({
        where: {
          name: createBenefitDto.name,
          companyId: createBenefitDto.companyId,
        },
      });
    });

    it('should throw ConflictException when benefit name already exists', async () => {
      mockPrismaService.benefit.findFirst.mockResolvedValue(mockBenefit);

      await expect(controller.create(createBenefitDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all benefits', async () => {
      const mockBenefits = [mockBenefit];
      mockPrismaService.benefit.findMany.mockResolvedValue(mockBenefits);

      const result = await controller.findAll();

      expect(result).toEqual({
        success: true,
        data: mockBenefits,
        count: mockBenefits.length,
        message: 'Benefits retrieved successfully',
      });
    });
  });

  describe('findOne', () => {
    it('should return a specific benefit', async () => {
      mockPrismaService.benefit.findUnique.mockResolvedValue(mockBenefit);

      const result = await controller.findOne('1');

      expect(result).toEqual({
        success: true,
        data: mockBenefit,
        message: 'Benefit retrieved successfully',
      });
    });

    it('should throw NotFoundException when benefit not found', async () => {
      mockPrismaService.benefit.findUnique.mockResolvedValue(null);

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateBenefitDto = {
      name: 'Updated Health Insurance',
      cost: 600,
    };

    it('should update a benefit successfully', async () => {
      const updatedBenefit = { ...mockBenefit, ...updateBenefitDto };

      mockPrismaService.benefit.findUnique.mockResolvedValue(mockBenefit);
      mockPrismaService.benefit.findFirst.mockResolvedValue(null);
      mockPrismaService.benefit.update.mockResolvedValue(updatedBenefit);

      const result = await controller.update('1', updateBenefitDto);

      expect(result).toEqual({
        success: true,
        data: updatedBenefit,
        message: 'Benefit updated successfully',
      });
    });

    it('should throw NotFoundException when benefit not found', async () => {
      mockPrismaService.benefit.findUnique.mockResolvedValue(null);

      await expect(controller.update('999', updateBenefitDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a benefit successfully', async () => {
      mockPrismaService.benefit.findUnique.mockResolvedValue({
        ...mockBenefit,
        employeeBenefits: [],
      });
      mockPrismaService.benefit.delete.mockResolvedValue(mockBenefit);

      const result = await controller.remove('1');

      expect(result).toEqual({
        success: true,
        message: 'Benefit deleted successfully',
      });
    });

    it('should throw NotFoundException when benefit not found', async () => {
      mockPrismaService.benefit.findUnique.mockResolvedValue(null);

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when benefit has active enrollments', async () => {
      mockPrismaService.benefit.findUnique.mockResolvedValue({
        ...mockBenefit,
        employeeBenefits: [{ id: '1', employeeId: 'emp-1', benefitId: '1' }],
      });

      await expect(controller.remove('1')).rejects.toThrow(ConflictException);
    });
  });
});
