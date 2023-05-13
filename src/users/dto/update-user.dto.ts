import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserNameDto extends OmitType(CreateUserDto, [
  'password',
] as const) {}

export class UpdateUserPasswordDto {
  oldPassword: string;
  newPassword: string;
  newPasswordCheck: string;
}
