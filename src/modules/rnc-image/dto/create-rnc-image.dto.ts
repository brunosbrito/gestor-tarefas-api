import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRncImageDto {
  @IsNotEmpty()
  @IsUUID()
  nonConformityId: string;

  url: string;

  @IsOptional()
  description: string;
}
