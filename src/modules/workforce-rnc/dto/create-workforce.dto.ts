import { IsNumber, IsString } from 'class-validator';

export class CreateWorkforceDto {
  @IsNumber()
  colaboradorId: number;

  @IsString()
  name: string;

  @IsNumber()
  hours: number;

  @IsNumber()
  valueHour: number;

  @IsNumber()
  total: number;

  @IsString()
  rnc: string; // ID da não conformidade (foreign key)
}
