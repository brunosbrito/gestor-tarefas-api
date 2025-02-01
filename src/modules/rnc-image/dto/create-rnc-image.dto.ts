import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { NonConformity } from 'src/modules/non-conformity/entities/non-conformity.entity';

export class CreateRncImageDto {
  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsUUID()
  nonConformity: NonConformity;
}
