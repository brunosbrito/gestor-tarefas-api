import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  IsDate,
  IsInt,
  IsPositive,
} from 'class-validator';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @IsEnum(['Planejadas', 'Em execução', 'Concluídas', 'Paralizadas'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  macroTask?: string;

  @IsString()
  @IsOptional()
  process?: string;

  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsDateString()
  @IsOptional()
  pauseDate?: Date;

  @IsDateString()
  @IsOptional()
  completedAt?: Date;

  @IsNumber()
  @IsNotEmpty()
  changedBy: number;

  @IsArray()
  @IsNotEmpty()
  workedHours: {
    id: number;
    hours: number;
  }[];

  @IsString()
  @IsOptional()
  realizationDescription: Date;

  @IsOptional()
  @IsDate()
  originalStartDate: Date;

  @IsNumber()
  @IsOptional()
  totalTime: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsInt()
  @IsPositive()
  completedQuantity: number;

  @IsString()
  @IsOptional()
  observation;
}
