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
import { Process } from 'src/modules/processes/entities/process.entity';
import { MacroTask } from 'src/modules/macro-task/entities/macro-task.entity';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @IsEnum(['Planejadas', 'Em execução', 'Concluídas', 'Paralizadas', 'Atrasadas'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  plannedStartDate?: Date;

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

  @IsNumber()
  @IsOptional()
  completedQuantity?: number;

  @IsString()
  @IsOptional()
  observation;

  @IsNumber()
  @IsNotEmpty()
  macroTask: MacroTask;

  @IsNumber()
  @IsNotEmpty()
  process: Process;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  DayQuantity?: number;
}
