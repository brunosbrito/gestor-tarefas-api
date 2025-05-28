import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRncImageDto {
  @IsNotEmpty()
  @IsUUID()
  nonConformityId: string;

  url: string;
}

