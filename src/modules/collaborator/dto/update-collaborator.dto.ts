import { IsString, IsOptional } from 'class-validator';

export class UpdateCollaboratorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;
}
