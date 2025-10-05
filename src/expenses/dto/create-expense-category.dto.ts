import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDecimal,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Travel',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Travel expenses including flights, hotels, and transportation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Maximum allowed amount for this category',
    example: 5000.00,
    required: false,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @IsOptional()
  maxAmount?: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
