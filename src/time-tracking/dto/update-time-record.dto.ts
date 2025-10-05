import { PartialType } from '@nestjs/swagger';
import { CreateTimeRecordDto } from './create-time-record.dto';

export class UpdateTimeRecordDto extends PartialType(CreateTimeRecordDto) {}
