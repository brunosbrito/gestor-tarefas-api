import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';

export class UpdateCollaboratorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(1)
  positionId?: number;

  @IsBoolean()
  status?: boolean;

  @IsString()
  @IsOptional()
  role?: string;
}
