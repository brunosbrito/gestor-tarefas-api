import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCollaboratorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}
