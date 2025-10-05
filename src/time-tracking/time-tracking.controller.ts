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
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeRecordDto } from './dto/create-time-record.dto';
import { UpdateTimeRecordDto } from './dto/update-time-record.dto';

@ApiTags('time-tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-tracking')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create time entry',
    description: 'Create a new time tracking entry',
  })
  @ApiResponse({
    status: 201,
    description: 'Time entry created successfully',
  })
  async create(@Body() createTimeRecordDto: CreateTimeRecordDto) {
    return this.timeTrackingService.create(createTimeRecordDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all time entries',
    description: 'Retrieve a list of all time tracking entries',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Time entries list retrieved successfully',
  })
  async findAll(
    @Query('employeeId') employeeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.timeTrackingService.findAll(employeeId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get time entry by ID',
    description: 'Retrieve a specific time entry by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Time Entry ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry retrieved successfully',
  })
  async findOne(@Param('id') id: string) {
    return this.timeTrackingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update time entry',
    description: 'Update an existing time tracking entry',
  })
  @ApiParam({
    name: 'id',
    description: 'Time Entry ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTimeRecordDto: UpdateTimeRecordDto,
  ) {
    return this.timeTrackingService.update(id, updateTimeRecordDto);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve time entry',
    description: 'Approve a pending time entry',
  })
  @ApiParam({
    name: 'id',
    description: 'Time Entry ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry approved successfully',
  })
  async approve(@Param('id') id: string) {
    return this.timeTrackingService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject time entry',
    description: 'Reject a pending time entry',
  })
  @ApiParam({
    name: 'id',
    description: 'Time Entry ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry rejected successfully',
  })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.timeTrackingService.reject(id, reason);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete time entry',
    description: 'Delete a time tracking entry from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Time Entry ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Time entry deleted successfully',
  })
  async remove(@Param('id') id: string) {
    return this.timeTrackingService.remove(id);
  }
}
