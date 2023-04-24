import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, Render, Redirect, Res, UseGuards, Catch, Next } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { Todo, TodoError, TodoFilter, TodoHomePage } from './entities/todo.entity';
import { NextFunction, Response } from 'express';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @Render('index')
  async getTodos(
    @Res() res: Response,
    @Query('filter') filter?: TodoFilter,
  ): Promise<TodoHomePage> {
    const todos = await this.todosService.getAll(res.locals.user.id, filter);
    return { title: 'Todos', todos };
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
    }
  }

  @Get('toggle/:id')
  @Redirect('back')
  async toggleStatus(@Res() res: Response, @Param('id') id: number) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    console.log(todo)
    if(todo){
      await this.todosService.updateStatus(res.locals.user.id, todo);
    }
    /*sendTodosToAllConnections(userId);
    sendTodoDetailToAllConnections(userId, id);*/
  }

  /*@Get(':id')
  findOne(@Param('id') id: string) {
    return this.todosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todosService.update(+id, updateTodoDto);
  }*/

  @Get('delete/:id/:fromDetail')
  @Redirect('/')
  async remove(@Res() res: Response,@Param('id') id: number, @Param('fromDetail') fromDetail: boolean) {
    const todo = await this.todosService.findOne(res.locals.user.id, id);
    console.log(todo)
    if(todo){
      await this.todosService.remove(res.locals.user.id,id);

      /*sendTodosToAllConnections(userId); // inform connections viewing todos list
      const deletedFromDetail = req.params.fromDetail === "true";
      closeTodoDetailConnections(id, deletedFromDetail); // inform connections viewing todo detail*/
    }
  }

  @Get('error/:type')
  getError(@Res() res: Response, @Param('type') type: TodoError) {
    if (type === 'empty-text') {
      res.render('errors/error-empty-text');
    } else if (type === 'empty-deadline') {
      res.render('errors/error-empty-deadline');
    }
  }
}
