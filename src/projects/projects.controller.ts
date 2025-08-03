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

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  @Post()
  @ApiOperation({
    summary: 'Create project',
    description: 'Create a new project in the HR system',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
  })
  create(@Body() _data: Record<string, unknown>): { message: string } {
    return {
      message: 'Project creation endpoint - to be implemented',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Retrieve a list of all projects',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects list retrieved successfully',
  })
  findAll(): { message: string } {
    return {
      message: 'Projects list endpoint - to be implemented',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by ID',
    description: 'Retrieve a specific project by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
  })
  findOne(@Param('id') id: string): { message: string } {
    return {
      message: `Project ${id} details - to be implemented`,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update project',
    description: 'Update an existing project',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
  })
  update(
    @Param('id') id: string,
    @Body() _data: Record<string, unknown>,
  ): { message: string } {
    return {
      message: `Project ${id} update - to be implemented`,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete project',
    description: 'Delete a project from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
  })
  remove(@Param('id') id: string): { message: string } {
    return {
      message: `Project ${id} deletion - to be implemented`,
    };
  }
}
