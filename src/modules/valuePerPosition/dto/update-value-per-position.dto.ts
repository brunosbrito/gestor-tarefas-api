import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateValuePerPositionDto {
  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  value?: number;
}
