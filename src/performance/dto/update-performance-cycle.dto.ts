import { PartialType } from '@nestjs/swagger';
import { CreatePerformanceCycleDto } from './create-performance-cycle.dto';

export class UpdatePerformanceCycleDto extends PartialType(
  CreatePerformanceCycleDto,
) {}
