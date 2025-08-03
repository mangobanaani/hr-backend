import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty()
  @IsString()
  employeeId!: string;

  @ApiProperty()
  @IsString()
  documentTypeId!: string;

  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty()
  @IsString()
  filePath!: string;

  @ApiProperty()
  @IsInt()
  fileSize!: number;

  @ApiProperty()
  @IsString()
  mimeType!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  verifiedAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  verifiedBy?: string;
}
