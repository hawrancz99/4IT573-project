import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import * as crypto from 'crypto'
import { User} from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {

  constructor(@InjectKnex() private readonly db: Knex) {}

  async getUserByToken (token: string): Promise<User> {
    const user: User = await this.db.table('users').where({ token }).first();
    return user;
  };

  async getUser (loginUserDto: LoginUserDto): Promise<User> {
    const user: User = await this.db.table('users').where({ name: loginUserDto.name }).first()
    if (!user) return null
  
    const salt = user.salt
    const hash = crypto.pbkdf2Sync(loginUserDto.password, salt, 100000, 64, 'sha512').toString('hex')
    if (hash !== user.hash) return null

    return user
}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(createUserDto.password, salt, 100000, 64, 'sha512').toString('hex')
    const token = crypto.randomBytes(16).toString('hex')

    const user: User[] = await this.db.table('users').insert({ name: createUserDto.name, salt, hash, token }).returning('*')

    return user[0]
  }

  findAll() {
    return `This action returns all users`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
