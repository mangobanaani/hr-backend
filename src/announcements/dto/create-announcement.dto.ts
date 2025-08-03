import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { AnnouncementType, AnnouncementStatus, Priority } from '@prisma/client';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiProperty({ enum: AnnouncementType, default: AnnouncementType.GENERAL })
  @IsOptional()
  @IsEnum(AnnouncementType)
  type?: AnnouncementType;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ enum: AnnouncementStatus, default: AnnouncementStatus.DRAFT })
  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @ApiProperty()
  @IsString()
  companyId!: string;

  @ApiProperty()
  @IsString()
  createdBy!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;
}
