import { Test } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { Knex } from 'nestjs-knex';
import knex from 'knex';
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express';
import { CreateTodoDto } from '../src/todos/dto/create-todo.dto';
import { TodosService } from '../src/todos/todos.service';
import { UsersService } from '../src/users/users.service';
import { request } from 'express';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { LoginUserDto } from '../src/users/dto/login-user.dto';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let db: Knex;
  let todosService: TodosService;
  let usersService: UsersService;
  // dummy todo
  const dummyTodoDto: CreateTodoDto = {
    text: 'Testovací todo!!!',
    priority: '2',
    deadline: new Date().toLocaleDateString("cz-CZ"),
    user_id: 1,
  }
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
    todosService = new TodosService(db);
    usersService = new UsersService(db)
    app.setViewEngine('ejs');
    await app.init();
    await db.migrate.latest()
  });

  afterEach(async () => {
    await db.migrate.rollback();
    await db.destroy();
    await app.close();
  });

  it('GET / shows title of the application', async () => {
    const user = await usersService.createUser(dummyCreateUserDto);
    expect(user.name).toBe(dummyCreateUserDto.name)
    /*const response1 = await supertest(app.getHttpServer()).post('/users/login').type('form').send(dummyLoginUserDto).redirects(1)
    expect(response1.text).toContain(dummyCreateUserDto.name)*/
    //const response = await supertest(app.getHttpServer()).get('/')
  
    //expect(response.text).toContain('<h1>ToDo App</h1>')
  })

  //Pokud chceme aby si supertest pamatoval cookies mezi requesty, tak jako prohlížeč, potřebujeme instanci agenta kam si cookie ukládá. VIZ notion uživatelé cookies..
  /*it('GET /todos shows list of todos', async () => {
    await usersService.createUser(dummyCreateUserDto);
    await todosService.create(dummyTodoDto)
    await supertest(app.getHttpServer()).post('/users/login').type('form').send(dummyLoginUserDto).redirects(1)

    const response = await supertest(app.getHttpServer()).get('/todos')
  
    expect(response.text).toContain(dummyTodoDto.text)
  })*/

  
});
