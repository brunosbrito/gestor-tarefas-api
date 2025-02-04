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
  serviceOrderId: number;

  @IsString()
  description: string;

  @IsNumber()
  responsibleIdentification: number;

  @IsDateString()
  dateOccurrence: string;

  @IsString()
  correctiveAction: string;

  @IsString()
  responsibleActionId: string;

  @IsDateString()
  @IsOptional()
  dataConclusion?: string;

  @IsNumber()
  responsibleRncId: number;

  @IsArray()
  @IsOptional()
  workforce?: Workforce[];

  @IsArray()
  @IsOptional()
  materials?: Material[];
}
