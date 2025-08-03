import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePolicyDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  companyId!: string;

  @ApiProperty()
  @IsString()
  createdBy!: string;

  @ApiProperty({ required: false, default: '1.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}
