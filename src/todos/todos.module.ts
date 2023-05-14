import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { EventsGateway } from '../events/events.gateway';
import { UsersService } from '../users/users.service';

@Module({
  controllers: [TodosController],
  providers: [TodosService, EventsGateway, UsersService],
  exports: [TodosService]
})
export class TodosModule {}
