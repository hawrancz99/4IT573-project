import { OmitType } from "@nestjs/mapped-types";
import { Todo } from "../entities/todo.entity";

export class CreateTodoDto extends OmitType(Todo, ['id', 'done'] as const) {}
