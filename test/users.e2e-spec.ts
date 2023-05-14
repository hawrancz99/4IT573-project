import { Test } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { Knex } from 'nestjs-knex';
import knex from 'knex';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { LoginUserDto } from '../src/users/dto/login-user.dto';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';

// dummy objects for tests
const dummyCreateUserDto: CreateUserDto = {
  name: 'test',
  password: 'test'
}
const dummyLoginUserDto: LoginUserDto = {
  name: dummyCreateUserDto.name,
  password: dummyCreateUserDto.password
}

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let db: Knex;
  let usersService: UsersService;
 
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    app = moduleRef.createNestApplication(new ExpressAdapter());
    db = knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:',
      },
      useNullAsDefault: false,
    });
    //todosService = new TodosService(db);
    usersService = new UsersService(db);
    app.setViewEngine('ejs');
    await app.init();
    await db.migrate.latest()
  });

  afterEach(async () => {
    await db.migrate.rollback();
    await db.destroy();

    await app.close();
  });

  it('createUser creates user', async()=>{
    const user = await usersService.createUser(dummyCreateUserDto);

    expect(user.name).toBe(dummyCreateUserDto.name);
    expect(user.hash).not.toBe(dummyCreateUserDto.password)

  })

  it('getUser gets user by password', async () => {
    const dummyLoginUserDtoBadPass: LoginUserDto = {
      name: 'test',
      password: 'bad'
    }
    const dummyLoginUserDtoBadName: LoginUserDto = {
      name: 'bad',
      password: 'test'
    }
    const user = await usersService.createUser(dummyCreateUserDto)
  
    expect(await usersService.getUser(dummyLoginUserDto)).toEqual(user)
    expect(await usersService.getUser(dummyLoginUserDtoBadPass)).not.toEqual(user)
    expect(await usersService.getUser(dummyLoginUserDtoBadName)).not.toEqual(user)
  })

  it('getUserByToken gets user by password', async () => {
    const user = await usersService.createUser(dummyCreateUserDto)
  
    expect(await usersService.getUserByToken(user.token)).toEqual(user)
    expect(await usersService.getUserByToken('bad')).not.toEqual(user)
  })

  it('findUser finds user by name', async () => {
    const user = await usersService.createUser(dummyCreateUserDto)
  
    expect((await usersService.findUser(null,dummyCreateUserDto.name)).name).toEqual(user.name)
  })

  it('findUser finds user by id', async () => {
    const user = await usersService.createUser(dummyCreateUserDto)
  
    expect((await usersService.findUser(1,null)).name).toEqual(user.name);
  })

  it('findUser finds user by id and name', async () => {
    const user = await usersService.createUser(dummyCreateUserDto)
  
    expect((await usersService.findUser(1,user.name)).name).toEqual(user.name);
  })

  it('updateName updates user\'s name', async () => {
    const user = await usersService.createUser(dummyCreateUserDto)

    await usersService.updateName({id:1,name:'newName'})

    await expect(usersService.findUser(null,user.name)).resolves.toBeUndefined();
    expect((await usersService.findUser(1,'newName')).name).toEqual('newName');
  })

  it('updatePassword updates user\'s password', async () => {
    const user = await usersService.createUser(dummyCreateUserDto)

    await usersService.updatePassword({id: 1, name: user.name},'newPassword')

    expect((await usersService.getUser({name: user.name, password: 'newPassword'})).name).toEqual(user.name);
    await expect(usersService.getUser({name: user.name, password: dummyLoginUserDto.password})).resolves.toBeNull()
  })

  it('GET /users/register shows registration form', async () => {
    const response = await supertest(app.getHttpServer()).get('/users/register')
  
    expect(response.text).toContain('Registration')
  })

  it('GET /users/login shows login form', async () => {
    const response = await supertest(app.getHttpServer()).get('/users/login')

    expect(response.text).toContain('Login')
  })

});
