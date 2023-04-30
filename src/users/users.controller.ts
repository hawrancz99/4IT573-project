import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Redirect,
  Render,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserError } from './entities/user.entity';
import { Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/register')
  @Render('register')
  renderRegister() {}

  @Post('/register')
  @Redirect('/')
  async create(@Body() createBody: CreateUserDto, @Res() res: Response) {
    const user: User = await this.usersService.createUser(createBody);
    res.cookie('token', user.token);
  }

  @Get('login')
  @Render('login')
  renderLogin() {}

  @Post('login')
  @Redirect('/')
  async login(@Body() loginBody: LoginUserDto, @Res() res: Response) {
    const user = await this.usersService.getUser(loginBody);
    if (!user) {
      return { url: 'error/wrong-credentials' };
    } else {
      res.cookie('token', user.token);
    }
  }

  @Get('signout')
  @Redirect('/')
  signout(@Res() res: Response) {
    res.clearCookie('token')
  }
  

  @Get('error/:type')
  getError(@Res() res: Response, @Param('type') type: UserError) {
    if (type === 'wrong-credentials') {
      res.render('errors/error-wrong-credentials');
    }
  }

  /*
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }*/
}
