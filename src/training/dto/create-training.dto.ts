import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDecimal,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TrainingType } from '@prisma/client';

export class CreateTrainingDto {
  @ApiProperty({
    description: 'Training title',
    example: 'Advanced TypeScript Development',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'Training description',
    example: 'Comprehensive course covering advanced TypeScript concepts',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Type of training',
    enum: TrainingType,
    example: TrainingType.ONLINE,
  })
  @IsEnum(TrainingType)
  type!: TrainingType;

  @ApiProperty({
    description: 'Training provider',
    example: 'Tech Academy',
    required: false,
  })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiProperty({
    description: 'Duration in hours',
    example: 40,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({
    description: 'Training cost',
    example: 1500,
    required: false,
  })
  @IsOptional()
  @IsDecimal()
  cost?: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Whether this training is required',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
