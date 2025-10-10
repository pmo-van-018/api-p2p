import { Action, UnauthorizedError } from 'routing-controllers';
import { Connection } from 'typeorm';
import { Container } from 'typedi';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { OperationType, ROLE_TYPE, UserType } from '@api/common/models/P2PEnum';
import { canSkipRequire2FA } from './TwoFactorAuth';
import { HttpResponseError } from '@api/common/errors';
import { P2PError } from '@api/common/errors/P2PError';
import { CURRENT_USER_ID, SECURITY_NAMESPACE } from '@api/middlewares/ClsMiddleware';
import { getNamespace } from 'continuation-local-storage';

const securityContextHolder = getNamespace(SECURITY_NAMESPACE);

export function authorizationChecker(
  _connection: Connection
): (action: Action, roles: any[]) => Promise<boolean> | boolean {
  const profileService = Container.get<SharedProfileService>(SharedProfileService);
  return async function innerAuthorizationChecker(action: Action, authorizedRoles: string[]): Promise<boolean> {
    if (action.request.isUnauthenticated()) {
      throw new UnauthorizedError('Access denied, you have to login first!');
    }

    // check require 2fa incase user enabled
    if (!canSkipRequire2FA(action.request)) {
      throw new P2PError(HttpResponseError.REQUIRE_ACTIVATE_2FA);
    }

    if (authorizedRoles.length) {
      const user = action.request.user;
      if (profileService.isUserBlocked(user) || user.deletedAt) {
        return false;
      }

      // tslint:disable-next-line:no-unused-expression
      user && securityContextHolder.set(CURRENT_USER_ID, { id: user?.id });

      const userTypeKey = UserType[user.type] ?? OperationType[user.type]; // get USER or MERCHANT
      if (!authorizedRoles.includes(ROLE_TYPE[userTypeKey])) {
        return false;
      }
    }

    return true;
  };
}
