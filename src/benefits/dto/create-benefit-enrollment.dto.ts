import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBenefitEnrollmentDto {
  @ApiProperty({ description: 'Employee ID' })
  @IsString()
  employeeId!: string;

  @ApiProperty({ description: 'Enrollment start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ required: false, description: 'Enrollment end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, description: 'Enrollment cost' })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ required: false, description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, description: 'Whether enrollment is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
