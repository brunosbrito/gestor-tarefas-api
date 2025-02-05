import { IsInt, IsPositive } from 'class-validator';

export class UpdateCompletedQuantityDto {
  @IsInt()
  @IsPositive()
  completedQuantity: number;

  @IsInt()
  @IsPositive()
  changedBy: number;
}
