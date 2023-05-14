import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  private static readonly USERS_TABLE = 'users';
  constructor(@InjectKnex() private readonly db: Knex) {}

  async getUserByToken(token: string): Promise<User> {
    const user: User = await this.db
      .table(UsersService.USERS_TABLE)
      .where({ token })
      .first();
    return user;
  }

  async getUser(loginUserDto: LoginUserDto): Promise<User> {
    const user: User = await this.findUser(null, loginUserDto.name);
    if (!user) return null;

    const hash = crypto
      .pbkdf2Sync(loginUserDto.password, user.salt, 100000, 64, 'sha512')
      .toString('hex');
    if (hash !== user.hash) return null;

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(createUserDto.password, salt, 100000, 64, 'sha512')
      .toString('hex');
    const token = crypto.randomBytes(16).toString('hex');

    const user: User[] = await this.db
      .table(UsersService.USERS_TABLE)
      .insert({ name: createUserDto.name, salt, hash, token })
      .returning('*');

    return user[0];
  }

  async findUser(id?: number, name?: string): Promise<User> {
    let query = this.db.table(UsersService.USERS_TABLE);

    if (id) {
      query = query.where({ id });
    }

    if (name) {
      query = query.where({ name });
    }

    const user: User = await query.first();
    return user;
  }

  async updateName(updateUserDto: UpdateUserDto) {
    return await this.db
      .table(UsersService.USERS_TABLE)
      .update({ name: updateUserDto.name })
      .where('id', updateUserDto.id);
  }

  async updatePassword(updateUserDto: UpdateUserDto, newPassword: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(newPassword, salt, 100000, 64, 'sha512')
      .toString('hex');
    return await this.db
      .table(UsersService.USERS_TABLE)
      .update({ salt, hash })
      .where('id', updateUserDto.id)
      .andWhere('name', updateUserDto.name);
  }
}
