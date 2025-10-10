import { Request, Response } from 'express';
import { ExpressMiddlewareInterface, UseBefore } from 'routing-controllers';
import onFinished from 'on-finished';
import md5 from 'md5';

import { env } from '@base/env';
import { RedlockUtil } from '@base/utils/redlock';
import { Logger } from '@base/utils/logger';

const log = new Logger(__filename);

export function UseLimitMiddleware() {
  return UseBefore(LimitMiddleware);
}

function getTracker(req: Request): string {
  let id = req.user?.['id'] || req.session?.['passport']?.['user']?.['id'];
  if (!id) {
    id = req.ip;
    log.warn('limit middlware should use with identifier');
  }
  return md5(`${id}:${req.method}:${req.path}`);
}

export class LimitMiddleware implements ExpressMiddlewareInterface {
  public async use(req: Request, res: Response, next?: (err?: any) => any): Promise<any> {
    const tracker = getTracker(req);
    let lock = null;
    try {
      lock = await RedlockUtil.acquire(tracker, env.lock.duration, {
        retryCount: 1,
        retryDelay: 100,
      });
    } catch (err) {
      return res.status(200).json();
    }

    async function logRequest() {
      try {
        if (lock) {
          await RedlockUtil.release(lock);
        }
      } catch (err) {
        res.status(200).json();
      }
    }
    onFinished(res, logRequest);
    return next();
  }
}

export async function exactlyOnce(req: Request, fn: any, onAcquireFail: any): Promise<any> {
  const tracker = getTracker(req);
  let lock = null;
  try {
    lock = await RedlockUtil.acquire(tracker, 5000, {
      retryCount: 1,
      retryDelay: 100,
    });

  } catch (err) {
    onAcquireFail();
  }

  try {
    if (lock) {
      return await fn();
    }
    return null;
  } finally {
    try {
      if (lock) {
        await RedlockUtil.release(lock);
      }
    } catch (err) {
      log.error('Exactly once error in releasing lock', err);
    }
  }
}
