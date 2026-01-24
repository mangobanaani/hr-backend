import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { PrismaService } from '../database/prisma.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { CreateBenefitEnrollmentDto } from './dto/create-benefit-enrollment.dto';
import { UpdateBenefitEnrollmentDto } from './dto/update-benefit-enrollment.dto';

interface BenefitResponse {
  success: boolean;
  data?: any;
  count?: number;
  message: string;
}

@ApiTags('benefits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles('admin')
  @Post()
  @ApiOperation({
    summary: 'Create benefit',
    description: 'Create a new benefit record',
  })
  @ApiResponse({
    status: 201,
    description: 'Benefit created successfully',
  })
  async create(
    @Body() createBenefitDto: CreateBenefitDto,
  ): Promise<BenefitResponse> {
    try {
      // Check if benefit with same name already exists for the company
      const existingBenefit = await this.prisma.benefit.findFirst({
        where: {
          name: createBenefitDto.name,
          companyId: createBenefitDto.companyId,
        },
      });

      if (existingBenefit) {
        throw new ConflictException(
          'A benefit with this name already exists for this company',
        );
      }

      const benefit = await this.prisma.benefit.create({
        data: createBenefitDto,
        include: {
          company: true,
        },
      });

      return {
        success: true,
        data: benefit,
        message: 'Benefit created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Error creating benefit:', error);
      throw new HttpException(
        'Failed to create benefit. Please check your input and try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all benefits',
    description: 'Retrieve a list of all benefits',
  })
  @ApiResponse({
    status: 200,
    description: 'List of benefits retrieved successfully',
  })
  async findAll(): Promise<BenefitResponse> {
    try {
      const benefits = await this.prisma.benefit.findMany({
        include: {
          company: true,
          employeeBenefits: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: benefits,
        count: benefits.length,
        message: 'Benefits retrieved successfully',
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching benefits:', error);
      throw new HttpException(
        'Failed to retrieve benefits. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get benefit by ID',
    description: 'Retrieve a specific benefit by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Benefit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Benefit retrieved successfully',
  })
  async findOne(@Param('id') id: string): Promise<BenefitResponse> {
    try {
      const benefit = await this.prisma.benefit.findUnique({
        where: { id },
        include: {
          company: true,
          employeeBenefits: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!benefit) {
        throw new NotFoundException('Benefit not found');
      }

      return {
        success: true,
        data: benefit,
        message: 'Benefit retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Error fetching benefit:', error);
      throw new HttpException(
        'Failed to retrieve benefit. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update benefit',
    description: 'Update an existing benefit',
  })
  @ApiParam({
    name: 'id',
    description: 'Benefit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Benefit updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBenefitDto: UpdateBenefitDto,
  ): Promise<BenefitResponse> {
    try {
      // Check if benefit exists
      const existingBenefit = await this.prisma.benefit.findUnique({
        where: { id },
      });

      if (!existingBenefit) {
        throw new NotFoundException('Benefit not found');
      }

      // Check for name conflicts if name is being updated
      if (
        updateBenefitDto.name &&
        updateBenefitDto.name !== existingBenefit.name
      ) {
        const nameConflict = await this.prisma.benefit.findFirst({
          where: {
            name: updateBenefitDto.name,
            companyId: existingBenefit.companyId,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ConflictException(
            'A benefit with this name already exists for this company',
          );
        }
      }

      const benefit = await this.prisma.benefit.update({
        where: { id },
        data: updateBenefitDto,
        include: {
          company: true,
          employeeBenefits: {
            include: {
              employee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: benefit,
        message: 'Benefit updated successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Error updating benefit:', error);
      throw new HttpException(
        'Failed to update benefit. Please check your input and try again.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete benefit',
    description: 'Delete a benefit from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Benefit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Benefit deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<BenefitResponse> {
    try {
      // Check if benefit exists
      const existingBenefit = await this.prisma.benefit.findUnique({
        where: { id },
        include: {
          employeeBenefits: true,
        },
      });

      if (!existingBenefit) {
        throw new NotFoundException('Benefit not found');
      }

      // Check if there are active employee enrollments
      if (existingBenefit.employeeBenefits.length > 0) {
        throw new ConflictException(
          'Cannot delete benefit with active employee enrollments. Please remove all enrollments first.',
        );
      }

      await this.prisma.benefit.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Benefit deleted successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      // eslint-disable-next-line no-console
      console.error('Error deleting benefit:', error);
      throw new HttpException(
        'Failed to delete benefit. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles('admin')
  @Post(':id/enrollments')
  @ApiOperation({
    summary: 'Enroll employee in benefit',
    description: 'Enroll an employee in the specified benefit',
  })
  @ApiParam({
    name: 'id',
    description: 'Benefit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Benefit enrollment created successfully',
  })
  async enroll(
    @Param('id') id: string,
    @Body() enrollmentDto: CreateBenefitEnrollmentDto,
  ): Promise<BenefitResponse> {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
    });
    if (!benefit) {
      throw new NotFoundException('Benefit not found');
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: enrollmentDto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const existing = await this.prisma.employeeBenefit.findUnique({
      where: {
        employeeId_benefitId: {
          employeeId: enrollmentDto.employeeId,
          benefitId: id,
        },
      },
    });
    if (existing) {
      throw new ConflictException('Employee is already enrolled in this benefit');
    }

    const enrollment = await this.prisma.employeeBenefit.create({
      data: {
        employeeId: enrollmentDto.employeeId,
        benefitId: id,
        startDate: new Date(enrollmentDto.startDate),
        endDate: enrollmentDto.endDate ? new Date(enrollmentDto.endDate) : null,
        cost: enrollmentDto.cost,
        notes: enrollmentDto.notes,
        isActive: enrollmentDto.isActive ?? true,
      },
    });

    return {
      success: true,
      data: enrollment,
      message: 'Benefit enrollment created successfully',
    };
  }

  @Get(':id/enrollments')
  @ApiOperation({
    summary: 'List benefit enrollments',
    description: 'Retrieve all enrollments for a specific benefit',
  })
  @ApiParam({
    name: 'id',
    description: 'Benefit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Benefit enrollments retrieved successfully',
  })
  async listEnrollments(@Param('id') id: string): Promise<BenefitResponse> {
    const benefit = await this.prisma.benefit.findUnique({
      where: { id },
    });
    if (!benefit) {
      throw new NotFoundException('Benefit not found');
    }

    const enrollments = await this.prisma.employeeBenefit.findMany({
      where: { benefitId: id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: enrollments,
      count: enrollments.length,
      message: 'Benefit enrollments retrieved successfully',
    };
  }

  @Roles('admin')
  @Patch(':id/enrollments/:enrollmentId')
  @ApiOperation({
    summary: 'Update benefit enrollment',
    description: 'Update a specific benefit enrollment',
  })
  @ApiParam({
    name: 'id',
    description: 'Benefit ID',
    type: 'string',
  })
  @ApiParam({
    name: 'enrollmentId',
    description: 'Enrollment ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Benefit enrollment updated successfully',
  })
  async updateEnrollment(
    @Param('id') id: string,
    @Param('enrollmentId') enrollmentId: string,
    @Body() updateDto: UpdateBenefitEnrollmentDto,
  ): Promise<BenefitResponse> {
    const existing = await this.prisma.employeeBenefit.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing || existing.benefitId !== id) {
      throw new NotFoundException('Benefit enrollment not found');
    }

    const updated = await this.prisma.employeeBenefit.update({
      where: { id: enrollmentId },
      data: {
        employeeId: updateDto.employeeId,
        benefitId: id,
        startDate: updateDto.startDate
          ? new Date(updateDto.startDate)
          : undefined,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
        cost: updateDto.cost,
        notes: updateDto.notes,
        isActive: updateDto.isActive,
      },
    });

    return {
      success: true,
      data: updated,
      message: 'Benefit enrollment updated successfully',
    };
  }

  @Roles('admin')
  @Delete(':id/enrollments/:enrollmentId')
  @ApiOperation({
    summary: 'Remove benefit enrollment',
    description: 'Remove an employee from a benefit enrollment',
  })
  @ApiParam({
    name: 'id',
    description: 'Benefit ID',
    type: 'string',
  })
  @ApiParam({
    name: 'enrollmentId',
    description: 'Enrollment ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Benefit enrollment removed successfully',
  })
  async removeEnrollment(
    @Param('id') id: string,
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<BenefitResponse> {
    const existing = await this.prisma.employeeBenefit.findUnique({
      where: { id: enrollmentId },
    });
    if (!existing || existing.benefitId !== id) {
      throw new NotFoundException('Benefit enrollment not found');
    }

    await this.prisma.employeeBenefit.delete({
      where: { id: enrollmentId },
    });

    return {
      success: true,
      message: 'Benefit enrollment removed successfully',
    };
  }
}
