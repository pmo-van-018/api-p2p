import { UseBefore } from 'routing-controllers';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { LimitBaseMiddleware } from './base/LimitBaseMiddleware';
import { env } from '@base/env';
import { Duration } from '@base/utils/rate-limit/Duration';

export function UseUserRateLimitMiddleware() {
  return UseBefore(UserRateLimitMiddleware);
}

export class UserRateLimitMiddleware extends LimitBaseMiddleware {
  constructor(@Logger(__filename) public log: LoggerInterface) {
    super(log, { limit: env.rateLimitOption.userLimit, window: (env.rateLimitOption.userWindow) as Duration });
  }
}
