import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class FilterDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Search query string',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Field to sort by',
  })
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiProperty({
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
    description: 'Sort order (asc or desc)',
  })
  sortOrder?: SortOrder = SortOrder.DESC;
}
