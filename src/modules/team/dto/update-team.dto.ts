import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  collaboratorIds?: number[]; // IDs dos colaboradores atualizados
}
