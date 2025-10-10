import { Service } from 'typedi';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import { SharedOrderService } from '@api/order/services/order/SharedOrderService';
import { RevenueAndPriceByPeriodRequest } from '@api/statistic/requests/RevenueAndPriceByPeriodRequest';
import { GroupTypeRevenue, RevenueMaxRangeTime } from '@api/common/models';
import moment from 'moment';
import { OrderError } from '@api/order/errors/OrderError';

@Service()
export class GetRevenueByPeriodUseCase {
  constructor(
    private sharedOrderService: SharedOrderService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getRevenue(revenueAndPriceByPeriodRequest: RevenueAndPriceByPeriodRequest) {
    this.log.debug(`Start implement getTradeVolumes: ${JSON.stringify(revenueAndPriceByPeriodRequest)}`);
    let rangeTimeInvalid = false;
    switch (revenueAndPriceByPeriodRequest.groupType) {
      case GroupTypeRevenue.DAY: {
        rangeTimeInvalid = moment(revenueAndPriceByPeriodRequest.to).diff(revenueAndPriceByPeriodRequest.from, 'days') > RevenueMaxRangeTime.DAY;
        break;
      }
      case GroupTypeRevenue.MONTH: {
        rangeTimeInvalid = moment(revenueAndPriceByPeriodRequest.to).diff(revenueAndPriceByPeriodRequest.from, 'months') > RevenueMaxRangeTime.MONTH;
        break;
      }
      case GroupTypeRevenue.YEAR: {
        rangeTimeInvalid = moment(revenueAndPriceByPeriodRequest.to).diff(revenueAndPriceByPeriodRequest.from, 'years') > RevenueMaxRangeTime.YEAR;
        break;
      }
      default: rangeTimeInvalid = true;
    }
    if (rangeTimeInvalid) {
      return OrderError.REPORT_TIME_INVALID;
    }
    const result = await this.sharedOrderService.getRevenueAndPriceByPeriod(revenueAndPriceByPeriodRequest);

    this.log.debug(`Stop implement getStatisticByUer: ${JSON.stringify(revenueAndPriceByPeriodRequest)}`);

    return result;
  }
}
