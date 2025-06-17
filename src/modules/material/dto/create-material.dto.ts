import { IsNumber, IsString } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  material: string;

  @IsNumber()
  quantidade: number;

  @IsString()
  unidade: string;

  @IsNumber()
  preco: number;

  @IsNumber()
  total: number;

  @IsString()
  rncId: string; // ID da não conformidade
}
