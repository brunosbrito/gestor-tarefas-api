import { PartialType } from '@nestjs/mapped-types';
import { CreateConsumivelDto } from './create-consumivel.dto';

export class UpdateConsumivelDto extends PartialType(CreateConsumivelDto) {}
