import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateEffectiveDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNumber()
  @IsNotEmpty()
  shift: number;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsOptional()
  createdAt?: Date;

  @IsString()
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
