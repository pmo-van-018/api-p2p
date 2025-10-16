import { NotificationType } from '@api/common/models/P2PEnum';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SessionNonceStore } from '@base/utils/nonce-session.util';
import moment from 'moment';
import { ForbiddenError, InternalServerError } from 'routing-controllers';
import { Service } from 'typedi';
import { STRATEGY_USER } from '@api/constant/auth';
import { User } from '@api/profile/models/User';
import { BaseAuthService } from '@api/auth/services/BaseAuthService';
import { env } from '@base/env';
import { USER_TYPE, getPeerChatId } from '@base/utils/chat.utils';
import { generateNickName } from '@base/utils/helper.utils';
import { WalletSignInPassport } from './sign-in-with-wallet/WalletSignInPassport';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { SharedBlacklistService } from '@api/blacklist/services/SharedBlacklistService';

@Service()
export class AuthService extends BaseAuthService {
  constructor(
    @Logger(__filename) private log: LoggerInterface,
    private sharedBlacklistService: SharedBlacklistService,
    private sharedProfileService: SharedProfileService
  ) {
    super(env.app.userSessionExpire);
    this.initSessionStore();
  }

  public strategyP2PAuthentication(store: SessionNonceStore) {
    return new WalletSignInPassport({ name: STRATEGY_USER, store, passReqToCallback: true }, async (req, address, cb) => {
      try {
        const isBlacklisted = await this.sharedBlacklistService.isBlacklisted(address);
        if (isBlacklisted) {
          return cb(new ForbiddenError(), null);
        }
        const user = await this.sharedProfileService.findUserByWalletAddress(address);
        console.log('Check user login', user);
        if (await this.invalidUserLogin(user, address)) {
          console.log('INVALID USERRRRRRRRRR');
          return cb(new ForbiddenError(), null);
        }
        const newUser = await this.getTheLastUserLogin(user, address);
        console.log('newUsernewUsernewUser', newUser);
        const xChatUserToken = {
          'x-chat-user-id': newUser.peerChatId,
        };
        console.log('done strategyP2PAuthentication');
        return cb(null, { ...newUser, ...xChatUserToken });
      } catch (error: any) {
        if (error['errno'] === 1062) {
          // duplicate id
          const user = await this.sharedProfileService.findUserByWalletAddress(address);
          return cb(null, user);
        }

        this.log.error(error.name, error.stack);
        return cb(new InternalServerError(error['name']), null);
      }
    });
  }

  private async invalidUserLogin(user: User, address: string) {
    if (!user) {
      const operation = await this.sharedProfileService.findOneOperationBy({ walletAddress: address }, { withDeleted: true });
      if (operation) {
        return true;
      }
      const walletAddressManagement = await this.sharedProfileService.getManagementWalletAddress(address);
      if (walletAddressManagement) {
        return true;
      }
    }
    return false;
  }

  private async getTheLastUserLogin(user: User, address: string) {
    if (!user) {
      const peerChatId = await getPeerChatId(USER_TYPE.USER);
      return await this.sharedProfileService.createUser({
        walletAddress: address,
        allowNotification: [NotificationType.ALL],
        lastLoginAt: moment().utc().toDate(),
        peerChatId,
        nickName: generateNickName(address),
      });
    }
    await this.sharedProfileService.updateByUserId(user.id, { lastLoginAt: moment().utc().toDate() });
    return user;
  }
}
