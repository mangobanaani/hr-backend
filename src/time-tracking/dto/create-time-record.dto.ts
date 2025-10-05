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

export enum TimeRecordStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

export class CreateTimeRecordDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 'clp123abc456',
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    description: 'Date of the time record',
    example: '2024-08-03',
  })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({
    description: 'Clock in time',
    example: '2024-08-03T09:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  clockIn?: string;

  @ApiProperty({
    description: 'Clock out time',
    example: '2024-08-03T17:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  clockOut?: string;

  @ApiProperty({
    description: 'Break start time',
    example: '2024-08-03T12:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  breakStart?: string;

  @ApiProperty({
    description: 'Break end time',
    example: '2024-08-03T13:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  breakEnd?: string;

  @ApiProperty({
    description: 'Total hours worked',
    example: 8.00,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  totalHours?: number;

  @ApiProperty({
    description: 'Time record status',
    enum: TimeRecordStatus,
    example: TimeRecordStatus.PENDING,
    default: TimeRecordStatus.PENDING,
  })
  @IsEnum(TimeRecordStatus)
  @IsOptional()
  status?: TimeRecordStatus = TimeRecordStatus.PENDING;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Worked on project ABC',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: 'Location data (GPS or office)',
    example: { latitude: 40.7128, longitude: -74.0060, address: 'Office HQ' },
    required: false,
  })
  @IsObject()
  @IsOptional()
  location?: Record<string, any>;
}
