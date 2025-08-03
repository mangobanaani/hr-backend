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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Skill } from '@prisma/client';

@ApiTags('skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new skill' })
  @ApiResponse({
    status: 201,
    description: 'The skill has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Skill with this name already exists.',
  })
  create(@Body() createSkillDto: CreateSkillDto): Promise<Skill> {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter skills by category',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all skills.',
  })
  findAll(@Query('category') category?: string): Promise<Skill[]> {
    if (category != null && category.trim() !== '') {
      return this.skillsService.findByCategory(category);
    }
    return this.skillsService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all skill categories' })
  @ApiResponse({
    status: 200,
    description: 'Return all skill categories.',
  })
  getCategories(): Promise<string[]> {
    return this.skillsService.getSkillCategories();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a skill by id' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the skill.',
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found.',
  })
  findOne(@Param('id') id: string): Promise<Skill> {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a skill' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'The skill has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Skill with this name already exists.',
  })
  update(
    @Param('id') id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a skill' })
  @ApiParam({ name: 'id', description: 'Skill ID' })
  @ApiResponse({
    status: 200,
    description: 'The skill has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Skill not found.',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.skillsService.remove(id);
  }
}
