import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmployeeSkill } from '@prisma/client';
import { CreateEmployeeSkillDto } from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';

@Injectable()
export class EmployeeSkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createEmployeeSkillDto: CreateEmployeeSkillDto,
  ): Promise<EmployeeSkill> {
    const {
      employeeId,
      skillId,
      level,
      certificationDate,
      certificationExpiry,
    } = createEmployeeSkillDto;

    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Check if skill exists
    const skill = await this.prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new NotFoundException(`Skill with ID ${skillId} not found`);
    }

    // Create the employee skill record
    const data: any = {
      employee: { connect: { id: employeeId } },
      skill: { connect: { id: skillId } },
      level,
    };
    
    // Only add dates if they exist
    if (typeof certificationDate === 'string' && certificationDate.trim() !== '') {
      data.certifiedAt = new Date(certificationDate);
    }
    
    if (typeof certificationExpiry === 'string' && certificationExpiry.trim() !== '') {
      data.expiresAt = new Date(certificationExpiry);
    }

    return this.prisma.employeeSkill.create({
      data,
      include: {
        employee: true,
        skill: true,
      },
    });
  }

  async findAll(
    filters: {
      employeeId?: string;
      skillId?: string;
      level?: string;
    } = {},
  ): Promise<EmployeeSkill[]> {
    const { employeeId, skillId, level } = filters;
    
    // Build the query
    const where: Record<string, unknown> = {};
    
    if (typeof employeeId === 'string' && employeeId.trim() !== '') {
      where.employeeId = employeeId;
    }
    
    if (typeof skillId === 'string' && skillId.trim() !== '') {
      where.skillId = skillId;
    }
    
    if (typeof level === 'string' && level.trim() !== '') {
      where.level = level;
    }
    
    return this.prisma.employeeSkill.findMany({
      where,
      include: {
        employee: true,
        skill: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findAllByEmployee(employeeId: string): Promise<EmployeeSkill[]> {
    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });
    
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return this.prisma.employeeSkill.findMany({
      where: { employeeId },
      include: {
        skill: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<EmployeeSkill> {
    const employeeSkill = await this.prisma.employeeSkill.findUnique({
      where: { id },
      include: {
        employee: true,
        skill: true,
      },
    });

    if (!employeeSkill) {
      throw new NotFoundException(`Employee skill with ID ${id} not found`);
    }

    return employeeSkill;
  }

  async update(
    id: string,
    updateEmployeeSkillDto: UpdateEmployeeSkillDto,
  ): Promise<EmployeeSkill> {
    // Check if employee skill exists
    const employeeSkill = await this.prisma.employeeSkill.findUnique({
      where: { id },
    });

    if (!employeeSkill) {
      throw new NotFoundException(`Employee skill with ID ${id} not found`);
    }

    const { 
      certificationDate, 
      certificationExpiry, 
      ...updateData 
    } = updateEmployeeSkillDto;

    // Build update data object
    const data: Record<string, unknown> = { ...updateData };
    
    // Only add dates if they exist and are valid
    if (typeof certificationDate === 'string' && certificationDate.trim() !== '') {
      data.certifiedAt = new Date(certificationDate);
    }
    
    if (typeof certificationExpiry === 'string' && certificationExpiry.trim() !== '') {
      data.expiresAt = new Date(certificationExpiry);
    }

    return this.prisma.employeeSkill.update({
      where: { id },
      data,
      include: {
        employee: true,
        skill: true,
      },
    });
  }

  async remove(id: string): Promise<EmployeeSkill> {
    // Check if employee skill exists
    const employeeSkill = await this.prisma.employeeSkill.findUnique({
      where: { id },
    });

    if (!employeeSkill) {
      throw new NotFoundException(`Employee skill with ID ${id} not found`);
    }

    return this.prisma.employeeSkill.delete({
      where: { id },
      include: {
        employee: true,
        skill: true,
      },
    });
  }
}
