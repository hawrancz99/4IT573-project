import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { KnexModule } from 'nestjs-knex';
import { UsersModule } from './users/users.module';
import { auth } from './middleware/auth.middleware';
import { UserMiddleware } from './middleware/user.middleware';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    TodosModule,
    KnexModule.forRoot({
      config: {
        client: 'sqlite3',
        useNullAsDefault: false,
        connection: {
          filename: process.env.NODE_ENV === 'test' ? ':memory:' : './mydb.sqlite',
        },
      },
    }),
    UsersModule,
    EventsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes('/todos','/users/settings','/users/update-name','users/update-password');
    consumer
      .apply(auth)
      .forRoutes('/todos','/users/settings','/users/update-name','users/update-password');
  }
}
