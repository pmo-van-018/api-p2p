import { UserError } from '@api/profile/errors/UserError';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SessionNonceStore } from '@base/utils/nonce-session.util';
import { ForbiddenError, InternalServerError, UnauthorizedError } from 'routing-controllers';
import { Service } from 'typedi';
import { STRATEGY_MERCHANT } from '@api/constant/auth';
import { OperationType } from '@api/common/models';
import { In } from 'typeorm';
import { BaseAuthService } from '@api/auth/services/BaseAuthService';
import { env } from '@base/env';
import { WalletSignInPassport } from './sign-in-with-wallet/WalletSignInPassport';
import { Operation } from '@api/profile/models/Operation';
import { TwoFactorAuthSecret } from '@api/auth/types/TwoFactorAuth';
import { OperationTwoFactorAuthService } from '@api/auth/services/OperationTwoFactorAuthService';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { Verify2FARequest } from '../requests/Verify2FARequest';
import { Register2FARequest } from '../requests/Register2FARequest';
import { Unregister2FARequest } from '../requests/Unregister2FARequest';
import { events } from '@api/subscribers/events';
import { TwoFactorAuthStatus } from '@api/auth/enums/TwoFactorAuth';
import { TwoFactorAuth } from '@api/auth/models/TwoFactorAuth';
import { IVerify2FA } from '@api/auth/interfaces/IVerify2FA';
import { SessionUtil } from '@base/utils/session.util';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export class AuthMerchantService extends BaseAuthService implements IVerify2FA {
  constructor(
    @Logger(__filename) private log: LoggerInterface,
    private sharedProfileService: SharedProfileService,
    private operation2FAService: OperationTwoFactorAuthService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {
    super(env.app.operationSessionExpire);
    this.initSessionStore();
  }

  public strategyP2PAuthentication(store: SessionNonceStore) {
    return new WalletSignInPassport(
      { name: STRATEGY_MERCHANT, store, passReqToCallback: true },
      async (req, address, cb): Promise<any> => {
        try {
          const operationsRoles: number[] = [OperationType.MERCHANT_MANAGER, OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_SUPPORTER];
          const operation = await this.sharedProfileService.findOneOperationBy(
            {
              walletAddress: address,
              type: In(operationsRoles),
            },
            { withDeleted: true }
          );
          console.log('operationoperationoperationoperation', operation);
          if (!operation) {
            return cb(new ForbiddenError(), null);
          }
          if (this.sharedProfileService.isOperationBlocked(operation) || operation.deletedAt) {
            return cb(new UnauthorizedError(UserError.OPERATION_IS_BLOCKED.key), null);
          }

          this.sharedProfileService.updateOperationLoginAt(operation.id);
          console.log('come to chat user token', operation?.peerChatId);
          const xChatUserToken = {
            'x-chat-user-id': operation.peerChatId,
          };

          const twoFactorAuth = await this.operation2FAService.findOneByUserId(operation.id);
          const isEnabled2FA = twoFactorAuth && (await this.operation2FAService.check2FAIsEnabled(twoFactorAuth));
          console.log('isEnabled2FAisEnabled2FA', isEnabled2FA);
          if (isEnabled2FA) {
            return cb(null, {
              ...operation,
              ...xChatUserToken,
              twoFactorAuth: {
                totpStatus: TwoFactorAuthStatus.ENABLED,
                verified: false,
              },
            });
          }

          console.log('SUccess return callback ddayayyy');
          return cb(null, {
            ...operation,
            ...xChatUserToken,
            twoFactorAuth: {
              totpStatus: TwoFactorAuthStatus.DISABLED,
              verified: false,
            },
          });
        } catch (error: any) {
          console.log('errorerrorerrorerror', error);
          this.log.error(error.name, error.stack);
          return cb(new InternalServerError(error['name']), null);
        }
      }
    );
  }

  public async generate2FASecret(currentUser: Operation): Promise<TwoFactorAuthSecret> {
    return await this.operation2FAService.generateSecret({
      userId: currentUser.id,
      username: currentUser.walletAddress,
    });
  }

  public async register2FA(currentUser: Operation, request: Register2FARequest): Promise<{ success: boolean }> {
    const twoFactorAuth = await this.operation2FAService.findOneByUserId(currentUser.id);
    if (!twoFactorAuth || twoFactorAuth.isEnabled2FA()) {
      return { success: false };
    }

    // verify secret key before enable 2fa
    const check = await this.operation2FAService.check(request.code, twoFactorAuth.totpSecret);
    if (!check) {
      return { success: false };
    }

    const result = await this.operation2FAService.register(currentUser.id);

    if (result.success) {
      if (!result.twoFactorAuth) {
        this.log.warn('[2FA][REGISTER] missing field "twoFactorAuth" when user registered 2fa: ', result);
        return { success: true };
      }
      // NOTE: All the side effects likes destroy sessions, notification, etc...
      // we should use dispatch events and consumer will handle it,
      // we can consider to use outbox to ensure strong consistency,
      // otherwise we can fire and forget.
      this.eventDispatcher.dispatch(events.actions.twoFactorAuth.operationRegistered, {
        twoFactorAuth: result.twoFactorAuth,
      });
    }

    return { success: true };
  }

  public async unregister2FA(currentUser: Operation, request: Unregister2FARequest): Promise<{ success: boolean }> {
    const twoFactorAuth = await this.operation2FAService.findOneByUserId(currentUser.id);
    if (!twoFactorAuth || !twoFactorAuth.isEnabled2FA()) {
      return { success: false };
    }

    // verify secret key before disable 2fa
    const check = await this.operation2FAService.check(request.code, twoFactorAuth.totpSecret);
    if (!check) {
      return { success: false };
    }

    const result = await this.operation2FAService.unregister(twoFactorAuth);
    if (result.success) {
      if (!result.twoFactorAuth) {
        this.log.warn('[2FA][REGISTER] missing field "twoFactorAuth"  when user unregistered 2fa: ', result);
        return { success: true };
      }
      // NOTE: All the side effects likes destroy sessions, notification, etc...
      // we should use dispatch events and consumer will handle it,
      // we can consider to use outbox to ensure strong consistency,
      // otherwise we can fire and forget.
      this.eventDispatcher.dispatch(events.actions.twoFactorAuth.operationUnregistered, {
        twoFactorAuth: result.twoFactorAuth,
      });
    }

    return { success: true };
  }

  public async login2FA(
    currentUser: Operation,
    request: Verify2FARequest
  ): Promise<{ success: boolean; twoFactorAuth: TwoFactorAuth }> {
    const twoFactorAuth = await this.operation2FAService.findOneByUserId(currentUser.id);

    const isEnabled2FA = twoFactorAuth && twoFactorAuth.isEnabled2FA();
    if (!isEnabled2FA) {
      return { success: false, twoFactorAuth: null };
    }

    return {
      success: await this.operation2FAService.check(request.code, twoFactorAuth.totpSecret),
      twoFactorAuth,
    };
  }

  public async verify2FA(currentUser: Operation, request: Verify2FARequest): Promise<{ success: boolean }> {
    const twoFactorAuth = await this.operation2FAService.findOneByUserId(currentUser.id);

    const isEnabled2FA = twoFactorAuth && twoFactorAuth.isEnabled2FA();
    if (!isEnabled2FA) {
      // Due to business, if the user disables 2fa or not using it,
      // we will bypass and return true.
      return { success: true };
    }

    return { success: await this.operation2FAService.check(request.code, twoFactorAuth.totpSecret) };
  }

  protected initSessionMiddleware() {
    this.sessionMiddleware = SessionUtil.getSessionOperationStore();
  }
}
