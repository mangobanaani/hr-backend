import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from '@prisma/client';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    try {
      return await this.prisma.skill.create({
        data: createSkillDto,
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Skill with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<Skill[]> {
    return await this.prisma.skill.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    try {
      const skill = await this.prisma.skill.findUnique({
        where: { id },
      });

      if (!skill) {
        throw new NotFoundException(`Skill with ID "${id}" not found`);
      }

      return await this.prisma.skill.update({
        where: { id },
        data: updateSkillDto as {
          name?: string;
          description?: string;
          category?: string;
        },
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Skill with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID "${id}" not found`);
    }

    await this.prisma.skill.delete({
      where: { id },
    });
  }

  async findByCategory(category: string): Promise<Skill[]> {
    return await this.prisma.skill.findMany({
      where: {
        category: {
          contains: category,
          mode: 'insensitive',
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getSkillCategories(): Promise<string[]> {
    const skills = await this.prisma.skill.findMany({
      select: {
        category: true,
      },
      distinct: ['category'],
      where: {
        category: {
          not: null,
        },
      },
    });

    return skills
      .map((skill) => skill.category)
      .filter((category): category is string => category !== null)
      .sort();
  }
}
