import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
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
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterDto } from '../common/dto/filter.dto';
import { PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Roles('admin')
  @Post()
  @ApiOperation({
    summary: 'Create a new employee',
    description: 'Create a new employee record in the system',
  })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Employee number or email already exists',
  })
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all employees',
    description: 'Retrieve a paginated list of all employees',
  })
  @ApiResponse({
    status: 200,
    description: 'List of employees retrieved successfully',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterDto,
  ): Promise<PaginatedResponse<EmployeeResponseDto>> {
    return this.employeesService.findAll(paginationDto, filterDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get employee by ID',
    description: 'Retrieve a specific employee by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee retrieved successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async findOne(@Param('id') id: string): Promise<EmployeeResponseDto> {
    return this.employeesService.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({
    summary: 'Update employee',
    description: 'Update an existing employee record',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Employee number or email already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Roles('admin')
  @Put(':id')
  @ApiOperation({
    summary: 'Replace employee',
    description: 'Replace an existing employee record',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee updated successfully',
    type: EmployeeResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Employee number or email already exists',
  })
  async replace(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete employee',
    description: 'Delete an employee from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Employee deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.employeesService.remove(id);
    return { message: `Employee ${id} deleted successfully` };
  }
}
