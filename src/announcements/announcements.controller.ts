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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Announcement } from './entities/announcement.entity';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiResponse({
    status: 201,
    description: 'The announcement has been successfully created.',
  })
  create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    return this.announcementsService.create(createAnnouncementDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all announcements' })
  @ApiResponse({ status: 200, description: 'Return all announcements.' })
  findAll(): Promise<Announcement[]> {
    return this.announcementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an announcement by id' })
  @ApiResponse({ status: 200, description: 'Return the announcement.' })
  findOne(@Param('id') id: string): Promise<Announcement> {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiResponse({
    status: 200,
    description: 'The announcement has been successfully updated.',
  })
  update(
    @Param('id') id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    return this.announcementsService.update(id, updateAnnouncementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiResponse({
    status: 200,
    description: 'The announcement has been successfully deleted.',
  })
  remove(@Param('id') id: string): Promise<Announcement> {
    return this.announcementsService.remove(id);
  }
}
