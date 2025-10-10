import { EventSubscriber, On } from 'event-dispatch';

import { events } from './events';
import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';
import { SessionUtil } from '@base/utils/session.util';

@EventSubscriber()
export class TwoFactorAuthEventSubscriber {
  @On(events.actions.twoFactorAuth.userRegistered)
  public async onUserRegistered2FA(data: { twoFactorAuth: TwoFactorAuth }): Promise<void> {
    // TODO: implement notification
    SessionUtil.destroy(data.twoFactorAuth.userId);
  }

  @On(events.actions.twoFactorAuth.userUnregistered)
  public async onUserUnregistered2FA(data: { twoFactorAuth: TwoFactorAuth }): Promise<void> {
    // TODO: implement notification
    SessionUtil.destroy(data.twoFactorAuth.userId);
  }

  @On(events.actions.twoFactorAuth.operationRegistered)
  public async onOperationRegistered2FA(data: { twoFactorAuth: TwoFactorAuth }): Promise<void> {
    // TODO: implement notification
    SessionUtil.destroy(data.twoFactorAuth.operationId);
  }

  @On(events.actions.twoFactorAuth.operationUnregistered)
  public async onOperationUnregistered2FA(data: { twoFactorAuth: TwoFactorAuth }): Promise<void> {
    // TODO: implement notification
    SessionUtil.destroy(data.twoFactorAuth.operationId);
  }
}
