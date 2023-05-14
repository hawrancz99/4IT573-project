import { Test } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { Knex } from 'nestjs-knex';
import knex from 'knex';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { CreateTodoDto } from '../src/todos/dto/create-todo.dto';
import { TodosService } from '../src/todos/todos.service';
import { UsersService } from '../src/users/users.service';
import { request } from 'express';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { LoginUserDto } from '../src/users/dto/login-user.dto';
import { Todo } from 'src/todos/entities/todo.entity';
import * as crypto from 'crypto';

// dummy objects for tests
const dummyTodoDto: CreateTodoDto = {
  text: 'Testovací todo!!!',
  priority: '2',
  deadline: new Date().toLocaleDateString('cz-CZ'),
  user_id: 1,
};
const dummyCreateUserDto: CreateUserDto = {
  name: 'test',
  password: 'test',
};
const dummyLoginUserDto: LoginUserDto = {
  name: dummyCreateUserDto.name,
  password: dummyCreateUserDto.password,
};

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;
  let db: Knex;
  let todosService: TodosService;
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
    todosService = new TodosService(db);
    usersService = new UsersService(db);
    app.setViewEngine('ejs');
    await app.init();
    await db.migrate.latest();
  });

  afterEach(async () => {
    await db.migrate.rollback();
    await db.destroy();
    await app.close();
  });

  it('create creates todos', async () => {
    await todosService.create(dummyTodoDto);

    expect((await todosService.findOne(dummyTodoDto.user_id, 1)).text).toEqual(
      dummyTodoDto.text,
    );
  });

  it('findAll finds all todos', async () => {
    const numOfTodos = 2;

    for (let i = 0; i < numOfTodos; i++) {
      await todosService.create(dummyTodoDto);
    }
    expect((await todosService.findAll(dummyTodoDto.user_id)).length).toEqual(
      numOfTodos,
    );
  });

  it('findAllByStatus finds all todos by status', async () => {
    const numOfTodos = 2;
    for (let i = 0; i < numOfTodos; i++) {
      await todosService.create(dummyTodoDto);
    }

    const todo: Todo = {
      id: 1,
      text: dummyTodoDto.text,
      done: false,
      priority: dummyTodoDto.priority,
      deadline: dummyTodoDto.deadline,
      user_id: dummyTodoDto.user_id,
    };
    await todosService.updateStatus(todo.user_id, todo);

    expect(
      (await todosService.findAllByStatus(todo.user_id, 1)).length,
    ).toEqual(1);
    expect((await todosService.findAllByStatus(todo.user_id, 1))[0].id).toEqual(
      1,
    );
    expect(
      (await todosService.findAllByStatus(todo.user_id, 1))[0].done,
    ).toEqual(1);

    expect(
      (await todosService.findAllByStatus(todo.user_id, 0)).length,
    ).toEqual(1);
    expect((await todosService.findAllByStatus(todo.user_id, 0))[0].id).toEqual(
      2,
    );
    expect(
      (await todosService.findAllByStatus(todo.user_id, 0))[0].done,
    ).toEqual(0);
  });

  it("updateStatus updates todo's status", async () => {
    await todosService.create(dummyTodoDto);
    const todo: Todo = {
      id: 1,
      text: dummyTodoDto.text,
      done: false,
      priority: dummyTodoDto.priority,
      deadline: dummyTodoDto.deadline,
      user_id: dummyTodoDto.user_id,
    };

    await todosService.updateStatus(todo.user_id, todo);
    expect((await todosService.findOne(todo.user_id, todo.id)).done).toEqual(1);
    expect(
      (await todosService.findOne(todo.user_id, todo.id)).done,
    ).not.toEqual(0);
  });

  it('updateTodo updates todo text', async () => {
    await todosService.create(dummyTodoDto);

    await todosService.updateTodo(
      { id: 1, user_id: 1, text: 'updatedText' },
      'text',
    );

    expect((await todosService.findOne(1, 1)).text).toEqual('updatedText');
    expect((await todosService.findOne(1, 1)).text).not.toEqual(
      dummyTodoDto.text,
    );
  });

  it('updateTodo updates todo priority', async () => {
    await todosService.create(dummyTodoDto);

    await todosService.updateTodo(
      { id: 1, user_id: 1, priority: '1' },
      'priority',
    );

    expect((await todosService.findOne(1, 1)).priority).toEqual('1');
    expect((await todosService.findOne(1, 1)).priority).not.toEqual(
      dummyTodoDto.priority,
    );
  });

  it('updateTodo updates todo deadline', async () => {
    await todosService.create(dummyTodoDto);

    const date = new Date();
    date.setDate(date.getDate() + 1);

    await todosService.updateTodo(
      { id: 1, user_id: 1, deadline: date.toLocaleDateString('cz-CZ') },
      'deadline',
    );

    expect((await todosService.findOne(1, 1)).deadline).toEqual(
      date.toLocaleDateString('cz-CZ'),
    );
    expect((await todosService.findOne(1, 1)).priority).not.toEqual(
      dummyTodoDto.deadline,
    );
  });

  it('remove removes todo', async () => {
    await todosService.create(dummyTodoDto);
    expect((await todosService.findOne(1, 1)).text).toEqual(dummyTodoDto.text);

    await todosService.remove(1, 1);
    await expect(todosService.findOne(1, 1)).resolves.toBeUndefined();
  });
});
