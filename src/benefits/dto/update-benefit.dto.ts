import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBenefitDto } from './create-benefit.dto';

export class UpdateBenefitDto extends PartialType(
  OmitType(CreateBenefitDto, ['companyId'] as const),
) {}
