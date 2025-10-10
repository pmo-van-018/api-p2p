import * as express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import Container from 'typedi';
import { AuthService } from '@api/auth/services/AuthService';
import { AuthAdminService } from '@api/auth/services/AuthAdminService';
import { AuthMerchantService } from '@api/auth/services/AuthMerchantService';
import { env } from '@base/env';
import { SessionUtil } from '@base/utils/session.util';
import { AuthUserPasswordService } from '@api/auth/services/AuthUserPasswordService';

@Middleware({ type: 'before', priority: 4 })
export class SessionMiddleware implements ExpressMiddlewareInterface {
  public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
    const domain = req?.headers?.['x-domain'] || '';
    if (
      domain.includes(env.webDomain.admin) ||
      domain.includes(env.subDomain.admin)
    ) {
      return Container.get(AuthAdminService).getSessionMiddleware()(req, res, next);
    }
    if (
      domain.includes(env.webDomain.operation) ||
      domain.includes(env.subDomain.operation)
    ) {
      return Container.get(AuthMerchantService).getSessionMiddleware()(req, res, next);
    }
    if (
      domain.includes(env.webDomain.reporter) ||
      domain.includes(env.subDomain.reporter)
    ) {
      return Container.get(AuthUserPasswordService).getSessionMiddleware()(req, res, next);
    }
    if (domain.includes(env.webDomain.user)) {
      return Container.get(AuthService).getSessionMiddleware()(req, res, next);
    }
    return SessionUtil.getDefaultSessionStore()(req, res, next);
  }
}
