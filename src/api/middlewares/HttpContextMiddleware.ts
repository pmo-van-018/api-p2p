import * as express from 'express';
import * as httpContext from 'express-http-context';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before' })
export class HttpContextMiddleware implements ExpressMiddlewareInterface {
  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    return httpContext.middleware(req, res, next);
  }
}
