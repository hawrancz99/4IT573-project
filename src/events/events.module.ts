import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { TodosService } from 'src/todos/todos.service';
import { UsersService } from 'src/users/users.service';

@Module({
  providers: [EventsGateway, TodosService, UsersService],
  
})
export class EventsModule {}