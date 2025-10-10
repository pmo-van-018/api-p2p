
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { LimitBaseMiddleware } from './base/LimitBaseMiddleware';
import { Request, Response } from 'express';
import onFinished from 'on-finished';

import { HttpResponseError } from '@api/common/errors';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';

const VERIFY_OTP_TOKENS = 5;
const VERIFY_OTP_WINDOW = '15m';

export class VerifyOTPAttemptMiddleware extends LimitBaseMiddleware {
 constructor(@Logger(__filename) public log: LoggerInterface) {
   super(log, { limit: VERIFY_OTP_TOKENS, window: VERIFY_OTP_WINDOW, prefix: 'rtl:totp' });
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

    const cleanTracker = async () => {
      const hasError = !res.locals?.body?.data?.success || res.locals?.body?.errors?.length;
      if (res.statusCode === 200 && !hasError) {
        await this.rateLimit.clean(tracker);
      }
    };
    onFinished(res, cleanTracker);

    if (!success) {
      return res.status(429).json(ServiceResult.fail(HttpResponseError.TOO_MANY_REQUEST));
    }

    return next();
  }

}
