import { PartialType } from '@nestjs/mapped-types';
import { CreateMobilizacaoDto } from './create-mobilizacao.dto';

export class UpdateMobilizacaoDto extends PartialType(CreateMobilizacaoDto) {}
