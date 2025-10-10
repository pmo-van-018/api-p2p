import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { TradingVolumeByPeriodRequest } from '@api/statistic/requests/TradingVolumeByPeriodRequest';

@Service()
export class GetTradingVolumeByPeriodUseCase {
  constructor(
    private sharedOrderService: SharedOrderService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getTradeVolumes(tradingVolumeByPeriodRequest: TradingVolumeByPeriodRequest) {
    this.log.debug(`Start implement getTradeVolumes: ${JSON.stringify(tradingVolumeByPeriodRequest)}`);
    const result = await this.sharedOrderService.getTradingVolumeByPeriod(tradingVolumeByPeriodRequest);

    this.log.debug(`Stop implement getStatisticByUer: ${JSON.stringify(tradingVolumeByPeriodRequest)}`);

    return result;
  }
}
