import { IsUUID, IsString, IsInt, Min } from 'class-validator';

export class CreateWorkforceDto {
  @IsUUID()
  nonConformityId: string;

  @IsString()
  workerName: string;

  @IsString()
  role: string;

  @IsInt()
  @Min(0)
  hoursWorked: number;
}
