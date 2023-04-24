export class Todo {
    id: number;
    text: string;
    done: boolean;
    priority: string;
    deadline: string;
    user_id: number;
}

export type TodoFilter = 'undone' | 'done' | 'latest' | 'oldest';
export type TodoError = 'empty-text' | 'empty-deadline';

export interface TodoHomePage{
    title: string;
    todos: Todo[];
}

