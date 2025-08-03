import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    try {
      return await this.prisma.company.create({
        data: createCompanyDto,
        include: {
          employees: true,
          _count: {
            select: {
              employees: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Company with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Company[]> {
    return await this.prisma.company.findMany({
      include: {
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        employees: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    return company;
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.findOne(id); // Verify company exists

    try {
      return await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
        include: {
          employees: true,
          _count: {
            select: {
              employees: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Company with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Company> {
    await this.findOne(id); // Verify company exists

    return await this.prisma.company.delete({
      where: { id },
      include: {
        employees: true,
        _count: {
          select: {
            employees: true,
          },
        },
      },
    });
  }
}
