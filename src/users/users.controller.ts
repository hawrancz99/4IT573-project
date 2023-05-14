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
import {
  UpdateUserNameDto,
  UpdateUserPasswordDto,
} from './dto/update-user.dto';
import { EventsGateway } from '../events/events.gateway';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly events: EventsGateway,
  ) {}

  @Get('/register')
  @Render('register')
  renderRegister() {}

  @Post('/register')
  @Redirect('/todos')
  async create(@Body() createBody: CreateUserDto, @Res() res: Response) {
    if (!createBody.name || !createBody.password) {
      return { url: 'error/empty-credentials' };
    }
    const usernameExists = await this.usersService.getUser(createBody);
    if (!usernameExists) {
      const user: User = await this.usersService.createUser(createBody);
      res.cookie('token', user.token);
    } else {
      return { url: 'error/name-exists' };
    }
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
  @Redirect('/users/login')
  signout(@Res() res: Response) {
    res.clearCookie('token');
  }

  @Get('settings')
  @Render('user-settings')
  renderUserSettings() {}

  @Post('update-name')
  @Redirect('/users/settings')
  async updateUser(
    @Body() updateUserNameBody: UpdateUserNameDto,
    @Res() res: Response,
  ) {
    if (!updateUserNameBody.name) return { url: 'error/empty-new-username' };

    if (updateUserNameBody.name === res.locals.user.name)
      return { url: 'error/same-name' };

    const usernameExists = await this.usersService.findUser(
      null,
      updateUserNameBody.name,
    );
    if (usernameExists) return { url: 'error/name-exists' };

    const user = await this.usersService.findUser(
      res.locals.user.id,
      res.locals.user.name,
    );
    if (!user) {
      return { url: 'error/no-user' };
    } else {
      await this.usersService.updateName({
        id: res.locals.user.id,
        name: updateUserNameBody.name,
      });
      this.events.sendUpdatedUserToAllConnections(res.locals.user.id);
    }
  }

  @Post('update-password')
  @Redirect('/users/signout')
  async updatePassowrd(
    @Body() updatePassBody: UpdateUserPasswordDto,
    @Res() res: Response,
  ) {
    if (
      !updatePassBody.oldPassword ||
      !updatePassBody.newPassword ||
      !updatePassBody.newPasswordCheck
    ) {
      return { url: 'error/empty-new-password' };
    }

    const user = await this.usersService.getUser({
      name: res.locals.user.name,
      password: updatePassBody.oldPassword,
    });

    if (!user) {
      return { url: 'error/wrong-current-password' };
    } else if (updatePassBody.newPassword !== updatePassBody.newPasswordCheck) {
      return { url: 'error/wrong-new-password' };
    } else if (updatePassBody.oldPassword === updatePassBody.newPassword) {
      return { url: 'error/same-password' };
    } else {
      await this.usersService.updatePassword(
        { id: res.locals.user.id, name: res.locals.user.name },
        updatePassBody.newPassword,
      );
      this.events.sendSignoutUserToAllConnections(res.locals.user.id);
    }
  }

  @Get('password-changed')
  @Render('password-changed')
  renderPasswordChanged() {}

  @Get('error/:type')
  getError(@Res() res: Response, @Param('type') type: UserError) {
    switch (type) {
      case 'wrong-credentials':
        res.render('errors/wrong-credentials');
        break;
      case 'name-exists':
        res.render('errors/name-exists');
        break;
      case 'empty-credentials':
        res.render('errors/empty-credentials');
        break;
      case 'no-user':
        res.render('errors/no-user');
        break;
      case 'empty-new-username':
        res.render('errors/empty-new-username');
        break;
      case 'empty-new-password':
        res.render('errors/empty-new-password');
        break;
      case 'wrong-current-password':
        res.render('errors/wrong-current-password');
        break;
      case 'wrong-new-password':
        res.render('errors/wrong-new-password');
        break;
      case 'same-password':
        res.render('errors/same-password');
        break;
      case 'same-name':
        res.render('errors/same-name');
        break;
    }
  }
}
