import { Request, Response } from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import md5 from 'md5';

import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { RateLimit } from '@base/utils/rate-limit/RateLimit';
import { RateLimitStrategy } from '@base/utils/rate-limit/RateLimitStrategy';
import redisClient from '@base/utils/redis-client';
import { Context } from '@base/utils/rate-limit/types';
import { HttpResponseError } from '@api/common/errors';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { Duration } from '@base/utils/rate-limit/Duration';

export class LimitBaseMiddleware implements ExpressMiddlewareInterface {
  protected rateLimit: RateLimit<Context>;

  constructor(
    @Logger(__filename) public log: LoggerInterface,
    options: { limit: number; window: Duration; prefix?: string }
  ) {
    this.rateLimit = new RateLimit({
      ctx: { redis: redisClient },
      limiter: RateLimitStrategy.slidingWindowLog(options.limit, options.window),
      prefix: options.prefix ? options.prefix : 'rtl:base',
    });
  }

  public async use(req: Request, res: Response, next?: (err?: any) => any): Promise<any> {
    const tracker = this.getTracker(req);

    const { success, limit, remaining, resetMs, windowMs } = await this.rateLimit.limit(tracker);

    res.setHeader('X-RTL-POLICY', `${limit};w=${windowMs / 1000}`);
    res.setHeader('X-RTL-LIMIT', limit);
    res.setHeader('X-RTL-REMAINING', remaining);
    res.setHeader('X-RTL-RESET', Math.ceil(resetMs / 1000));

    const oldJson = res.json;
    res.json = (body) => {
      res.locals.body = body;
      return oldJson.call(res, body);
    };

    if (!success) {
      return res.status(429).json(ServiceResult.fail(HttpResponseError.TOO_MANY_REQUEST));
    }

    return next();
  }

  protected getTracker(req: Request): string {
    let id = req.user?.['id'] || req.session?.['passport']?.['user']?.['id'];
    if (!id) {
      id = req.ip;
      this.log.warn('limit middlware should use with identifier');
    }
    return md5(`${id}:${req.method}:${req.path}`);
  }
}
