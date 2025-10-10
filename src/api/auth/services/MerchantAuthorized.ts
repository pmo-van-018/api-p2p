import Container from 'typedi';

import { MERCHANT_ROLE_TYPE } from '@api/common/models/P2PEnum';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { HttpResponseError } from '@api/common/errors';
import { UseBefore } from 'routing-controllers';
import { AuthenticateError } from '@api/auth/errors/AuthenticateError';
import { AuthMerchantService } from './AuthMerchantService';
import { OperationTwoFactorAuthService } from '@api/auth/services/OperationTwoFactorAuthService';
import { canSkipRequire2FA, verify2FA } from './TwoFactorAuth';
import { VerifyOTPAttemptMiddleware } from '@api/middlewares/local/VerifyOTPAttemptMiddleware';

export function MerchantAuthorized(
  roles?: MERCHANT_ROLE_TYPE[],
  options?: {
    skipRequire2FA?: boolean;
    middlewares?: Array<Function>;
  }
) {
  const middlewares = options?.middlewares?.length ? options.middlewares : [];
  return UseBefore(...middlewares, async (req: any, res: any, next: any): Promise<boolean> => {
    if (req.isUnauthenticated()) {
      return res.status(401).json(ServiceResult.fail(AuthenticateError.UNAUTHORIZED));
    }

    // check require 2fa incase user enabled
    const skipRequire2FA = canSkipRequire2FA(req) || (!canSkipRequire2FA(req) && options?.skipRequire2FA === true);
    if (!skipRequire2FA) {
      return res.status(403).json(ServiceResult.fail(HttpResponseError.REQUIRE_ACTIVATE_2FA));
    }

    const type = req.user?.type;
    if (MERCHANT_ROLE_TYPE[type]) {
      if (!roles || (roles && roles.includes(type))) {
        return next();
      }
    }
    return res.status(403).json(ServiceResult.fail(HttpResponseError.FORBIDDEN_ERROR));
  });
}

export function MerchantAuthorizedWith2FA(roles?: MERCHANT_ROLE_TYPE[]) {
  const authMerchantService = Container.get(AuthMerchantService);
  const operation2FAService = Container.get(OperationTwoFactorAuthService);
  const verify2FAMiddleware = verify2FA(authMerchantService, operation2FAService);
  return UseBefore(VerifyOTPAttemptMiddleware, async (req: any, res: any, next: any): Promise<boolean> => {
    if (req.isUnauthenticated()) {
      return res.status(401).json(ServiceResult.fail(AuthenticateError.UNAUTHORIZED));
    }

    // check require 2fa incase user enabled
    if (!canSkipRequire2FA(req)) {
      return res.status(403).json(ServiceResult.fail(HttpResponseError.REQUIRE_ACTIVATE_2FA));
    }

    const type = req.user?.type;
    if (MERCHANT_ROLE_TYPE[type]) {
      if (!roles || (roles && roles.includes(type))) {
        return await verify2FAMiddleware(req, res, next);
      }
    }

    return res.status(403).json(ServiceResult.fail(HttpResponseError.FORBIDDEN_ERROR));
  });
}
