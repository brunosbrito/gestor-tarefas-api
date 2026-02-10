import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateActivityImageDto {
  @IsNumber()
  @IsNotEmpty()
  activityId: number;

  @IsString()
  @IsNotEmpty()
  imageName: string;

  @IsNotEmpty()
  imagePath: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsNotEmpty()
  createdById: number; // Altere para um ID de usuário em vez da entidade User
}
