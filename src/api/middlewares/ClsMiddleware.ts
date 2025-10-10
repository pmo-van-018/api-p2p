import { createNamespace } from 'continuation-local-storage';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';
import { Service } from 'typedi';

export const SECURITY_NAMESPACE = 'thread.local.sercurity.context';
export const CURRENT_USER_ID = 'currentUserId';

const securityContextHolder = createNamespace(SECURITY_NAMESPACE);

export type SecurityContext = {
  id: string;
}

@Service()
@Middleware({ type: 'before', priority: 20 })
export class ClsMiddleware implements ExpressMiddlewareInterface {
  use(request: any, response: any, next: (err?: any) => any) {
    securityContextHolder.run(() => {
      next();
    });
  }
}
