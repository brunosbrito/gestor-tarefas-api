import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsInt,
} from 'class-validator';
import { Material } from 'src/modules/material/entities/material.entity';
import { Workforce } from 'src/modules/workforce-rnc/entities/workforce.entity';

export class CreateNonConformityDto {
  @IsInt()
  projectId: string;

  @IsInt()
  serviceOrderId: string;

  @IsString()
  description: string;

  @IsString()
  responsibleIdentification: string;

  @IsDateString()
  dateOccurrence: string;

  @IsString()
  correctiveAction: string;

  @IsString()
  responsibleAction: string;

  @IsDateString()
  @IsOptional()
  dataConclusion?: string;

  @IsInt()
  responsibleRnc: string;

  @IsArray()
  @IsOptional()
  workforce?: Workforce[];

  @IsArray()
  @IsOptional()
  materials?: Material[];
}
