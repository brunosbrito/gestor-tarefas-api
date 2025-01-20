export class UpdateUserDto {
  readonly id: number;
  readonly username?: string;
  readonly email?: string;
  readonly password?: string;
  readonly isActive?: boolean;
  readonly role?: string;
}
