import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  collaboratorIds: number[];
}
