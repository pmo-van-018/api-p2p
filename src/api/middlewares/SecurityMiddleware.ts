import { env } from '@base/env';
import * as express from 'express';
import helmet from 'helmet';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

@Middleware({ type: 'before', priority: 3 })
export class SecurityMiddleware implements ExpressMiddlewareInterface {
  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    return helmet({
      hsts: {
        maxAge: env.app.hstsMaxAge,
        includeSubDomains: true,
      },
    })(req, res, next);
  }
}
