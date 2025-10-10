import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { ChartParamsRequest } from '@api/statistic/requests/ChartParamsRequest';
import { Operation } from '@api/profile/models/Operation';
import { VolumeService } from '@api/statistic/services/VolumeService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { OperationError } from '@api/errors/OperationError';
import { OperationType } from '@api/common/models';

@Service()
export class GetChartByAdminUseCase {
  constructor(
    private volumeService: VolumeService,
    private sharedProfileService: SharedProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getChart(
    currentUser: Operation,
    chartParamsRequest: ChartParamsRequest,
    options?: { forceAdmin: boolean }
  ) {
    this.log.debug(`Start implement exportChart with params: ${JSON.stringify(chartParamsRequest)}`);
    const type = chartParamsRequest.type;
    let operation = currentUser;
    if (currentUser.type !== OperationType.SUPER_ADMIN && !options?.forceAdmin) {
      operation = await this.sharedProfileService.getOperationById(chartParamsRequest.userId);
      if (!operation) {
        return OperationError.OPERATION_NOT_FOUND;
      }
    }
    const data = await this.volumeService.getVolumesByOperation(chartParamsRequest, operation.id, operation.type);
    const isEmpty = data.every(
      (e) => Number(e.amountTransaction) === 0 && Number(e.totalFee) === 0 && Number(e.totalPenaltyFee) === 0
    );
    if (isEmpty) {
      return null;
    }

    this.log.debug(`Stop implement exportChart with params: ${JSON.stringify(chartParamsRequest)}`);
    return data && data.length ? this.volumeService.handleVolumeData({ data, type }) : [];
  }
}
