import { Catch, NotFoundException, ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { join } from "path";

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(_exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.sendFile('errors/404.html',{ root: join(__dirname, '..', 'views')});
  }
}