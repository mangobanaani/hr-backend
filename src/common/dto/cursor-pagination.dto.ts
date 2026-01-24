import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Cursor for the next page of results',
    example: 'clp123abc456',
  })
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Number of items to return',
    example: 20,
  })
  limit?: number = 20;
}
