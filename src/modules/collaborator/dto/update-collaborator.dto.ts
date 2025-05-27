import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateCollaboratorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(1)
  positionId?: number;

}
