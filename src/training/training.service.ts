import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { Training } from '@prisma/client';

@Injectable()
export class TrainingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTrainingDto: CreateTrainingDto): Promise<Training> {
    try {
      return await this.prisma.training.create({
        data: createTrainingDto,
        include: {
          employeeTrainings: {
            include: {
              employee: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Training with this title already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Training[]> {
    return await this.prisma.training.findMany({
      include: {
        employeeTrainings: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Training> {
    const training = await this.prisma.training.findUnique({
      where: { id },
      include: {
        employeeTrainings: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!training) {
      throw new NotFoundException(`Training with ID ${id} not found`);
    }

    return training;
  }

  async update(
    id: string,
    updateTrainingDto: UpdateTrainingDto,
  ): Promise<Training> {
    await this.findOne(id); // Verify training exists

    try {
      return await this.prisma.training.update({
        where: { id },
        data: updateTrainingDto,
        include: {
          employeeTrainings: {
            include: {
              employee: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Training with this title already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Training> {
    await this.findOne(id); // Verify training exists

    return await this.prisma.training.delete({
      where: { id },
      include: {
        employeeTrainings: {
          include: {
            employee: true,
          },
        },
      },
    });
  }
}
