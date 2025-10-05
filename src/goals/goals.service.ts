import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGoalDto: CreateGoalDto) {
    // Validate employee
    const employee = await this.prisma.employee.findUnique({
      where: { id: createGoalDto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate performance review if provided
    if (createGoalDto.performanceReviewId) {
      const review = await this.prisma.performanceReview.findUnique({
        where: { id: createGoalDto.performanceReviewId },
      });
      if (!review) {
        throw new NotFoundException('Performance review not found');
      }
    }

    const goal = await this.prisma.goal.create({
      data: createGoalDto as any,
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
    });

    return goal;
  }

  async findAll(employeeId?: string, status?: string) {
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }
    if (status) {
      where.status = status;
    }

    const goals = await this.prisma.goal.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });

    return goals;
  }

  async findOne(id: string) {
    const goal = await this.prisma.goal.findUnique({
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
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    return goal;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto) {
    const existingGoal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!existingGoal) {
      throw new NotFoundException('Goal not found');
    }

    // Prevent update if goal is completed and frozen
    if (existingGoal.status === 'COMPLETED' && !updateGoalDto.status) {
      throw new BadRequestException(
        'Cannot modify completed goal without changing status',
      );
    }

    const { employeeId, ...updateData } = updateGoalDto;

    const goal = await this.prisma.goal.update({
      where: { id },
      data: updateData as any,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return goal;
  }

  async updateProgress(id: string, progress: number) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (progress < 0 || progress > 100) {
      throw new BadRequestException('Progress must be between 0 and 100');
    }

    // Update goal's completion percentage
    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: {
        completionPercentage: progress,
        status: progress === 100 ? 'COMPLETED' : progress > 0 ? 'IN_PROGRESS' : goal.status,
      } as any,
    });

    return updatedGoal;
  }

  async remove(id: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    await this.prisma.goal.delete({
      where: { id },
    });

    return { message: 'Goal deleted successfully' };
  }
}
