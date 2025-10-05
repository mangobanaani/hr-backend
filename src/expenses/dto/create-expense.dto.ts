import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDecimal,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REIMBURSED = 'REIMBURSED',
  CANCELLED = 'CANCELLED',
}

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Employee ID who submitted the expense',
    example: 'clp123abc456',
  })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({
    description: 'Expense category ID',
    example: 'clp789xyz123',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 125.50,
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @IsNotEmpty()
  amount!: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string = 'USD';

  @ApiProperty({
    description: 'Expense description',
    example: 'Client dinner at Restaurant XYZ',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Expense date',
    example: '2024-08-03',
  })
  @IsDateString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({
    description: 'Receipt file URL',
    example: 'https://storage.example.com/receipts/receipt123.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  receipt?: string;

  @ApiProperty({
    description: 'Expense status',
    enum: ExpenseStatus,
    example: ExpenseStatus.PENDING,
    required: false,
  })
  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus = ExpenseStatus.PENDING;

  @ApiProperty({
    description: 'Additional comments',
    example: 'Business meeting with potential client',
    required: false,
  })
  @IsString()
  @IsOptional()
  comments?: string;
}
