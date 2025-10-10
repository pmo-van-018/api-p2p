import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';
import { SharedVolumeService } from '@api/statistic/services/SharedVolumeService';

@Service()
export class RefreshStatisticByOperationUseCase {
  constructor(
    private sharedVolumeService: SharedVolumeService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async refreshStatisticByOperation(currentUser: Operation) {
    this.log.debug(`Start implement refreshStatisticByOperation for operation ${currentUser.id}`);
   await this.sharedVolumeService.refreshStatistic(currentUser);
    this.log.debug(`Stop implement refreshStatisticByOperation for operation ${currentUser.id}`);
  }
}
