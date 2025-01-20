import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

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
  changedBy: number; // Representa o ID do usuário que fez a alteração
}
