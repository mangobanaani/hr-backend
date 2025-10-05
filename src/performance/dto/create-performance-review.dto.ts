import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsDecimal,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ReviewType {
  ANNUAL = 'ANNUAL',
  MID_YEAR = 'MID_YEAR',
  PROBATION = 'PROBATION',
  PROJECT = 'PROJECT',
  QUARTERLY = 'QUARTERLY',
  CONTINUOUS = 'CONTINUOUS',
}

export enum ReviewStatus {
  DRAFT = 'DRAFT',
  SELF_REVIEW = 'SELF_REVIEW',
  MANAGER_REVIEW = 'MANAGER_REVIEW',
  CALIBRATION = 'CALIBRATION',
  COMPLETED = 'COMPLETED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

export enum PromotionRecommendation {
  NONE = 'NONE',
  READY_NOW = 'READY_NOW',
  READY_6_MONTHS = 'READY_6_MONTHS',
  READY_1_YEAR = 'READY_1_YEAR',
  NOT_READY = 'NOT_READY',
}

export class CreatePerformanceReviewDto {
  @ApiProperty({
    description: 'Employee ID being reviewed',
    example: 'clp123abc456',
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    description: 'Reviewer (manager) ID',
    example: 'clp789xyz123',
  })
  @IsString()
  @IsNotEmpty()
  reviewerId!: string;

  @ApiProperty({
    description: 'Performance cycle ID',
    example: 'clpcycle123',
    required: false,
  })
  @IsString()
  @IsOptional()
  cycleId?: string;

  @ApiProperty({
    description: 'Review template ID',
    example: 'clptemplate456',
    required: false,
  })
  @IsString()
  @IsOptional()
  templateId?: string;

  @ApiProperty({
    description: 'Review period',
    example: '2024-Q3',
  })
  @IsString()
  @IsNotEmpty()
  period!: string;

  @ApiProperty({
    description: 'Review type',
    enum: ReviewType,
    example: ReviewType.ANNUAL,
  })
  @IsEnum(ReviewType)
  @IsNotEmpty()
  type!: ReviewType;

  @ApiProperty({
    description: 'Review status',
    enum: ReviewStatus,
    example: ReviewStatus.DRAFT,
    default: ReviewStatus.DRAFT,
  })
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus = ReviewStatus.DRAFT;

  @ApiProperty({
    description: 'Overall rating (0-5)',
    example: 4.5,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  overallRating?: number;

  @ApiProperty({
    description: 'Self assessment JSON',
    example: { strengths: ['Communication'], areas: ['Time management'] },
    required: false,
  })
  @IsObject()
  @IsOptional()
  selfAssessment?: Record<string, any>;

  @ApiProperty({
    description: 'Manager assessment JSON',
    example: { rating: 4, comments: 'Excellent performance' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  managerAssessment?: Record<string, any>;

  @ApiProperty({
    description: 'Final rating (0-5)',
    example: 4.5,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  finalRating?: number;

  @ApiProperty({
    description: 'Promotion recommendation',
    enum: PromotionRecommendation,
    example: PromotionRecommendation.READY_6_MONTHS,
    default: PromotionRecommendation.NONE,
  })
  @IsEnum(PromotionRecommendation)
  @IsOptional()
  promotionRecommendation?: PromotionRecommendation = PromotionRecommendation.NONE;

  @ApiProperty({
    description: 'Salary increase recommendation (percentage)',
    example: 5.5,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  salaryIncreaseRecommendation?: number;

  @ApiProperty({
    description: 'Goals JSON',
    required: false,
  })
  @IsObject()
  @IsOptional()
  goals?: Record<string, any>;

  @ApiProperty({
    description: 'Feedback comments',
    example: 'Great performance this quarter',
    required: false,
  })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({
    description: 'Development plan',
    example: 'Focus on leadership skills',
    required: false,
  })
  @IsString()
  @IsOptional()
  developmentPlan?: string;

  @ApiProperty({
    description: 'Review date',
    example: '2024-08-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  reviewDate?: string;

  @ApiProperty({
    description: 'Due date',
    example: '2024-08-31',
  })
  @IsDateString()
  @IsNotEmpty()
  dueDate!: string;
}
