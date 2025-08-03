import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { BenefitType } from '@prisma/client';

export class CreateBenefitDto {
  @ApiProperty({
    description: 'Name of the benefit',
    example: 'Health Insurance',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Description of the benefit',
    example: 'Comprehensive health insurance coverage',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of benefit',
    example: 'HEALTH_INSURANCE',
    enum: BenefitType,
  })
  @IsEnum(BenefitType)
  type!: BenefitType;

  @ApiProperty({
    description: 'Provider of the benefit',
    example: 'Blue Cross Blue Shield',
    required: false,
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({
    description: 'Cost of the benefit',
    example: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({
    description: 'Currency for the cost',
    example: 'USD',
    required: false,
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Whether the benefit is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Company ID',
    example: 'company-1',
  })
  @IsString()
  companyId!: string;
}
