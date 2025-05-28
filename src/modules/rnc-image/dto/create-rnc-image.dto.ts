import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRncImageDto {
  @IsNotEmpty()
  @IsUUID()
  nonConformityId: string;

  imageUrl: string;
}

