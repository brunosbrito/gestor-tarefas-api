import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateCollaboratorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsNumber({}, { message: "O preço deve ser um número válido." })
  @Min(0, { message: "O preço não pode ser negativo." })
  pricePerHour: number;
}
