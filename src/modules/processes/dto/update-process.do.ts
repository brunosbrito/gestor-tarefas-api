import { IsString, IsOptional } from 'class-validator';

export class UpdateProcessDto {
  @IsOptional()
  @IsString()
  name?: string;
}
