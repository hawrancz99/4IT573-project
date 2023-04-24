import { Injectable, NestMiddleware } from "@nestjs/common";
import { UsersService } from "./users/users.service";

@Injectable()
export class UserMiddleware implements NestMiddleware {

    constructor(private readonly usersService: UsersService){}

    async use(req: any, res: any, next: (error?: any) => void) {
        const token = req.cookies.token;
        if (token) {
          res.locals.user = await this.usersService.getUserByToken(token);
        } else {
          res.locals.user = null;
        }
        next();
    }
}