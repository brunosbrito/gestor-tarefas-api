import { PartialType } from '@nestjs/mapped-types';
import { CreatePropostaDto } from './create-proposta.dto';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { StatusProposta } from '../entities/proposta.entity';

export class UpdatePropostaDto extends PartialType(CreatePropostaDto) {}

export class UpdateStatusDto {
  @IsEnum(StatusProposta)
  novoStatus: StatusProposta;

  @IsString()
  @IsOptional()
  motivoRejeicao?: string;

  @IsNumber()
  @IsOptional()
  aprovadoPor?: number;
}
