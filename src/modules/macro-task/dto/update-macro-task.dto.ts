import { IsString, IsOptional } from 'class-validator';

export class UpdateMacroTaskDto {
  @IsOptional()
  @IsString()
  name?: string;
}
