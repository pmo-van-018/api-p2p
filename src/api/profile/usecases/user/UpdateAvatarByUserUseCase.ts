import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { UserProfileService } from '@api/profile/services/UserProfileService';

@Service()
export class UpdateAvatarByUserUseCase {
  constructor(
    private userProfileService: UserProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async updateAvatar(userId: string, avatar: string) {
    this.log.debug(`Start implement updateAvatar: ${userId}`);
    await this.userProfileService.updateAvatar(userId, avatar);
    this.log.debug(`Stop implement updateAvatar: ${userId}`);
  }
}
