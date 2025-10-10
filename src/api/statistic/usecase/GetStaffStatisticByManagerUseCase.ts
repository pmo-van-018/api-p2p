import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { Operation } from '@api/profile/models/Operation';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { StatisticError } from '@api/statistic/errors/StatisticError';
import { GetMerchantOverviewStatisticUseCase } from '@api/statistic/usecase/GetMerchantOverviewStatisticUseCase';

@Service()
export class GetStaffStatisticByManagerUseCase {
  constructor(
    private sharedOperationService: SharedProfileService,
    private getMerchantOverviewStatisticUseCase: GetMerchantOverviewStatisticUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getStatistic(currentUser: Operation, id: string) {
    this.log.debug(`Start implement getStaffStatistic: ${id}`);
    const staff = await this.sharedOperationService.getOperationById(id);

    if (!staff || staff.merchantManagerId !== currentUser.id) {
      return StatisticError.USER_NOT_FOUND;
    }

    const result = await this.getMerchantOverviewStatisticUseCase.getOverviewStatistic(staff);

    this.log.debug(`Stop implement getStaffStatistic: ${id}`);
    return result;
  }
}
