import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

export class CreatePerformanceCycleDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(['ANNUAL', 'QUARTERLY', 'MONTHLY', 'PROJECT_BASED'])
  cycleType!: 'ANNUAL' | 'QUARTERLY' | 'MONTHLY' | 'PROJECT_BASED';

  @IsNotEmpty()
  @IsString()
  companyId!: string;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsDateString()
  reviewStartDate?: string;

  @IsOptional()
  @IsDateString()
  reviewEndDate?: string;

  @IsOptional()
  @IsEnum([
    'PLANNED',
    'ACTIVE',
    'IN_REVIEW',
    'CALIBRATION',
    'COMPLETED',
    'CANCELLED',
  ])
  status?:
    | 'PLANNED'
    | 'ACTIVE'
    | 'IN_REVIEW'
    | 'CALIBRATION'
    | 'COMPLETED'
    | 'CANCELLED' = 'PLANNED';

}
