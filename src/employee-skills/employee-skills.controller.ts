import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmployeeSkillsService } from './employee-skills.service';
import { 
  CreateEmployeeSkillDto,
  SkillLevel, 
} from './dto/create-employee-skill.dto';
import { UpdateEmployeeSkillDto } from './dto/update-employee-skill.dto';
import { EmployeeSkill } from '@prisma/client';

@ApiTags('employee-skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employee-skills')
export class EmployeeSkillsController {
  constructor(private readonly employeeSkillsService: EmployeeSkillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new employee skill record' })
  async create(
    @Body() createEmployeeSkillDto: CreateEmployeeSkillDto,
  ): Promise<EmployeeSkill> {
    return this.employeeSkillsService.create(createEmployeeSkillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all employee skills with optional filtering' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'skillId', required: false })
  @ApiQuery({
    name: 'level',
    enum: SkillLevel,
    required: false,
  })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('skillId') skillId?: string,
    @Query('level') level?: string,
  ): Promise<EmployeeSkill[]> {
    return this.employeeSkillsService.findAll({ employeeId, skillId, level });
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get all skills for a specific employee' })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  async findAllByEmployee(
    @Param('employeeId') employeeId: string,
  ): Promise<EmployeeSkill[]> {
    return this.employeeSkillsService.findAllByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific employee skill record by ID' })
  @ApiParam({ name: 'id', description: 'Employee skill ID' })
  async findOne(@Param('id') id: string): Promise<EmployeeSkill> {
    return this.employeeSkillsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employee skill record' })
  @ApiParam({ name: 'id', description: 'Employee skill ID' })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeSkillDto: UpdateEmployeeSkillDto,
  ): Promise<EmployeeSkill> {
    return this.employeeSkillsService.update(id, updateEmployeeSkillDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee skill record' })
  @ApiParam({ name: 'id', description: 'Employee skill ID' })
  async remove(@Param('id') id: string): Promise<EmployeeSkill> {
    return this.employeeSkillsService.remove(id);
  }
}
