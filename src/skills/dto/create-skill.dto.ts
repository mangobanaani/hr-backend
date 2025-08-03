import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export class CreateSkillDto {
  @ApiProperty({
    description: 'Name of the skill',
    example: 'JavaScript',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Description of the skill',
    example: 'Programming language for web development',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Category of the skill',
    example: 'Programming',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;
}
