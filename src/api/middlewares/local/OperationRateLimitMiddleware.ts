import { UseBefore } from 'routing-controllers';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { LimitBaseMiddleware } from './base/LimitBaseMiddleware';
import { env } from '@base/env';
import { Duration } from '@base/utils/rate-limit/Duration';

export function UseOperationRateLimitMiddleware() {
  return UseBefore(OperationRateLimitMiddleware);
}

export class OperationRateLimitMiddleware extends LimitBaseMiddleware {
  constructor(@Logger(__filename) public log: LoggerInterface) {
    super(log, { limit: env.rateLimitOption.operationLimit, window: (env.rateLimitOption.operationWindow) as Duration });
  }
}
