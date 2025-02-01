import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkforceDto } from './create-workforce.dto';

export class UpdateWorkforceDto extends PartialType(CreateWorkforceDto) {}
