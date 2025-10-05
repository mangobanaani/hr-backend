import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create goal',
    description: 'Create a new employee goal',
  })
  @ApiResponse({
    status: 201,
    description: 'Goal created successfully',
  })
  async create(@Body() createGoalDto: CreateGoalDto) {
    return this.goalsService.create(createGoalDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all goals',
    description: 'Retrieve a list of all goals',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by goal status',
  })
  @ApiResponse({
    status: 200,
    description: 'Goals retrieved successfully',
  })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    return this.goalsService.findAll(employeeId, status);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get goal by ID',
    description: 'Retrieve a specific goal by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.goalsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update goal',
    description: 'Update an existing goal',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, updateGoalDto);
  }

  @Patch(':id/progress')
  @ApiOperation({
    summary: 'Update goal progress',
    description: 'Update progress for a specific goal',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal progress updated successfully',
  })
  async updateProgress(
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    return this.goalsService.updateProgress(id, progress);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete goal',
    description: 'Delete a goal from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Goal ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Goal deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.goalsService.remove(id);
  }
}
