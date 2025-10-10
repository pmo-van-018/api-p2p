import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { HttpResponseError } from '@api/common/errors';
import { UseBefore } from 'routing-controllers';
import { AuthenticateError } from '@api/auth/errors/AuthenticateError';
import { ROLE_REPORTER } from '@api/constant/auth';

export function ReporterAuthorized() {
  return UseBefore(async (req: any, res: any, next: any): Promise<boolean> => {
    if (req.isUnauthenticated()) {
      return res.status(401).json(ServiceResult.fail(AuthenticateError.UNAUTHORIZED));
    }

    if (req.user?.type === ROLE_REPORTER) {
      return next();
    }

    return res.status(403).json(ServiceResult.fail(HttpResponseError.FORBIDDEN_ERROR));
  });
}
