import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsDecimal,
  Min,
  Max,
} from 'class-validator';

export class CreateGoalDto {
  @IsNotEmpty()
  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsString()
  cycleId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(['OBJECTIVE', 'KEY_RESULT'])
  goalType!: 'OBJECTIVE' | 'KEY_RESULT';

  @IsOptional()
  @IsString()
  parentGoalId?: string;

  @IsOptional()
  @IsDecimal()
  targetValue?: number;

  @IsOptional()
  @IsDecimal()
  currentValue?: number = 0;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  @Max(1)
  weight?: number = 1.0;

  @IsNotEmpty()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority!: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsEnum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD'])
  status?:
    | 'NOT_STARTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'ON_HOLD' = 'NOT_STARTED';

  @IsOptional()
  @IsDecimal()
  @Min(0)
  @Max(1)
  progress?: number = 0;

  @IsOptional()
  @IsString()
  completionNotes?: string;

  @IsNotEmpty()
  @IsString()
  createdBy!: string;
}
