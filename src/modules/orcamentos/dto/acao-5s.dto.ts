import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateAcao5SDto {
  @IsDateString()
  data: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;
}

export class Acao5SResponse {
  id: string;
  data: string;
  descricao: string;
  mes: string;
  createdAt: Date;
}
