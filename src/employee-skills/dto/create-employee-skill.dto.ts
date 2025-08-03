import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export class CreateEmployeeSkillDto {
  @ApiProperty({
    description: 'Employee ID',
    example: 'clp123abc456',
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    description: 'Skill ID',
    example: 'clp456def789',
  })
  @IsString()
  @IsNotEmpty()
  skillId!: string;

  @ApiProperty({
    description: 'Skill level',
    enum: SkillLevel,
    example: SkillLevel.INTERMEDIATE,
  })
  @IsEnum(SkillLevel)
  level!: SkillLevel;

  @ApiProperty({
    description: 'Years of experience with this skill',
    example: 3,
    required: false,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  yearsOfExperience?: number;

  @ApiProperty({
    description: 'Whether the employee is certified in this skill',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  certified?: boolean;

  @ApiProperty({
    description: 'Date of certification',
    example: '2024-01-15T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  certificationDate?: string;

  @ApiProperty({
    description: 'Date when certification expires',
    example: '2026-01-15T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  certificationExpiry?: string;
}
