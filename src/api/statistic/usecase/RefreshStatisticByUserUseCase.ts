import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SharedVolumeService } from '@api/statistic/services/SharedVolumeService';
import { User } from '@api/profile/models/User';

@Service()
export class RefreshStatisticByUserUseCase {
  constructor(
    private sharedVolumeService: SharedVolumeService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async refreshStatisticByUserUseCase(currentUser: User) {
    this.log.debug(`Start implement RefreshStatisticByUserUseCase for user ${currentUser.id}`);
   await this.sharedVolumeService.refreshStatistic(currentUser);
    this.log.debug(`Stop implement RefreshStatisticByUserUseCase for user ${currentUser.id}`);
  }
}
