import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { UserViewByUser } from '@api/profile/types/User';
import { UserProfileService } from '@api/profile/services/UserProfileService';

@Service()
export class GetProfileByUserUseCase {
  constructor(
    private userProfileService: UserProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getProfile(userId: string): Promise<UserViewByUser> {
    this.log.debug(`Start implement GetProfileByUserUseCase: ${userId}`);
    const profile = await this.userProfileService.getUserProfileById(userId);
    this.log.debug(`Stop implement GetProfileByUserUseCase: ${userId}`);
    return profile;
  }
}
