import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { Operation } from '@api/profile/models/Operation';
import { VolumeService } from '@api/statistic/services/VolumeService';
import { OperationError } from '@api/errors/OperationError';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';

@Service()
export class GetChartByMerchantUseCase {
  constructor(
    private volumeService: VolumeService,
    private sharedProfileService: SharedProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getChart(currentUser: Operation, chartParamsRequest: ChartParamsRequest) {
    this.log.debug(`Start implement exportChart with params: ${JSON.stringify(chartParamsRequest)}`);
    const type = chartParamsRequest.type;
    const userId = chartParamsRequest.userId || currentUser.id;
    const staff = await this.sharedProfileService.getOperationById(userId);
    if (!staff || (staff.id !== currentUser.id && staff.merchantManagerId !== currentUser.id)) {
      return OperationError.OPERATION_NOT_FOUND;
    }
    const data = await this.volumeService.getVolumesByOperation(chartParamsRequest, staff.id, staff.type);
    const isEmpty = data.every((e) => Number(e.amountTransaction) === 0 && Number(e.totalFee) === 0 && Number(e.totalPenaltyFee) === 0);
    if (isEmpty) {
      return null;
    }

    this.log.debug(`Stop implement exportChart with params: ${JSON.stringify(chartParamsRequest)}`);
    return data && data.length ? this.volumeService.handleVolumeData({ data, type }) : [];
  }
}
