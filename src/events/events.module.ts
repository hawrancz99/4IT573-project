import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { TodosService } from '../todos/todos.service';
import { UsersService } from '../users/users.service';

@Module({
  providers: [EventsGateway, TodosService, UsersService],
})
export class EventsModule {}
