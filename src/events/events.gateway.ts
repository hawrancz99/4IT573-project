import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'ws';
import * as ejs from 'ejs';
import { TodosService } from 'src/todos/todos.service';

@WebSocketGateway(8080)
export class EventsGateway {
  constructor(private readonly todosService: TodosService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  onEvent(data: any): WsResponse {
    return { event: 'message', data: data };
  }

  public async sendTodosToAllConnections(userId: number): Promise<void> {
    const todos = await this.todosService.findAll(userId);
    const html = await ejs.renderFile('views/_todos.ejs', {
      todos,
    });
    const message = {
      type: 'todos',
      html,
      userId
    };
    const json = JSON.stringify(message);
    for (const connection of this.server.clients) {
      connection.send(json);
    }
  }

  public async sendTodoDetailToAllConnections(
    userId: number,
    id: number,
  ): Promise<void> {
    const todo = await this.todosService.findOne(userId, id);
    const html = await ejs.renderFile('views/_todo-detail.ejs', {
      todo,
    });
    for (const connection of this.server.clients) {
      const message = {
        type: 'todo-detail',
        html,
        todoId: todo.id,
        userId
      };
      const json = JSON.stringify(message);
      connection.send(json);
    }
  }

  public async closeTodoDetailConnections(
    id: number,
    deletedFromDetail: boolean,
    userId: number
  ): Promise<void> {
    const html = await ejs.renderFile('views/todo-deleted.ejs');
    for (const connection of this.server.clients) {
      const message = {
        type: 'todo-deleted',
        html,
        todoId: id,
        deletedFromDetail: deletedFromDetail,
        userId
      };
      const json = JSON.stringify(message);
      connection.send(json);
    }
  }
}
