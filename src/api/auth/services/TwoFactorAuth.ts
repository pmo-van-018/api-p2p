import { Request } from 'express';

import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';
import { TwoFactorAuthStatus } from '@api/auth/enums/TwoFactorAuth';
import { ServiceResult } from '@api/infrastructure/helpers/ServiceResult';
import { HttpResponseError } from '@api/common/errors';
import { SessionUtil } from '@base/utils/session.util';
import { IVerify2FA } from '@api/auth/interfaces/IVerify2FA';
import { TwoFactorAuthService } from '@api/auth/services/TwoFactorAuthService';

export function canSkipRequire2FA(request: Request): boolean {
  const twoFactorAuth = request.user?.['twoFactorAuth'] as TwoFactorAuth;
  return (
    !twoFactorAuth ||
    twoFactorAuth.totpStatus === TwoFactorAuthStatus.DISABLED ||
    (twoFactorAuth.totpStatus === TwoFactorAuthStatus.ENABLED && twoFactorAuth['verified'])
  );
}

export function verify2FA(verify2FAService: IVerify2FA, twoFactorAuthService: TwoFactorAuthService): any {
  return async (req: any, res: any, next: any): Promise<any> => {
    const sess2Fa = req.user['twoFactorAuth'] as TwoFactorAuth;
    const twoFactorAuth = sess2Fa ? sess2Fa : await twoFactorAuthService.findOneByUserId(req.user?.['id']); // in case old session does not contain 2fa

    // incase new session have 2fa, but old sessions do not delete cause anything went wrong
    // we will force log out user
    const shouldForceLogoutUser = !sess2Fa && twoFactorAuth && twoFactorAuth.totpStatus === TwoFactorAuthStatus.ENABLED;
    if (shouldForceLogoutUser) {
      SessionUtil.destroy(req.user?.['id']);
      return res.status(403).json(ServiceResult.fail(HttpResponseError.REQUIRE_ACTIVATE_2FA));
    }

    const shouldByPass2FA = !twoFactorAuth || twoFactorAuth?.totpStatus !== TwoFactorAuthStatus.ENABLED;
    if (shouldByPass2FA) {
      return true;
    }

    if (!req.body['code']) {
      return res.status(403).json(ServiceResult.fail(HttpResponseError.REQUIRE_CODE_2FA));
    }

    const { success } = await verify2FAService.verify2FA(req.user, {
      code: req.body['code'], // the request body must have the "code" parameter: Verify2FARequest
    });
    if (!success) {
      return res.status(403).json(ServiceResult.fail(HttpResponseError.VALIDATE_2FA_FAILED));
    }

    return next();
  };
}
