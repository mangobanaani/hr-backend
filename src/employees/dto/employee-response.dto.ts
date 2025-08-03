import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentStatus, Gender } from './create-employee.dto';

export class EmployeeResponseDto {
  @ApiProperty({ description: 'Employee ID' })
  id!: string;

  @ApiProperty({ description: 'Employee number (unique identifier)' })
  employeeNumber!: string;

  @ApiProperty({ description: 'First name' })
  firstName!: string;

  @ApiProperty({ description: 'Last name' })
  lastName!: string;

  @ApiProperty({ description: 'Email address' })
  email!: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: Gender, description: 'Gender' })
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Street address' })
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code' })
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Country' })
  country?: string;

  @ApiProperty({ description: 'Hire date' })
  hireDate!: Date;

  @ApiPropertyOptional({ description: 'Termination date' })
  terminationDate?: Date;

  @ApiProperty({ enum: EmploymentStatus, description: 'Employment status' })
  status!: EmploymentStatus;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  emergencyContactName?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  emergencyContactPhone?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'Department information' })
  department?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ description: 'Manager information' })
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiPropertyOptional({ description: 'Location information' })
  location?: {
    id: string;
    name: string;
    city: string;
  };
}
