import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { TodosService } from 'src/todos/todos.service';

@Module({
  providers: [EventsGateway, TodosService],
  
})
export class EventsModule {}