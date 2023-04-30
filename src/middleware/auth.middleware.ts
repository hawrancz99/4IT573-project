import { Request, Response, NextFunction } from 'express';

export function auth(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user) {
    next();
  } else {
    res.redirect('/users/login');
  }
}
