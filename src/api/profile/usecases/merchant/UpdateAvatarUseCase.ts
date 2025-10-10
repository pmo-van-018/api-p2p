import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { MerchantProfileService } from '@api/profile/services/MerchantProfileService';
import { events } from '@api/subscribers/events';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { UserError } from '@api/profile/errors/UserError';

@Service()
export class UpdateAvatarUseCase {
  constructor(
    private merchantProfileService: MerchantProfileService,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateAvatar(userId: string, avatar: string) {
    this.log.debug(`Start implement updateAvatar: ${userId}`);
    const isExist = await this.merchantProfileService.checkAvatarIsExist(avatar);
    if (isExist) {
      return UserError.AVATAR_IS_USED;
    }
    await this.merchantProfileService.updateAvatar(userId, avatar);
    this.eventDispatcher.dispatch(events.actions.operation.onManagerUpdateAvatar);
    this.log.debug(`Stop implement updateAvatar: ${userId}`);
    return null;
  }
}
