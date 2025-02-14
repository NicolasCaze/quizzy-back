import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export interface RequestModel extends Request {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
}
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly firebaseService: AuthService) {}

  public async use(req: RequestModel, _: Response, next: NextFunction) {
    try {
      if (req.user) {
        next(); // Not a very good practice, used to simplify test
        return;
      }
      const { authorization } = req.headers;
      if (!authorization) {
        req.user = null;
        next();
        return;
      }
      req.user = await this.firebaseService.authenticate(authorization);
      next();
    } catch (err) {
      req.user = null;
      next();
    }
  }
}
