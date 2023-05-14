import { OmitType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { User } from '../entities/user.entity';

export class UpdateUserNameDto extends OmitType(CreateUserDto, [
  'password',
] as const) {}

export class UpdateUserPasswordDto {
  oldPassword: string;
  newPassword: string;
  newPasswordCheck: string;
}

export class UpdateUserDto extends PickType(User, ['id', 'name'] as const) {}
