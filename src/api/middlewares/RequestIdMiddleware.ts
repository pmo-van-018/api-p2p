import * as express from 'express';
import * as httpContext from 'express-http-context';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { v4 as uuidv4 } from 'uuid';
import agent from 'elastic-apm-node';

@Middleware({ type: 'before' })
export class RequestIdMiddleware implements ExpressMiddlewareInterface {
  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const headerName = 'X-Request-Id';
    const id = agent?.currentTraceIds?.['trace.id'] || uuidv4();
    res.set(headerName, id);
    req['requestId'] = id;
    httpContext.set('requestId', id);
    next();
  }
}
