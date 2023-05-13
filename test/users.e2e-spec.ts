import { Test } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { UsersService } from '../src/users/users.service';
import { Knex } from 'nestjs-knex';
import knex from 'knex';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { LoginUserDto } from '../src/users/dto/login-user.dto';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let db: Knex;
  let usersService: UsersService;
  const dummyCreateUserDto: CreateUserDto = {
    name: 'test',
    password: 'test'
  }
  const dummyLoginUserDto: LoginUserDto = {
    name: dummyCreateUserDto.name,
    password: dummyCreateUserDto.password
  }

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

  it('GET /users/register shows registration form', async () => {
    const response = await supertest(app.getHttpServer()).get('/users/register')
  
    expect(response.text).toContain('Registration')
  })

  it('GET /users/login shows login form', async () => {
    const response = await supertest(app.getHttpServer()).get('/users/login')

    expect(response.text).toContain('Login')
  })

  /*it('POST /users/register after registration username is visible', async () => {
    const agent = supertest.agent(app.getHttpServer())
    const res = await agent
      .post('/users/register')
      .type('form')
      .send({ name: 'a', password: 'a' })
      

    expect(res.headers.location).toEqual('/todos');
    expect(res.text).toContain('a')
  })*/

});
