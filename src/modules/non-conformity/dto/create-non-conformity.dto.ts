import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Material } from 'src/modules/material/entities/material.entity';
import { Workforce } from 'src/modules/workforce-rnc/entities/workforce.entity';

export class CreateNonConformityDto {
  @IsNumber()
  projectId: number;

  @IsNumber()
  serviceOrder: number;

  @IsString()
  description: string;

  @IsNumber()
  responsibleIdentification: number;

  @IsDateString()
  dateOccurrence: string;

  @IsString()
  correctiveAction: string;

  @IsString()
  responsibleAction: string;

  @IsDateString()
  @IsOptional()
  dataConclusion?: string;

  @IsNumber()
  code: number;

  @IsNumber()
  responsibleRnc: number;

  @IsArray()
  @IsOptional()
  workforce?: Workforce[];

  @IsArray()
  @IsOptional()
  materials?: Material[];

  @IsNumber()
  responsibleRNC: number;

  @IsNumber()
  project: number;
}
