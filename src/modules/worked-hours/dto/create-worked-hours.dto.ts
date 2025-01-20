import { IsInt, IsString, IsDateString } from 'class-validator';

export class CreateWorkedHoursDto {
  @IsInt()
  colaboradorId: number;

  @IsInt()
  atividadeId: number;

  @IsInt()
  hoursWorked: number;

  @IsString()
  @IsDateString()
  date: string;
}
