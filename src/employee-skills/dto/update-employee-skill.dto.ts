import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeSkillDto } from './create-employee-skill.dto';

export class UpdateEmployeeSkillDto extends PartialType(
  CreateEmployeeSkillDto,
) {}
