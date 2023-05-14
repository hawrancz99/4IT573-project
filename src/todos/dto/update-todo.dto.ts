import { OmitType, PartialType, PickType } from '@nestjs/mapped-types';
import { Todo } from '../entities/todo.entity';

export class UpdateTodoNameDto extends PickType(Todo, ['text']) {}
export class UpdateTodoPriorityDto extends PickType(Todo, ['priority']) {}
export class UpdateTodoDeadlineDto extends PickType(Todo, ['deadline']) {}

export class UpdateTodoDto extends PartialType(
  OmitType(Todo, ['done'] as const),
) {}

export type TodoUpdateField = 'text' | 'priority' | 'deadline';
