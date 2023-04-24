import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TodosModule } from './todos/todos.module';
import { KnexModule } from 'nestjs-knex';
import { UsersModule } from './users/users.module';
import { auth } from './auth.middleware';
import { UserMiddleware } from './user.middleware';

@Module({
  imports: [
    TodosModule,
    KnexModule.forRoot({
      config: {
        client: 'sqlite3',
        useNullAsDefault: false,
        connection: {
          filename: './mydb.sqlite',
        },
      },
    }),
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserMiddleware)
      .forRoutes('/todos');
    consumer
      .apply(auth)
      .forRoutes('/todos');
  }
}
