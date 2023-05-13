import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Render,
  Redirect,
  Res,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import {
  TodoError,
  TodoFilter,
  TodoHomePage,
} from './entities/todo.entity';
import { Response } from 'express';
import { UpdateTodoDeadlineDto, UpdateTodoNameDto, UpdateTodoPriorityDto } from './dto/update-todo.dto';
import { EventsGateway } from 'src/events/events.gateway';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService, private readonly events: EventsGateway) {}

  @Get()
  @Render('index')
  async getTodos(
    @Res() res: Response,
    @Query('filter') filter?: TodoFilter,
  ): Promise<TodoHomePage> {
    const todos = await this.todosService.getAll(res.locals.user.id, filter);
    return { title: 'ToDo App', todos, user: res.locals.user};
  }

  @Get('toggle/:id')
  @Redirect('back')
  async toggleStatus(@Res() res: Response, @Param('id') id: number) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    if (todo) {
      await this.todosService.updateStatus(res.locals.user.id, todo);
    }
    this.events.sendTodosToAllConnections(res.locals.user.id);
    this.events.sendTodoDetailToAllConnections(res.locals.user.id, id);
  }

  @Get('detail/:id')
  @Render('detail')
  async getDetail(@Res() res: Response, @Param('id') id: number) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    if (!todo) {
      res.redirect('/');
    } else {
      return { todo };
    }
  }

  @Get('delete/:id/:fromDetail')
  @Redirect('/')
  async remove(
    @Res() res: Response,
    @Param('id') id: number,
    @Param('fromDetail') fromDetail: string,
  ) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    if (todo) {
      await this.todosService.remove(res.locals.user.id, id);
      this.events.sendTodosToAllConnections(res.locals.user.id); // inform connections viewing todos list
      this.events.closeTodoDetailConnections(id, fromDetail === "true",res.locals.user.id); // inform connections viewing todo detail
    }
  }

  @Get('error/:type')
  getError(@Res() res: Response, @Param('type') type: TodoError) {
    if (type === 'empty-text') {
      res.render('errors/empty-text');
    } else if (type === 'empty-deadline') {
      res.render('errors/empty-deadline');
    }
  }

  @Post('add')
  @Redirect('/')
  async create(@Res() res: Response, @Body() createTodoDto: CreateTodoDto) {
    if (createTodoDto.text.length < 1) {
      return { url: 'error/empty-text' };
    } else if (createTodoDto.deadline.length < 1) {
      return { url: 'error/empty-deadline' };
    } else {
      createTodoDto.user_id = res.locals.user.id;
      await this.todosService.create(createTodoDto);
      this.events.sendTodosToAllConnections(res.locals.user.id);
    }
  }

  @Post('update-name/:id')
  @Redirect('back')
  async updateName(
    @Res() res: Response,
    @Param('id') id: number,
    @Body() updateTodoNameDto: UpdateTodoNameDto,
  ) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    if (todo) {
      await this.todosService.updateName(
        res.locals.user.id,
        updateTodoNameDto,
        id,
      );
      this.events.sendTodosToAllConnections(res.locals.user.id);
      this.events.sendTodoDetailToAllConnections(res.locals.user.id, id);
    }
  }

  @Post('update-priority/:id')
  @Redirect('back')
  async updatePriority(
    @Res() res: Response,
    @Param('id') id: number,
    @Body() updateTodoPriorityDto: UpdateTodoPriorityDto,
  ) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    if (todo && (todo.priority !== updateTodoPriorityDto.priority)) {
      await this.todosService.updatePriority(
        res.locals.user.id,
        updateTodoPriorityDto,
        id,
      );
      this.events.sendTodosToAllConnections(res.locals.user.id);
      this.events.sendTodoDetailToAllConnections(res.locals.user.id, id);
    }
  }

  @Post('update-deadline/:id')
  @Redirect('back')
  async updateDeadline(
    @Res() res: Response,
    @Param('id') id: number,
    @Body() updateTodoDeadlineDto: UpdateTodoDeadlineDto,
  ) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    console.log(todo.deadline,updateTodoDeadlineDto.deadline)
    if (todo && (todo.deadline !== updateTodoDeadlineDto.deadline)) {
      await this.todosService.updateDeadline(
        res.locals.user.id,
        updateTodoDeadlineDto,
        id,
      );
      this.events.sendTodoDetailToAllConnections(res.locals.user.id, id);
    }
  }
}
