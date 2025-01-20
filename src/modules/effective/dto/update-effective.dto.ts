import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateEffectiveDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsNumber()
  @IsOptional()
  shift?: number;

  @IsString()
  @IsOptional()
  role?: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  project: string;

  @IsOptional()
  typeRegister?: string;

  @IsOptional()
  reason: string;

  @IsOptional()
  sector: string;

  @IsOptional()
  status: string;
}
