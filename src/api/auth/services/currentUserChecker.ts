import { Action } from 'routing-controllers';
import { Connection } from 'typeorm';

import { User } from '@api/profile/models/User';

import { getNamespace } from 'continuation-local-storage';

import { CURRENT_USER_ID, SECURITY_NAMESPACE } from '@api/middlewares/ClsMiddleware';

const securityContextHolder = getNamespace(SECURITY_NAMESPACE);

export function currentUserChecker(_connection: Connection): (action: Action) => Promise<User | undefined> {
  return async function innerCurrentUserChecker(action: Action): Promise<User | undefined> {
    try {
      securityContextHolder.set(CURRENT_USER_ID, { id: action.request.user?.id });
    } catch (err) {}
    return action.request.user;
  };
}
