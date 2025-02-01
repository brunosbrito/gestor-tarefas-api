import { PartialType } from '@nestjs/mapped-types';
import { CreateRncImageDto } from './create-rnc-image.dto';

export class UpdateRcnImageDto extends PartialType(CreateRncImageDto) {}
