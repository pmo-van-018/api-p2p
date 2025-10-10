import * as express from 'express';
import morgan from 'morgan';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { env } from '@base/env';

@Service()
@Middleware({ type: 'before' })
export class LogMiddleware implements ExpressMiddlewareInterface {
  constructor(@Logger(__filename) private log: LoggerInterface) {}

  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    return morgan(env.log.output, {
      stream: {
        write: this.log.info.bind(this.log),
      },
    })(req, res, next);
  }
}
