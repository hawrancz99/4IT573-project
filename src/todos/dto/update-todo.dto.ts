import { PickType } from '@nestjs/mapped-types';
import { Todo } from '../entities/todo.entity';

export class UpdateTodoNameDto extends PickType(Todo,['text']) {}
