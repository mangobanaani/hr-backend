import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentsService } from './departments.service';
import { Department } from './entities/department.entity';

@ApiTags('departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new department',
    description: 'Create a new department in the organization',
  })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
  })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all departments',
    description: 'Retrieve a list of all departments',
  })
  @ApiResponse({
    status: 200,
    description: 'List of departments retrieved successfully',
  })
  async findAll(): Promise<Department[]> {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get department by ID',
    description: 'Retrieve a specific department by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
  })
  async findOne(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update department',
    description: 'Update an existing department',
  })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete department',
    description: 'Delete a department from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Department ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Department deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<Department> {
    return this.departmentsService.remove(id);
  }
}
