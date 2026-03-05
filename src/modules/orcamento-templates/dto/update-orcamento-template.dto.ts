import { PartialType } from '@nestjs/mapped-types';
import { CreateOrcamentoTemplateDto } from './create-orcamento-template.dto';

export class UpdateOrcamentoTemplateDto extends PartialType(
  CreateOrcamentoTemplateDto,
) {}
