import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserNameDto } from './dto/update-user.dto';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectKnex() private readonly db: Knex) {}

  async getUserByToken(token: string): Promise<User> {
    const user: User = await this.db.table('users').where({ token }).first();
    return user;
  }

  async getUser(loginUserDto: LoginUserDto): Promise<User> {
    const user: User = await this.getUserByName(loginUserDto.name);
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
      .table('users')
      .insert({ name: createUserDto.name, salt, hash, token })
      .returning('*');

    return user[0];
  }

  async getUserByIdAndName(id: number, name: string): Promise<User> {
    const user: User = await this.db
      .table('users')
      .where('id', id)
      .andWhere('name', name)
      .first();
    return user;
  }

  async getUserByName (name:string): Promise<User>{
    const user: User = await this.db
      .table('users')
      .where({ name })
      .first();
    return user;
  }

  async getUserById (id:number): Promise<User>{
    const user: User = await this.db
      .table('users')
      .where({ id })
      .first();
    return user;
  }

  async updateName(id: number, updateUserNameDto: UpdateUserNameDto) {
    return await this.db
      .table('users')
      .update({ name: updateUserNameDto.name })
      .where('id', id);
  }

  async updatePassword(id: number, name: string, newPassword: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(newPassword, salt, 100000, 64, 'sha512')
      .toString('hex');
    return await this.db
      .table('users')
      .update({ salt, hash })
      .where('id', id)
      .andWhere('name', name);
  }

  findAll() {
    return `This action returns all users`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
