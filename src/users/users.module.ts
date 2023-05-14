import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { EventsGateway } from '../events/events.gateway';
import { TodosService } from '../todos/todos.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, EventsGateway, TodosService],
  exports: [UsersService],
})
export class UsersModule {}
