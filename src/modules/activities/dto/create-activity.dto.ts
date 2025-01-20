import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsArray,
  ArrayMinSize,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(['Planejadas', 'Em execução', 'Concluídas', 'Paralizadas'])
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsString()
  @IsOptional()
  macroTask?: string;

  @IsString()
  @IsOptional()
  process?: string;

  @IsNumber()
  @IsOptional()
  timePerUnit?: number;

  @IsInt()
  @IsOptional()
  unitQuantity?: number;

  @IsString()
  @IsOptional()
  estimatedTime?: string;

  @IsArray()
  @ArrayMinSize(1)
  collaborators: number[];

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsString()
  @IsOptional()
  fileUrl?: string;

  @IsString()
  @IsOptional()
  fileDescription?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  imageDescription?: string;

  @IsNumber()
  @IsNotEmpty()
  projectId: number;

  @IsNumber()
  @IsNotEmpty()
  orderServiceId: number;

  @IsNumber()
  @IsNotEmpty()
  createdBy: User;
}
