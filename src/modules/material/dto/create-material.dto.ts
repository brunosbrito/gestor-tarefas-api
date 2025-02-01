import { IsUUID, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateMaterialDto {
  @IsUUID()
  nonConformityId: string;

  @IsString()
  materialName: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;
}
