import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser'

const port = 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.use(cookieParser());
  
  //app.useStaticAssets(join(__dirname, '..', 'public')); TO-DO CHECK if I need that
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  
  await app.listen(port);
  console.log(`Server listening at http://localhost:${port}`);
}
bootstrap();
