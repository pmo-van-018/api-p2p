import { UserType } from '@api/common/models/P2PEnum';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { HttpResponseError } from '@api/common/errors';
import { UseBefore } from 'routing-controllers';
import { AuthenticateError } from '@api/auth/errors/AuthenticateError';

export function UserAuthorized() {
  return UseBefore((req: any, res: any, next: any): Promise<boolean> => {
    const user = req.user;
    if (req.isUnauthenticated()) {
      return res.status(401).json(ServiceResult.fail(AuthenticateError.UNAUTHORIZED));
    }
    if (user?.type === UserType.USER) {
      return next();
    }
    return res.status(403).json(ServiceResult.fail(HttpResponseError.FORBIDDEN_ERROR));
  });
}
