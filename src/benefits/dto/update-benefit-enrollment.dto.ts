import { PartialType } from '@nestjs/swagger';
import { CreateBenefitEnrollmentDto } from './create-benefit-enrollment.dto';

export class UpdateBenefitEnrollmentDto extends PartialType(
  CreateBenefitEnrollmentDto,
) {}
