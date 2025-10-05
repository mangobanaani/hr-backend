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
import { PerformanceService } from './performance.service';
import { CreatePerformanceCycleDto } from './dto/create-performance-cycle.dto';
import { UpdatePerformanceCycleDto } from './dto/update-performance-cycle.dto';
import { CreatePerformanceReviewDto } from './dto/create-performance-review.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance-review.dto';

@ApiTags('performance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  // ==================== Performance Cycles ====================

  @Post('cycles')
  @ApiOperation({
    summary: 'Create performance cycle',
    description: 'Create a new performance review cycle',
  })
  @ApiResponse({
    status: 201,
    description: 'Performance cycle created successfully',
  })
  async createCycle(@Body() createCycleDto: CreatePerformanceCycleDto) {
    return this.performanceService.createCycle(createCycleDto);
  }

  @Get('cycles')
  @ApiOperation({
    summary: 'Get all performance cycles',
    description: 'Retrieve a list of all performance cycles',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    description: 'Filter by company ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance cycles retrieved successfully',
  })
  async findAllCycles(@Query('companyId') companyId?: string) {
    return this.performanceService.findAllCycles(companyId);
  }

  @Get('cycles/:id')
  @ApiOperation({
    summary: 'Get performance cycle by ID',
    description: 'Retrieve a specific performance cycle by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance cycle ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance cycle retrieved successfully',
  })
  async findOneCycle(@Param('id') id: string) {
    return this.performanceService.findOneCycle(id);
  }

  @Patch('cycles/:id')
  @ApiOperation({
    summary: 'Update performance cycle',
    description: 'Update an existing performance cycle',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance cycle ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance cycle updated successfully',
  })
  async updateCycle(
    @Param('id') id: string,
    @Body() updateCycleDto: UpdatePerformanceCycleDto,
  ) {
    return this.performanceService.updateCycle(id, updateCycleDto);
  }

  @Delete('cycles/:id')
  @ApiOperation({
    summary: 'Delete performance cycle',
    description: 'Delete a performance cycle from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance cycle ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance cycle deleted successfully',
  })
  async removeCycle(@Param('id') id: string) {
    return this.performanceService.removeCycle(id);
  }

  // ==================== Performance Reviews ====================

  @Post('reviews')
  @ApiOperation({
    summary: 'Create performance review',
    description: 'Create a new performance review',
  })
  @ApiResponse({
    status: 201,
    description: 'Performance review created successfully',
  })
  async createReview(@Body() createReviewDto: CreatePerformanceReviewDto) {
    return this.performanceService.createReview(createReviewDto);
  }

  @Get('reviews')
  @ApiOperation({
    summary: 'Get all performance reviews',
    description: 'Retrieve a list of all performance reviews',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'reviewerId',
    required: false,
    description: 'Filter by reviewer ID',
  })
  @ApiQuery({
    name: 'cycleId',
    required: false,
    description: 'Filter by cycle ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance reviews retrieved successfully',
  })
  async findAllReviews(
    @Query('employeeId') employeeId?: string,
    @Query('reviewerId') reviewerId?: string,
    @Query('cycleId') cycleId?: string,
  ) {
    return this.performanceService.findAllReviews(
      employeeId,
      reviewerId,
      cycleId,
    );
  }

  @Get('reviews/:id')
  @ApiOperation({
    summary: 'Get performance review by ID',
    description: 'Retrieve a specific performance review by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance review ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance review retrieved successfully',
  })
  async findOneReview(@Param('id') id: string) {
    return this.performanceService.findOneReview(id);
  }

  @Patch('reviews/:id')
  @ApiOperation({
    summary: 'Update performance review',
    description: 'Update an existing performance review',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance review ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance review updated successfully',
  })
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdatePerformanceReviewDto,
  ) {
    return this.performanceService.updateReview(id, updateReviewDto);
  }

  @Patch('reviews/:id/submit')
  @ApiOperation({
    summary: 'Submit performance review',
    description: 'Submit a performance review for manager evaluation',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance review ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance review submitted successfully',
  })
  async submitReview(@Param('id') id: string) {
    return this.performanceService.submitReview(id);
  }

  @Patch('reviews/:id/complete')
  @ApiOperation({
    summary: 'Complete performance review',
    description: 'Mark a performance review as completed',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance review ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance review completed successfully',
  })
  async completeReview(@Param('id') id: string) {
    return this.performanceService.completeReview(id);
  }

  @Delete('reviews/:id')
  @ApiOperation({
    summary: 'Delete performance review',
    description: 'Delete a performance review from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Performance review ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Performance review deleted successfully',
  })
  async removeReview(@Param('id') id: string) {
    return this.performanceService.removeReview(id);
  }
}
