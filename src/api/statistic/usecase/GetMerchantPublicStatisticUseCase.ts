import { Service } from 'typedi';
import { StatisticService } from '@api/statistic/services/StatisticService';
import { Logger, LoggerInterface } from '@base/decorators/Logger';
import BigNumber from 'bignumber.js';
import { Helper } from '@api/infrastructure/helpers/Helper';
import { VolumeService } from '@api/statistic/services/VolumeService';
import { SharedProfileService } from '@api/profile/services/SharedProfileService';
import { StatisticError } from '@api/statistic/errors/StatisticError';

@Service()
export class GetMerchantPublicStatisticUseCase {
  constructor(
    private volumeService: VolumeService,
    private statisticService: StatisticService,
    private sharedOperationService: SharedProfileService,
    @Logger(__filename) private log: LoggerInterface
  ) {}

  public async getPublicStatistic(refId: string) {
    this.log.debug(`Start implement getPublicStatistic: ${refId}`);
    const merchant = await this.sharedOperationService.findManagerByRefId(refId);
    if (!merchant) {
      return StatisticError.USER_NOT_FOUND;
    }
    const result = {
      // total data
      totalOrder: 0,
      totalBuyOrder: 0,
      totalSellOrder: 0,
      // recent data
      totalRecentOrder: 0,
      totalRecentBuyOrder: 0,
      totalRecentSellOrder: 0,
      recentCompleteRate: 0,
      user: merchant,
    };

    // Count recent volume
    const recentVolumes = await this.volumeService.getRecentVolume(merchant.id, merchant.type);
    const totalRecentBuyOrder = recentVolumes.reduce(
      (total, e) => new BigNumber(e?.totalBuy || 0).plus(total).toNumber(),
      0
    );
    const totalRecentSellOrder = recentVolumes.reduce(
      (total, e) => new BigNumber(e?.totalSell || 0).plus(total).toNumber(),
      0
    );

    // order type is buy for EU then sell for MC
    result.totalRecentBuyOrder = totalRecentSellOrder;
    result.totalRecentSellOrder = totalRecentBuyOrder;
    result.totalRecentOrder = new BigNumber(result.totalRecentBuyOrder || 0)
      .plus(result.totalRecentSellOrder || 0)
      .toNumber();
    result.recentCompleteRate = Helper.computePercentCalculation(
      recentVolumes.reduce((total, e) => new BigNumber(e?.totalSuccess || 0).plus(total).toNumber(), 0),
      result.totalRecentOrder
    );

    const statistic = await this.statisticService.countAllOperator(merchant.id);
    result.totalOrder = Number(statistic.totalOrderCount);
    result.totalBuyOrder = Number(statistic.totalSellOrderCount);
    result.totalSellOrder = Number(statistic.totalBuyOrderCount);

    this.log.debug(`Stop implement getPublicStatistic: ${merchant.id}`);

    return result;
  }
}
