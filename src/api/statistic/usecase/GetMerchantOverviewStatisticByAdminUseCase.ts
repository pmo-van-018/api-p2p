import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { OperationType } from '@api/common/models';
import { Operation } from '@api/profile/models/Operation';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { StatisticError } from '@api/statistic/errors/StatisticError';
import { GetMerchantOverviewStatisticUseCase } from '@api/statistic/usecase/GetMerchantOverviewStatisticUseCase';

@Service()
export class GetMerchantOverviewStatisticByAdminUseCase {
  constructor(
    private sharedOperationService: SharedProfileService,
    private getMerchantOverviewStatisticUseCase: GetMerchantOverviewStatisticUseCase,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getOverviewStatistic(currentUser: Operation, merchantId: string) {
    this.log.debug(`Start implement getOverviewStatistic: ${currentUser.id}`);
    const operation = await this.sharedOperationService.getOperationById(merchantId);
    if (!operation || ![OperationType.MERCHANT_OPERATOR, OperationType.MERCHANT_MANAGER].includes(operation.type)) {
      return StatisticError.USER_NOT_FOUND;
    }
    const result = await this.getMerchantOverviewStatisticUseCase.getOverviewStatistic(operation);

    this.log.debug(`Stop implement getStatisticByUer: ${currentUser.id}`);

    return result;
  }
}
