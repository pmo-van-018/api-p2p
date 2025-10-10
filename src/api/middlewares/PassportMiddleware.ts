import * as express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import passport from '@api/auth/services/sign-in-with-wallet/passport';

@Middleware({ type: 'before', priority: 2 })
export class PassportMiddleware implements ExpressMiddlewareInterface {
  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    return passport.authenticate('session')(req, res, next);
  }
}
