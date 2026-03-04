import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialCatalogoDto } from './create-material-catalogo.dto';

export class UpdateMaterialCatalogoDto extends PartialType(CreateMaterialCatalogoDto) {}
