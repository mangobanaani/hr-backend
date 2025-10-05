import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'Q4 Product Launch',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Launch of new product line for Q4 2024',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.PLANNING,
    default: ProjectStatus.PLANNING,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus = ProjectStatus.PLANNING;

  @ApiProperty({
    description: 'Project priority',
    enum: Priority,
    example: Priority.HIGH,
    default: Priority.MEDIUM,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority = Priority.MEDIUM;

  @ApiProperty({
    description: 'Project start date',
    example: '2024-08-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Project end date',
    example: '2024-12-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Project budget',
    example: 50000.00,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  budget?: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({
    description: 'Project manager ID',
    example: 'clp123abc456',
    required: false,
  })
  @IsString()
  @IsOptional()
  managerId?: string;
}
