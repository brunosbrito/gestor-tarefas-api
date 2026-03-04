import { PartialType } from '@nestjs/mapped-types';
import { CreateFerramentaDto } from './create-ferramenta.dto';

export class UpdateFerramentaDto extends PartialType(CreateFerramentaDto) {}
