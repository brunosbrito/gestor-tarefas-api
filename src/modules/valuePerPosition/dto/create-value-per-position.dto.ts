import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateValuePerPositionDto {
  @IsString()
  @IsNotEmpty()
  position: string;

  @IsNumber()
  value: number;
}
