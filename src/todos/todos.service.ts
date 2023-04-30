import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo, TodoFilter } from './entities/todo.entity';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import { UpdateTodoNameDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  constructor(@InjectKnex() private readonly db: Knex) {}

  async create(createTodoDto: CreateTodoDto) {
    return await this.db.table('todos').insert({
      text: createTodoDto.text,
      priority: createTodoDto.priority,
      deadline: createTodoDto.deadline,
      user_id: createTodoDto.user_id,
    });
  }

  async findAll(userId: number): Promise<Todo[]> {
     const todos = await this.db.table('todos').select('*').where('user_id', userId);
     return todos;
  }

  async findAllByStatus(userId: number, done: number): Promise<Todo[]> {
    return await this.db
      .table('todos')
      .select('*')
      .where('user_id', userId)
      .andWhere('done', done); // SQLlite stores boolean as 1/0
  }

  async getAll(userId: number, filter?: TodoFilter): Promise<Todo[]> {
    let todos: Todo[] = [];
    if (filter) {
      switch (filter) {
        case 'undone':
          todos = await this.findAllByStatus(userId, 0);
          break;
        case 'done':
          todos = await this.findAllByStatus(userId, 1);
          break;
        case 'latest':
          todos = await this.findAll(userId);
          todos.sort((a, b) => b.id - a.id);
          break;
        case 'oldest':
          todos = await this.findAll(userId);
          todos.sort((a, b) => a.id - b.id);
          break;
      }
    } else {
      todos = await this.findAll(userId);
    }
    return todos;
  }

  async findOne(userId:number, id: number): Promise<Todo> {
    return await this.db.table('todos').select('*').where('user_id', userId).andWhere('id', id).first()
  }

  async updateStatus(userId: number, todo: Todo) {
    return await this.db.table('todos').update({ done: !todo.done }).where('id', todo.id).andWhere('user_id', userId)
  }

  async remove(userId: number,id: number) {
    return await this.db.table('todos').delete().where('id', id).andWhere('user_id', userId)
  }

  async updateName(userId: number, updateTodoNameDto: UpdateTodoNameDto, id: number) {
    return await this.db.table('todos').update({ text: updateTodoNameDto.text }).where('id', id).andWhere('user_id', userId)
  }
}
