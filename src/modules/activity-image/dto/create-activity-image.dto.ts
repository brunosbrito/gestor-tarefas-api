import { IsNotEmpty, IsString, IsInt, IsNumber } from 'class-validator';

export class CreateActivityImageDto {
  @IsNumber()
  @IsNotEmpty()
  activityId: number;

  @IsString()
  @IsNotEmpty()
  imageName: string;

  @IsNotEmpty()
  imageData: Buffer;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  createdById: number; // Altere para um ID de usuário em vez da entidade User
}
