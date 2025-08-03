import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Employee number (unique identifier)' })
  @IsString()
  employeeNumber!: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName!: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName!: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender, description: 'Gender' })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Street address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ description: 'Hire date' })
  @IsDateString()
  hireDate!: string;

  @ApiPropertyOptional({ description: 'Termination date' })
  @IsDateString()
  @IsOptional()
  terminationDate?: string;

  @ApiProperty({ enum: EmploymentStatus, description: 'Employment status' })
  @IsEnum(EmploymentStatus)
  status!: EmploymentStatus;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Manager ID' })
  @IsString()
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Location ID' })
  @IsString()
  @IsOptional()
  locationId?: string;

  @ApiPropertyOptional({ description: 'User ID for login account' })
  @IsString()
  @IsOptional()
  userId?: string;
}
