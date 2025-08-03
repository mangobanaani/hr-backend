import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Department description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Department code' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Company ID' })
  @IsString()
  companyId!: string;

  @ApiPropertyOptional({ description: 'Parent department ID' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Department head employee ID' })
  @IsString()
  @IsOptional()
  headId?: string;
}
