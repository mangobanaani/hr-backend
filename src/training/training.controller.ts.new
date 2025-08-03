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
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';

@ApiTags('training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create training',
    description: 'Create a new training program or session',
  })
  @ApiResponse({
    status: 201,
    description: 'Training created successfully',
  })
  async create(@Body() createTrainingDto: CreateTrainingDto) {
    return await this.trainingService.create(createTrainingDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all training',
    description: 'Retrieve a list of all training programs',
  })
  @ApiResponse({
    status: 200,
    description: 'Training list retrieved successfully',
  })
  async findAll() {
    return await this.trainingService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get training by ID',
    description: 'Retrieve a specific training program by ID',
  })
  @ApiParam({ name: 'id', description: 'Training ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Training retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Training not found' })
  async findOne(@Param('id') id: string) {
    return await this.trainingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update training',
    description: 'Update a specific training program by ID',
  })
  @ApiParam({ name: 'id', description: 'Training ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Training updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Training not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ) {
    return await this.trainingService.update(id, updateTrainingDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete training',
    description: 'Delete a specific training program by ID',
  })
  @ApiParam({ name: 'id', description: 'Training ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Training deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Training not found' })
  async remove(@Param('id') id: string) {
    return await this.trainingService.remove(id);
  }
}
