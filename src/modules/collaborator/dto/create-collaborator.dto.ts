import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCollaboratorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsNumber({}, { message: "O preço deve ser um número válido." })
  @Min(0, { message: "O preço não pode ser negativo." })
  pricePerHour: number;
}
