import {
  IsString,
  IsNotEmpty,
  IsNumber,
  isNumber,
  IsOptional,
} from 'class-validator';

export class CreateActivityHistoryDto {
  @IsNumber()
  activityId: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  DayQuantity?: number;

  @IsNumber()
  changedBy: number; // Representa o ID do usuário que fez a alteração
}
