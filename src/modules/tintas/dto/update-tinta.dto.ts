import { PartialType } from '@nestjs/mapped-types';
import { CreateTintaDto } from './create-tinta.dto';

export class UpdateTintaDto extends PartialType(CreateTintaDto) {}
