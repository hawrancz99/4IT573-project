import { PickType } from '@nestjs/mapped-types';
import { Todo } from '../entities/todo.entity';

export class UpdateTodoStatusDto extends PickType(Todo,['id','done','user_id']) {}

export class UpdateTodoNameDto extends PickType(Todo,['id','text','user_id']) {}
