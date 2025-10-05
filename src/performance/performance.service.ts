import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePerformanceCycleDto } from './dto/create-performance-cycle.dto';
import { UpdatePerformanceCycleDto } from './dto/update-performance-cycle.dto';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Performance Cycles ====================

  async createCycle(createCycleDto: CreatePerformanceCycleDto) {
    // Validate company exists
    const company = await this.prisma.company.findUnique({
      where: { id: createCycleDto.companyId },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const cycle = await this.prisma.performanceCycle.create({
      data: createCycleDto as any,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return cycle;
  }

  async findAllCycles(companyId?: string) {
    const where = companyId ? { companyId } : {};

    const cycles = await this.prisma.performanceCycle.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return cycles;
  }

  async findOneCycle(id: string) {
    const cycle = await this.prisma.performanceCycle.findUnique({
      where: { id },
      include: {
        company: true,
        reviews: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            reviewer: {
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

    if (!cycle) {
      throw new NotFoundException('Performance cycle not found');
    }

    return cycle;
  }

  async updateCycle(id: string, updateCycleDto: UpdatePerformanceCycleDto) {
    const existingCycle = await this.prisma.performanceCycle.findUnique({
      where: { id },
    });

    if (!existingCycle) {
      throw new NotFoundException('Performance cycle not found');
    }

    const cycle = await this.prisma.performanceCycle.update({
      where: { id },
      data: updateCycleDto as any,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return cycle;
  }

  async removeCycle(id: string) {
    const cycle = await this.prisma.performanceCycle.findUnique({
      where: { id },
      include: {
        reviews: true,
      },
    });

    if (!cycle) {
      throw new NotFoundException('Performance cycle not found');
    }

    // Check if there are associated reviews
    if (cycle.reviews.length > 0) {
      throw new ConflictException(
        'Cannot delete cycle with associated reviews. Please delete reviews first.',
      );
    }

    await this.prisma.performanceCycle.delete({
      where: { id },
    });

    return { message: 'Performance cycle deleted successfully' };
  }

  // ==================== Performance Reviews ====================

  async createReview(createReviewDto: CreatePerformanceReviewDto) {
    // Validate employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: createReviewDto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate reviewer
    const reviewer = await this.prisma.employee.findUnique({
      where: { id: createReviewDto.reviewerId },
    });
    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    // Validate cycle if provided
    if (createReviewDto.cycleId) {
      const cycle = await this.prisma.performanceCycle.findUnique({
        where: { id: createReviewDto.cycleId },
      });
      if (!cycle) {
        throw new NotFoundException('Performance cycle not found');
      }
    }

    const review = await this.prisma.performanceReview.create({
      data: createReviewDto as any,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true,
          },
        },
      },
    });

    return review;
  }

  async findAllReviews(employeeId?: string, reviewerId?: string, cycleId?: string) {
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (reviewerId) {
      where.reviewerId = reviewerId;
    }
    if (cycleId) {
      where.cycleId = cycleId;
    }

    const reviews = await this.prisma.performanceReview.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cycle: {
          select: {
            id: true,
            name: true,
            cycleType: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return reviews;
  }

  async findOneReview(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        cycle: true,
        template: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    return review;
  }

  async updateReview(id: string, updateReviewDto: UpdatePerformanceReviewDto) {
    const existingReview = await this.prisma.performanceReview.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException('Performance review not found');
    }

    // Prevent update if completed
    if (existingReview.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot modify completed performance review',
      );
    }

    const { employeeId, reviewerId, ...updateData } = updateReviewDto;

    const review = await this.prisma.performanceReview.update({
      where: { id },
      data: updateData as any,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        cycle: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return review;
  }

  async submitReview(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    if (review.status !== 'DRAFT' && review.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Only draft or in progress reviews can be submitted',
      );
    }

    const updatedReview = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        status: 'PENDING_APPROVAL',
      },
    });

    return updatedReview;
  }

  async completeReview(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    const updatedReview = await this.prisma.performanceReview.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
    });

    return updatedReview;
  }

  async removeReview(id: string) {
    const review = await this.prisma.performanceReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    // Prevent deletion if completed
    if (review.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot delete completed performance review',
      );
    }

    await this.prisma.performanceReview.delete({
      where: { id },
    });

    return { message: 'Performance review deleted successfully' };
  }
}
