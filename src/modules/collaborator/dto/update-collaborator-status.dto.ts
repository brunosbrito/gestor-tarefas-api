import { IsBoolean } from 'class-validator';

export class UpdateCollaboratorStatusDto {
  @IsBoolean()
  status: boolean;
}
