import { Injectable } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo, TodoFilter } from './entities/todo.entity';
import { Knex } from 'knex';
import { InjectKnex } from 'nestjs-knex';
import { TodoUpdateField, UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  private static readonly TODO_TABLE = 'todos';

  constructor(@InjectKnex() private readonly db: Knex) {}

  async create(createTodoDto: CreateTodoDto) {
    return await this.db.table(TodosService.TODO_TABLE).insert({
      text: createTodoDto.text,
      priority: createTodoDto.priority,
      deadline: createTodoDto.deadline,
      user_id: createTodoDto.user_id,
    });
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
        case 'priorityDesc':
          todos = await this.findAll(userId);
          todos.sort((a, b) => parseInt(b.priority) - parseInt(a.priority));
          break;
        case 'priorityAsc':
          todos = await this.findAll(userId);
          todos.sort((a, b) => parseInt(a.priority) - parseInt(b.priority));
          break;
      }
    } else {
      todos = await this.findAll(userId);
    }
    return todos;
  }

  async findAll(user_id: number): Promise<Todo[]> {
    const todos = await this.db
      .table(TodosService.TODO_TABLE)
      .select('*')
      .where({ user_id });
    return todos;
  }

  async findAllByStatus(user_id: number, done: number): Promise<Todo[]> {
    return await this.db
      .table(TodosService.TODO_TABLE)
      .select('*')
      .where({ user_id })
      .andWhere({ done });
  }

  async findOne(user_id: number, id: number): Promise<Todo> {
    return await this.db
      .table(TodosService.TODO_TABLE)
      .select('*')
      .where({ user_id })
      .andWhere({ id })
      .first();
  }

  async updateStatus(user_id: number, todo: Todo) {
    return await this.db
      .table(TodosService.TODO_TABLE)
      .update({ done: !todo.done })
      .where('id', todo.id)
      .andWhere({ user_id });
  }

  async updateTodo(updateTodoDto: UpdateTodoDto, field: TodoUpdateField) {
    return await this.db
      .table(TodosService.TODO_TABLE)
      .update({ [field]: updateTodoDto[field] })
      .where('id', updateTodoDto.id)
      .andWhere('user_id', updateTodoDto.user_id);
  }

  async remove(user_id: number, id: number) {
    return await this.db
      .table(TodosService.TODO_TABLE)
      .delete()
      .where({ id })
      .andWhere({ user_id });
  }
}
