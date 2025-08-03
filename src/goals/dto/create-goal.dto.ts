import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsInt,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GoalCategory {
  PERFORMANCE = 'PERFORMANCE',
  DEVELOPMENT = 'DEVELOPMENT',
  CAREER = 'CAREER',
  PROJECT = 'PROJECT',
  COMPANY = 'COMPANY',
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
}

export class CreateGoalDto {
  @ApiProperty({
    description: 'Employee ID who owns this goal',
    example: 'clp123abc456',
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    description: 'Performance review ID if goal is linked to a review',
    example: 'clp789xyz123',
    required: false,
  })
  @IsString()
  @IsOptional()
  performanceReviewId?: string;

  @ApiProperty({
    description: 'Goal title',
    example: 'Improve JavaScript skills',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Detailed description of the goal',
    example: 'Complete advanced JavaScript course and build 2 projects',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Goal category',
    enum: GoalCategory,
    example: GoalCategory.DEVELOPMENT,
  })
  @IsEnum(GoalCategory)
  category!: GoalCategory;

  @ApiProperty({
    description: 'Target value to achieve',
    example: 100,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal()
  @IsOptional()
  targetValue?: number;

  @ApiProperty({
    description: 'Current progress value',
    example: 25,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal()
  @IsOptional()
  currentValue?: number;

  @ApiProperty({
    description: 'Measurement unit for progress',
    example: 'percentage',
    required: false,
  })
  @IsString()
  @IsOptional()
  measurementUnit?: string;

  @ApiProperty({
    description: 'Goal weight in performance evaluation (0.0 to 1.0)',
    example: 0.3,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal()
  @Min(0)
  @Max(1)
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Goal due date',
    example: '2024-12-31T23:59:59.999Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    description: 'Goal status',
    enum: GoalStatus,
    example: GoalStatus.NOT_STARTED,
    required: false,
  })
  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;

  @ApiProperty({
    description: 'Completion percentage (0-100)',
    example: 25,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @ApiProperty({
    description: 'Additional notes',
    example: 'This goal supports career development objectives',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
