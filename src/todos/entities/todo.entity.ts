import { User } from "src/users/entities/user.entity";

export class Todo {
    id: number;
    text: string;
    done: boolean;
    priority: string;
    deadline: string;
    user_id: number;
}

export type TodoFilter = 'undone' | 'done' | 'latest' | 'oldest' | 'priorityDesc' | 'priorityAsc';
export type TodoError = 'empty-text' | 'empty-deadline';

export interface ITodoHomePage{
    title: string;
    todos: Todo[];
    user: User
}

