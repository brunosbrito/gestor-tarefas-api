import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCollaboratorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  positionId: number;

  @IsString()
  role: string;

  @IsString()
  sector: string;
}
