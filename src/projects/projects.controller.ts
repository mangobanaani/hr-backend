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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create project',
    description: 'Create a new project in the HR system',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
  })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
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
  async findAll() {
    return this.projectsService.findAll();
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
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
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
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
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
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':projectId/teams/:teamId')
  @ApiOperation({
    summary: 'Assign team to project',
    description: 'Assign a team to work on a project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: 'string',
  })
  @ApiParam({
    name: 'teamId',
    description: 'Team ID',
    type: 'string',
  })
  @ApiResponse({
    status: 201,
    description: 'Team assigned to project successfully',
  })
  async assignTeam(
    @Param('projectId') projectId: string,
    @Param('teamId') teamId: string,
    @Body('role') role?: string,
  ) {
    return this.projectsService.assignTeam(projectId, teamId, role);
  }

  @Delete(':projectId/teams/:teamId')
  @ApiOperation({
    summary: 'Remove team from project',
    description: 'Remove a team assignment from a project',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: 'string',
  })
  @ApiParam({
    name: 'teamId',
    description: 'Team ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Team removed from project successfully',
  })
  async removeTeam(
    @Param('projectId') projectId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.projectsService.removeTeam(projectId, teamId);
  }
}
