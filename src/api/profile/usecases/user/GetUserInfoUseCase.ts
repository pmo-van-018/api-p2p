import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { UserProfileService } from '@api/profile/services/UserProfileService';
import { UserError } from '@api/profile/errors/UserError';
import { env } from '@base/env';
import { setCache } from '@base/utils/redis-client';
import { SharedReferralService } from '@api/referral/services/SharedReferralService';

@Service()
export class GetUserInfoUseCase {
  constructor(
    private userProfileService: UserProfileService,
    private sharedReferralService: SharedReferralService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getInfo(id: string) {
    this.log.debug(`Start implement GetUserInfoUseCase: ${id}`);
    const user = await this.userProfileService.findOneById(id);
    if (!user) {
      return UserError.USER_NOT_FOUND;
    }
    const totalReferred = env.referral.enable
      ? await this.sharedReferralService.countTotalReferredByInviterId(user.id)
      : null;
    setCache(`__cache_user_info#${id}`, user);
    this.log.debug(`End implement GetUserInfoUseCase: ${id}`);
    return { user, totalReferred };
  }
}
