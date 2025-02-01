import { PartialType } from '@nestjs/mapped-types';
import { CreateNonConformityDto } from './create-non-conformity.dto';

export class UpdateNonConformityDto extends PartialType(
  CreateNonConformityDto,
) {}
