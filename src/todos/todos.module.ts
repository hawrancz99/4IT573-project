import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { EventsGateway } from 'src/events/events.gateway';

@Module({
  controllers: [TodosController],
  providers: [TodosService, EventsGateway]
})
export class TodosModule {}
